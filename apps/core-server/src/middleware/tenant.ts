import { Request, Response, NextFunction } from 'express';
import { masterDb } from '../server';

interface TenantData {
  id: string;
  name: string;
  api_key: string;
  tier: string;
  status: string;
  db_connection_string?: string;
  settings: any;
  metadata: any;
}

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Skip tenant validation for health checks and auth routes
  if (req.path.startsWith('/health') || req.path.startsWith('/api/auth')) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required',
      code: 'MISSING_API_KEY',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Extract tenant ID from API key format: tenant_${tenantId}_key_${randomString}
    const parts = apiKey.split('_');
    if (parts.length < 4 || parts[0] !== 'tenant' || parts[2] !== 'key') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key format',
        code: 'INVALID_API_KEY_FORMAT',
        timestamp: new Date().toISOString(),
      });
    }

    const tenantId = parts[1];

    // Validate tenant in database
    const result = await masterDb.query(
      `SELECT id, name, api_key, tier, status, db_connection_string, settings, metadata, created_at, updated_at
       FROM tenants 
       WHERE id = $1 AND api_key = $2`,
      [tenantId, apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key',
        code: 'INVALID_API_KEY',
        timestamp: new Date().toISOString(),
      });
    }

    const tenant: TenantData = result.rows[0];

    // Check if tenant is active
    if (tenant.status !== 'active') {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Tenant is ${tenant.status}`,
        code: 'TENANT_INACTIVE',
        timestamp: new Date().toISOString(),
      });
    }

    // Attach tenant data to request
    req.tenant = tenant;

    // Log tenant access
    console.log(`[${req.requestId}] Tenant access: ${tenant.id} (${tenant.name}) - ${req.method} ${req.path}`);

    next();
  } catch (error) {
    console.error(`[${req.requestId}] Tenant middleware error:`, error);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate tenant',
      code: 'TENANT_VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
};

// Utility function to generate API key
export const generateApiKey = (tenantId: string): string => {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
  return `tenant_${tenantId}_key_${randomString}`;
};

// Utility function to extract tenant ID from API key
export const extractTenantId = (apiKey: string): string | null => {
  const parts = apiKey.split('_');
  if (parts.length >= 4 && parts[0] === 'tenant' && parts[2] === 'key') {
    return parts[1];
  }
  return null;
};