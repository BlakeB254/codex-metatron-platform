import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { masterDb } from '../server';
import { UnauthorizedError, ForbiddenError } from './error-handler';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    tenant_access: string[];
  };
}

// Middleware to require authentication
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Verify user still exists and is active
    const result = await masterDb.query(
      'SELECT id, email, role, tenant_access, is_active FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      throw new UnauthorizedError('Invalid token or inactive user');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
};

// Middleware to require superadmin role
export const requireSuperAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'superadmin') {
      throw new ForbiddenError('Superadmin access required');
    }
    next();
  });
};

// Middleware to require admin role (admin or superadmin)
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
      throw new ForbiddenError('Admin access required');
    }
    next();
  });
};

// Middleware to check tenant access for admin users
export const requireTenantAccess = (tenantIdParam: string = 'tenantId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await requireAuth(req, res, () => {
      const tenantId = req.params[tenantIdParam];
      
      // Superadmin has access to all tenants
      if (req.user?.role === 'superadmin') {
        return next();
      }

      // Admin users need tenant_access array to include the tenant
      if (req.user?.role === 'admin') {
        if (!req.user.tenant_access || !req.user.tenant_access.includes(tenantId)) {
          throw new ForbiddenError('Access denied for this tenant');
        }
        return next();
      }

      throw new ForbiddenError('Insufficient permissions');
    });
  };
};

// Utility function to extract user from token (optional auth)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const result = await masterDb.query(
        'SELECT id, email, role, tenant_access, is_active FROM admins WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length > 0 && result.rows[0].is_active) {
        req.user = result.rows[0];
      }
    }
    
    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue without user
    next();
  }
};