import express from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { masterDb } from '../server';
import { generateApiKey } from '../middleware/tenant';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/error-handler';
import { requireAuth, requireSuperAdmin } from '../middleware/auth-middleware';

const router = express.Router();

// Validation schemas
const createTenantSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  tier: z.enum(['free', 'standard', 'premium', 'enterprise']).default('free'),
  settings: z.object({
    features: z.object({
      crm: z.boolean().default(true),
      billing: z.boolean().default(true),
      content: z.boolean().default(true),
      max_users: z.number().default(5),
    }).default({}),
  }).default({ features: {} }),
  metadata: z.record(z.any()).default({}),
});

const updateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  tier: z.enum(['free', 'standard', 'premium', 'enterprise']).optional(),
  status: z.enum(['active', 'suspended', 'cancelled']).optional(),
  settings: z.object({
    features: z.object({
      crm: z.boolean().optional(),
      billing: z.boolean().optional(),
      content: z.boolean().optional(),
      max_users: z.number().optional(),
    }).optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

// Get all tenants (paginated)
router.get('/', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const tier = req.query.tier as string;

  const offset = (page - 1) * limit;
  
  let whereConditions = [];
  let queryParams = [];
  let paramIndex = 1;

  if (search) {
    whereConditions.push(`(name ILIKE $${paramIndex} OR id ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    whereConditions.push(`status = $${paramIndex}`);
    queryParams.push(status);
    paramIndex++;
  }

  if (tier) {
    whereConditions.push(`tier = $${paramIndex}`);
    queryParams.push(tier);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM tenants ${whereClause}`;
  const countResult = await masterDb.query(countQuery, queryParams);
  const totalCount = parseInt(countResult.rows[0].count);

  // Get tenants
  const tenantsQuery = `
    SELECT id, name, api_key, tier, status, created_at, updated_at, metadata
    FROM tenants 
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  const tenantsResult = await masterDb.query(tenantsQuery, [...queryParams, limit, offset]);

  res.json({
    tenants: tenantsResult.rows,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
  });
}));

// Get tenant by ID
router.get('/:id', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  const result = await masterDb.query(
    `SELECT id, name, api_key, tier, status, db_connection_string, settings, metadata, created_at, updated_at
     FROM tenants 
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Tenant not found');
  }

  res.json({
    tenant: result.rows[0],
  });
}));

// Create new tenant
router.post('/', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const tenantData = createTenantSchema.parse(req.body);
  
  const tenantId = uuidv4().substring(0, 8); // Short, unique ID
  const apiKey = generateApiKey(tenantId);

  const result = await masterDb.query(
    `INSERT INTO tenants (id, name, api_key, tier, status, settings, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, api_key, tier, status, created_at, settings, metadata`,
    [
      tenantId,
      tenantData.name,
      apiKey,
      tenantData.tier,
      'active',
      JSON.stringify(tenantData.settings),
      JSON.stringify(tenantData.metadata),
    ]
  );

  const tenant = result.rows[0];

  // Log tenant creation
  console.log(`[AUDIT] Tenant created: ${tenant.id} (${tenant.name}) by admin`);

  res.status(201).json({
    message: 'Tenant created successfully',
    tenant,
  });
}));

// Update tenant
router.put('/:id', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const updates = updateTenantSchema.parse(req.body);

  // Check if tenant exists
  const existingResult = await masterDb.query('SELECT id FROM tenants WHERE id = $1', [id]);
  if (existingResult.rows.length === 0) {
    throw new NotFoundError('Tenant not found');
  }

  // Build update query dynamically
  const updateFields = [];
  const queryParams = [];
  let paramIndex = 1;

  if (updates.name) {
    updateFields.push(`name = $${paramIndex}`);
    queryParams.push(updates.name);
    paramIndex++;
  }

  if (updates.tier) {
    updateFields.push(`tier = $${paramIndex}`);
    queryParams.push(updates.tier);
    paramIndex++;
  }

  if (updates.status) {
    updateFields.push(`status = $${paramIndex}`);
    queryParams.push(updates.status);
    paramIndex++;
  }

  if (updates.settings) {
    updateFields.push(`settings = $${paramIndex}`);
    queryParams.push(JSON.stringify(updates.settings));
    paramIndex++;
  }

  if (updates.metadata) {
    updateFields.push(`metadata = $${paramIndex}`);
    queryParams.push(JSON.stringify(updates.metadata));
    paramIndex++;
  }

  if (updateFields.length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  queryParams.push(id);

  const updateQuery = `
    UPDATE tenants 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, name, api_key, tier, status, settings, metadata, updated_at
  `;

  const result = await masterDb.query(updateQuery, queryParams);

  // Log tenant update
  console.log(`[AUDIT] Tenant updated: ${id} by admin`);

  res.json({
    message: 'Tenant updated successfully',
    tenant: result.rows[0],
  });
}));

// Delete tenant (soft delete by setting status to cancelled)
router.delete('/:id', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  const result = await masterDb.query(
    `UPDATE tenants 
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status != 'cancelled'
     RETURNING id, name`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Tenant not found or already cancelled');
  }

  // Log tenant deletion
  console.log(`[AUDIT] Tenant cancelled: ${id} (${result.rows[0].name}) by admin`);

  res.json({
    message: 'Tenant cancelled successfully',
    tenant: result.rows[0],
  });
}));

// Regenerate API key
router.post('/:id/regenerate-key', requireSuperAdmin, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  // Check if tenant exists
  const existingResult = await masterDb.query('SELECT id, name FROM tenants WHERE id = $1', [id]);
  if (existingResult.rows.length === 0) {
    throw new NotFoundError('Tenant not found');
  }

  const newApiKey = generateApiKey(id);

  const result = await masterDb.query(
    `UPDATE tenants 
     SET api_key = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, name, api_key`,
    [newApiKey, id]
  );

  // Log API key regeneration
  console.log(`[AUDIT] API key regenerated for tenant: ${id} (${result.rows[0].name}) by admin`);

  res.json({
    message: 'API key regenerated successfully',
    tenant: result.rows[0],
  });
}));

// Get tenant statistics
router.get('/:id/stats', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  // Check if tenant exists
  const tenantResult = await masterDb.query('SELECT id, name FROM tenants WHERE id = $1', [id]);
  if (tenantResult.rows.length === 0) {
    throw new NotFoundError('Tenant not found');
  }

  // TODO: Implement tenant-specific statistics
  // This would require connecting to the tenant's database
  
  res.json({
    tenant_id: id,
    stats: {
      users: 0,
      clients: 0,
      products: 0,
      subscriptions: 0,
      // These would be fetched from tenant's database
    },
    last_updated: new Date().toISOString(),
  });
}));

export { router as tenantRoutes };