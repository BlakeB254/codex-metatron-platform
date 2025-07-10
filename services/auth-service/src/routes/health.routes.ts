import express, { Request, Response } from 'express';
import { authDb } from '../server';

const router = express.Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Auth Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Detailed health check with database connectivity
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const dbHealthStart = Date.now();
    await authDb.query('SELECT 1');
    const dbHealthTime = Date.now() - dbHealthStart;

    res.json({
      success: true,
      service: 'Auth Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        responseTime: `${dbHealthTime}ms`,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      configuration: {
        jwtConfigured: !!process.env.JWT_SECRET,
        databaseConfigured: !!process.env.AUTH_DATABASE_URL || !!process.env.DATABASE_URL,
      },
    });
  } catch (error) {
    console.error('Auth service health check error:', error);
    res.status(503).json({
      success: false,
      service: 'Auth Service',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

// Readiness check
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if service is ready to handle requests
    const requiredEnvVars = ['JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingVars.length > 0) {
      return res.status(503).json({
        success: false,
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        message: 'Missing required configuration',
        missingConfiguration: missingVars,
      });
    }

    // Test database connection
    await authDb.query('SELECT 1');

    res.json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth service readiness check error:', error);
    res.status(503).json({
      success: false,
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Service not ready',
    });
  }
});

// Liveness check
router.get('/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;