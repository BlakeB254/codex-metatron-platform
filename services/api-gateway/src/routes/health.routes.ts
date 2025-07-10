import express, { Request, Response } from 'express';
import { serviceRegistry } from '../services/service-registry';

const router = express.Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'API Gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Detailed health check with service status
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const services = await serviceRegistry.getHealthStatus();
    
    const overallHealth = Object.values(services).every(
      (service: any) => service.status === 'healthy'
    );

    res.json({
      success: true,
      service: 'API Gateway',
      status: overallHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      service: 'API Gateway',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Failed to check service health',
    });
  }
});

// Readiness check
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if critical services are available
    const criticalServices = ['core-server', 'auth-service'];
    const services = await serviceRegistry.getHealthStatus();
    
    const readiness = criticalServices.every(serviceName => 
      services[serviceName]?.status === 'healthy'
    );

    if (readiness) {
      res.json({
        success: true,
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        message: 'Critical services are not available',
      });
    }
  } catch (error) {
    console.error('Readiness check error:', error);
    res.status(503).json({
      success: false,
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Failed to check service readiness',
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