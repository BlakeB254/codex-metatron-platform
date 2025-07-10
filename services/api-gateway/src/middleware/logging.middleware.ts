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

  // Log incoming request
  console.log(`[${req.requestId}] ${req.method} ${req.originalUrl}`, {
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    referer: req.headers.referer,
    timestamp: new Date().toISOString(),
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - (req.startTime || 0);
    
    console.log(`[${req.requestId}] Response ${res.statusCode}`, {
      duration: `${duration}ms`,
      contentLength: JSON.stringify(data).length,
      timestamp: new Date().toISOString(),
    });

    return originalJson.call(this, data);
  };

  // Override res.send to log response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - (req.startTime || 0);
    
    console.log(`[${req.requestId}] Response ${res.statusCode}`, {
      duration: `${duration}ms`,
      contentLength: typeof data === 'string' ? data.length : JSON.stringify(data).length,
      timestamp: new Date().toISOString(),
    });

    return originalSend.call(this, data);
  };

  next();
};

export const performanceLogger = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    if (duration > 1000) { // Log slow requests (>1s)
      console.warn(`[${req.requestId}] SLOW REQUEST`, {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};