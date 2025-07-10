import express from 'express';
import { z } from 'zod';
import { masterDb } from '../server';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/error-handler';
import { requireAuth, requireSuperAdmin } from '../middleware/auth-middleware';

const router = express.Router();

// Validation schemas
const dashboardStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('day'),
});

// Get dashboard statistics
router.get('/dashboard/stats', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { period } = dashboardStatsSchema.parse(req.query);

  // Get tenant statistics
  const tenantStatsResult = await masterDb.query(`
    SELECT 
      COUNT(*) as total_tenants,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
      COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_tenants,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tenants
    FROM tenants
  `);

  // Get service health statistics
  const serviceStatsResult = await masterDb.query(`
    SELECT 
      COUNT(*) as total_services,
      COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_services,
      COUNT(CASE WHEN status = 'unhealthy' THEN 1 END) as unhealthy_services,
      AVG(response_time_ms) as avg_response_time
    FROM services
  `);

  // Get recent audit activity count
  const auditStatsResult = await masterDb.query(`
    SELECT COUNT(*) as recent_activities
    FROM audit_log 
    WHERE created_at >= NOW() - INTERVAL '24 hours'
  `);

  // Get alert count
  const alertStatsResult = await masterDb.query(`
    SELECT 
      COUNT(*) as total_alerts,
      COUNT(CASE WHEN type = 'critical' THEN 1 END) as critical_alerts
    FROM notifications 
    WHERE type IN ('error', 'warning') AND expires_at > NOW()
  `);

  const tenantStats = tenantStatsResult.rows[0];
  const serviceStats = serviceStatsResult.rows[0];
  const auditStats = auditStatsResult.rows[0];
  const alertStats = alertStatsResult.rows[0];

  // Calculate system health percentage
  const totalServices = parseInt(serviceStats.total_services) || 1;
  const healthyServices = parseInt(serviceStats.healthy_services) || 0;
  const systemHealth = Math.round((healthyServices / totalServices) * 100);

  res.json({
    stats: {
      total_tenants: parseInt(tenantStats.total_tenants),
      active_tenants: parseInt(tenantStats.active_tenants),
      suspended_tenants: parseInt(tenantStats.suspended_tenants),
      cancelled_tenants: parseInt(tenantStats.cancelled_tenants),
      total_services: parseInt(serviceStats.total_services),
      healthy_services: parseInt(serviceStats.healthy_services),
      unhealthy_services: parseInt(serviceStats.unhealthy_services),
      system_health: systemHealth,
      avg_response_time: parseFloat(serviceStats.avg_response_time) || 0,
      recent_activities: parseInt(auditStats.recent_activities),
      active_alerts: parseInt(alertStats.total_alerts),
      critical_alerts: parseInt(alertStats.critical_alerts),
    },
    period,
    generated_at: new Date().toISOString(),
  });
}));

// Get notifications
router.get('/notifications', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const unreadOnly = req.query.unread_only === 'true';
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  let whereConditions = [`target_audience IN ('all', '${req.user?.role}')`];
  
  if (unreadOnly) {
    whereConditions.push('is_read = false');
  }

  whereConditions.push('(expires_at IS NULL OR expires_at > NOW())');

  const whereClause = whereConditions.join(' AND ');

  const result = await masterDb.query(`
    SELECT id, type, title, message, target_audience, is_read, expires_at, created_at, metadata
    FROM notifications 
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  res.json({
    notifications: result.rows,
    has_more: result.rows.length === limit,
  });
}));

// Mark notification as read
router.put('/notifications/:id/read', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  await masterDb.query(
    'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );

  res.json({
    message: 'Notification marked as read',
  });
}));

// Get recent activity/audit logs
router.get('/activity', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  const tenantId = req.query.tenant_id as string;
  const action = req.query.action as string;

  let whereConditions = [];
  let queryParams = [];
  let paramIndex = 1;

  if (tenantId) {
    whereConditions.push(`tenant_id = $${paramIndex}`);
    queryParams.push(tenantId);
    paramIndex++;
  }

  if (action) {
    whereConditions.push(`action ILIKE $${paramIndex}`);
    queryParams.push(`%${action}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  queryParams.push(limit, offset);

  const result = await masterDb.query(`
    SELECT 
      al.id, al.tenant_id, al.action, al.resource_type, al.resource_id, 
      al.details, al.created_at, al.ip_address,
      a.email as admin_email,
      t.name as tenant_name
    FROM audit_log al
    LEFT JOIN admins a ON al.admin_id = a.id
    LEFT JOIN tenants t ON al.tenant_id = t.id
    ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT $${paramIndex - 1} OFFSET $${paramIndex}
  `, queryParams);

  res.json({
    activities: result.rows,
    has_more: result.rows.length === limit,
  });
}));

