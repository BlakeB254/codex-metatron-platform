import express from 'express';
import { masterDb } from '../server';
import { asyncHandler } from '../middleware/error-handler';

const router = express.Router();

// Basic health check
router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    // Test database connection
    await masterDb.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
    });
  }
}));

// Detailed health check
router.get('/detailed', asyncHandler(async (req: express.Request, res: express.Response) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'unknown', responseTime: 0 },
      memory: { status: 'unknown', usage: process.memoryUsage() },
      services: { status: 'unknown', count: 0 },
    },
  };

  try {
    // Database check
    const dbStart = Date.now();
    await masterDb.query('SELECT 1');
    const dbResponseTime = Date.now() - dbStart;
    
    healthData.checks.database = {
      status: 'healthy',
      responseTime: dbResponseTime,
    };

    // Memory check
    const memoryUsage = process.memoryUsage();
    const memoryStatus = memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9 ? 'warning' : 'healthy';
    
    healthData.checks.memory = {
      status: memoryStatus,
      usage: memoryUsage,
    };

    // Services check
    const servicesResult = await masterDb.query(
      'SELECT COUNT(*) as count, COUNT(CASE WHEN status = \'healthy\' THEN 1 END) as healthy_count FROM services'
    );
    
    const serviceCount = parseInt(servicesResult.rows[0].count);
    const healthyCount = parseInt(servicesResult.rows[0].healthy_count);
    
    (healthData.checks.services as any) = {
      status: healthyCount === serviceCount ? 'healthy' : 'warning',
      count: serviceCount,
      healthy_count: healthyCount,
    };

    // Overall status
    const allChecksHealthy = Object.values(healthData.checks).every(check => check.status === 'healthy');
    healthData.status = allChecksHealthy ? 'healthy' : 'warning';

    res.json(healthData);
  } catch (error) {
    console.error('Detailed health check failed:', error);
    healthData.status = 'unhealthy';
    healthData.checks.database.status = 'unhealthy';
    
    res.status(503).json(healthData);
  }
}));

// Service-specific health check
router.get('/services', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const result = await masterDb.query(`
      SELECT name, status, endpoint, last_health_check, response_time_ms, error_count
      FROM services
      ORDER BY name
    `);
    
    res.json({
      timestamp: new Date().toISOString(),
      services: result.rows,
      summary: {
        total: result.rows.length,
        healthy: result.rows.filter(s => s.status === 'healthy').length,
        unhealthy: result.rows.filter(s => s.status === 'unhealthy').length,
        unknown: result.rows.filter(s => s.status === 'unknown').length,
      },
    });
  } catch (error) {
    console.error('Services health check failed:', error);
    res.status(503).json({
      error: 'Failed to check services health',
      timestamp: new Date().toISOString(),
    });
  }
}));

export { router as healthRoutes };