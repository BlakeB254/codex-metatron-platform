import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser, AuthenticatedRequest } from '../types';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Skip auth in development if explicitly disabled
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
    // Mock user for development
    req.user = {
      id: 'dev-user-1',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      role: 'admin',
      tenantId: 'dev-tenant-1',
      permissions: ['*'],
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'No valid authorization token provided',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const secretKey = process.env.JWT_SECRET || 'dev-secret-key';
    const decoded = jwt.verify(token, secretKey) as AuthUser;
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'TokenExpired',
        message: 'Access token has expired',
        timestamp: new Date().toISOString(),
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'InvalidToken',
        message: 'Invalid access token',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'AuthenticationError',
        message: 'Failed to authenticate token',
        timestamp: new Date().toISOString(),
      });
    }
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if user has the required permission or is admin (has * permission)
    const hasPermission = req.user.permissions.includes(permission) || 
                         req.user.permissions.includes('*') ||
                         req.user.role === 'admin';

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required permission: ${permission}`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required role: ${role}`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};