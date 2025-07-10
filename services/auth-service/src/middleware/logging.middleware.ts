import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface CustomRequest extends Request {
  requestId?: string;
  startTime?: number;
}

export const loggingMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Generate unique request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Log incoming request (exclude sensitive auth data)
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
  if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';

  console.log(`[${req.requestId}] AUTH ${req.method} ${req.originalUrl}`, {
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    body: sanitizedBody,
    timestamp: new Date().toISOString(),
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - (req.startTime || 0);
    
    // Don't log sensitive response data
    const sanitizedData = { ...data };
    if (sanitizedData.token) sanitizedData.token = '[REDACTED]';
    if (sanitizedData.user?.password_hash) delete sanitizedData.user.password_hash;
    
    console.log(`[${req.requestId}] AUTH Response ${res.statusCode}`, {
      duration: `${duration}ms`,
      responseSize: JSON.stringify(data).length,
      data: sanitizedData,
      timestamp: new Date().toISOString(),
    });

    return originalJson.call(this, data);
  };

  next();
};

export const securityLogger = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Log security-related events
  const securityEvents = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/change-password',
    '/api/auth/reset-password',
  ];

  if (securityEvents.includes(req.path)) {
    console.log(`[SECURITY] [${req.requestId}] ${req.method} ${req.path}`, {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
  }

  next();
};