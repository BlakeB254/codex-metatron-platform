import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenant_access: string[];
  };
  tenant?: {
    tenantId: string;
    tenantName?: string;
  };
}

export const tenantMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required for tenant access',
        timestamp: new Date().toISOString(),
      });
    }

    // Get tenant ID from header, query param, or path
    const tenantId = 
      req.headers['x-tenant-id'] as string ||
      req.query.tenant_id as string ||
      req.params.tenant_id;

    if (!tenantId) {
      // For superadmin, allow access without specific tenant
      if (req.user.role === 'superadmin') {
        return next();
      }

      return res.status(400).json({
        success: false,
        error: 'BadRequest',
        message: 'Tenant ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user has access to this tenant
    if (req.user.role !== 'superadmin' && !req.user.tenant_access.includes(tenantId)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied to this tenant',
        timestamp: new Date().toISOString(),
      });
    }

    // Add tenant context to request
    req.tenant = {
      tenantId,
    };

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Error processing tenant context',
      timestamp: new Date().toISOString(),
    });
  }
};

export const requireTenantAccess = (tenantId: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.user.role !== 'superadmin' && !req.user.tenant_access.includes(tenantId)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied to tenant ${tenantId}`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};