// Get system configuration
router.get('/system/config', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const result = await masterDb.query(`
    SELECT key, value, description, updated_at
    FROM system_config
    ORDER BY key
  `);

  const config = result.rows.reduce((acc, row) => {
    acc[row.key] = {
      value: row.value,
      description: row.description,
      updated_at: row.updated_at,
    };
    return acc;
  }, {});

  res.json({
    config,
  });
}));

// Update system configuration
router.put('/system/config', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { key, value, description } = req.body;

  if (!key || value === undefined) {
    throw new ValidationError('Key and value are required');
  }

  await masterDb.query(`
    INSERT INTO system_config (key, value, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (key) 
    DO UPDATE SET 
      value = EXCLUDED.value,
      description = COALESCE(EXCLUDED.description, system_config.description),
      updated_at = CURRENT_TIMESTAMP
  `, [key, JSON.stringify(value), description]);

  // Log configuration change
  await masterDb.query(`
    INSERT INTO audit_log (admin_id, action, resource_type, resource_id, details)
    VALUES ($1, 'update_system_config', 'system_config', $2, $3)
  `, [
    req.user?.id,
    key,
    JSON.stringify({ key, old_value: 'redacted', new_value: 'redacted' })
  ]);

  res.json({
    message: 'Configuration updated successfully',
  });
}));

// Get admin users
router.get('/admins', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const result = await masterDb.query(`
    SELECT id, email, role, tenant_access, created_at, updated_at, last_login, is_active
    FROM admins
    ORDER BY created_at DESC
  `);

  res.json({
    admins: result.rows,
  });
}));

// Create admin user
router.post('/admins', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, password, role, tenant_access } = req.body;

  if (!email || !password || !role) {
    throw new ValidationError('Email, password, and role are required');
  }

  // Check if admin already exists
  const existingResult = await masterDb.query('SELECT id FROM admins WHERE email = $1', [email]);
  if (existingResult.rows.length > 0) {
    throw new ValidationError('Admin with this email already exists');
  }

  // Hash password
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await masterDb.query(`
    INSERT INTO admins (email, password_hash, role, tenant_access)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, role, tenant_access, created_at, is_active
  `, [email, passwordHash, role, tenant_access || null]);

  // Log admin creation
  await masterDb.query(`
    INSERT INTO audit_log (admin_id, action, resource_type, resource_id, details)
    VALUES ($1, 'create_admin', 'admin', $2, $3)
  `, [
    req.user?.id,
    result.rows[0].id,
    JSON.stringify({ email, role, tenant_access })
  ]);

  res.status(201).json({
    message: 'Admin created successfully',
    admin: result.rows[0],
  });
}));

// Update admin user
router.put('/admins/:id', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { role, tenant_access, is_active } = req.body;

  const updateFields = [];
  const queryParams = [];
  let paramIndex = 1;

  if (role) {
    updateFields.push(`role = $${paramIndex}`);
    queryParams.push(role);
    paramIndex++;
  }

  if (tenant_access !== undefined) {
    updateFields.push(`tenant_access = $${paramIndex}`);
    queryParams.push(tenant_access);
    paramIndex++;
  }

  if (is_active !== undefined) {
    updateFields.push(`is_active = $${paramIndex}`);
    queryParams.push(is_active);
    paramIndex++;
  }

  if (updateFields.length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  queryParams.push(id);

  const result = await masterDb.query(`
    UPDATE admins 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, email, role, tenant_access, is_active, updated_at
  `, queryParams);

  if (result.rows.length === 0) {
    throw new NotFoundError('Admin not found');
  }

  // Log admin update
  await masterDb.query(`
    INSERT INTO audit_log (admin_id, action, resource_type, resource_id, details)
    VALUES ($1, 'update_admin', 'admin', $2, $3)
  `, [
    req.user?.id,
    id,
    JSON.stringify({ role, tenant_access, is_active })
  ]);

  res.json({
    message: 'Admin updated successfully',
    admin: result.rows[0],
  });
}));

export { router as adminRoutes };