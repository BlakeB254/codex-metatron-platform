import express from 'express';
import axios from 'axios';
import { masterDb } from '../server';
import { asyncHandler } from '../middleware/error-handler';
import { requireAuth } from '../middleware/auth-middleware';

const router = express.Router();

// Get all services health status
router.get('/health', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const result = await masterDb.query(`
    SELECT name, status, endpoint, last_health_check, response_time_ms, error_count, metadata
    FROM services
    ORDER BY name
  `);

  res.json(result.rows);
}));

// Check health of all services (manual trigger)
router.post('/health/check', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const servicesResult = await masterDb.query('SELECT name, endpoint FROM services');
  const services = servicesResult.rows;

  const healthCheckPromises = services.map(async (service) => {
    const startTime = Date.now();
    let status = 'unknown';
    let responseTime = 0;
    let errorCount = 0;

    try {
      const response = await axios.get(service.endpoint, {
        timeout: 5000,
        headers: {
          'User-Agent': 'CDX-Platform-Health-Check',
        },
      });

      responseTime = Date.now() - startTime;
      status = response.status === 200 ? 'healthy' : 'unhealthy';
    } catch (error) {
      responseTime = Date.now() - startTime;
      status = 'unhealthy';
      errorCount = 1;
      console.error(`Health check failed for ${service.name}:`, error.message);
    }

    // Update service status in database
    await masterDb.query(`
      UPDATE services 
      SET status = $1, 
          last_health_check = CURRENT_TIMESTAMP,
          response_time_ms = $2,
          error_count = CASE 
            WHEN $1 = 'healthy' THEN 0 
            ELSE error_count + $3 
          END
      WHERE name = $4
    `, [status, responseTime, errorCount, service.name]);

    return {
      name: service.name,
      status,
      endpoint: service.endpoint,
      responseTime,
      error: errorCount > 0,
    };
  });

  const results = await Promise.all(healthCheckPromises);

  res.json({
    message: 'Health check completed',
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length,
    },
  });
}));

// Get specific service health
router.get('/:serviceName/health', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { serviceName } = req.params;

  const result = await masterDb.query(`
    SELECT name, status, endpoint, last_health_check, response_time_ms, error_count, metadata
    FROM services
    WHERE name = $1
  `, [serviceName]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Service not found',
      service: serviceName,
    });
  }

  res.json(result.rows[0]);
}));

// Register a new service
router.post('/register', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { name, endpoint, metadata } = req.body;

  if (!name || !endpoint) {
    return res.status(400).json({
      error: 'Service name and endpoint are required',
    });
  }

  try {
    const result = await masterDb.query(`
      INSERT INTO services (name, endpoint, metadata)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO UPDATE SET
        endpoint = EXCLUDED.endpoint,
        metadata = EXCLUDED.metadata
      RETURNING name, endpoint, status, metadata
    `, [name, endpoint, JSON.stringify(metadata || {})]);

    res.json({
      message: 'Service registered successfully',
      service: result.rows[0],
    });
  } catch (error) {
    console.error('Service registration failed:', error);
    res.status(500).json({
      error: 'Failed to register service',
      details: error.message,
    });
  }
}));

// Update service configuration
router.put('/:serviceName', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { serviceName } = req.params;
  const { endpoint, metadata } = req.body;

  const updateFields = [];
  const queryParams = [];
  let paramIndex = 1;

  if (endpoint) {
    updateFields.push(`endpoint = $${paramIndex}`);
    queryParams.push(endpoint);
    paramIndex++;
  }

  if (metadata) {
    updateFields.push(`metadata = $${paramIndex}`);
    queryParams.push(JSON.stringify(metadata));
    paramIndex++;
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      error: 'No valid fields to update',
    });
  }

  queryParams.push(serviceName);

  const result = await masterDb.query(`
    UPDATE services 
    SET ${updateFields.join(', ')}
    WHERE name = $${paramIndex}
    RETURNING name, endpoint, status, metadata
  `, queryParams);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Service not found',
      service: serviceName,
    });
  }

  res.json({
    message: 'Service updated successfully',
    service: result.rows[0],
  });
}));

// Remove service
router.delete('/:serviceName', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { serviceName } = req.params;

  const result = await masterDb.query(`
    DELETE FROM services 
    WHERE name = $1
    RETURNING name
  `, [serviceName]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      error: 'Service not found',
      service: serviceName,
    });
  }

  res.json({
    message: 'Service removed successfully',
    service: result.rows[0].name,
  });
}));

// Get service statistics
router.get('/stats', requireAuth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const result = await masterDb.query(`
    SELECT 
      COUNT(*) as total_services,
      COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_services,
      COUNT(CASE WHEN status = 'unhealthy' THEN 1 END) as unhealthy_services,
      COUNT(CASE WHEN status = 'unknown' THEN 1 END) as unknown_services,
      AVG(response_time_ms) as avg_response_time,
      MAX(response_time_ms) as max_response_time,
      MIN(response_time_ms) as min_response_time,
      SUM(error_count) as total_errors
    FROM services
  `);

  const stats = result.rows[0];

  res.json({
    timestamp: new Date().toISOString(),
    services: {
      total: parseInt(stats.total_services),
      healthy: parseInt(stats.healthy_services),
      unhealthy: parseInt(stats.unhealthy_services),
      unknown: parseInt(stats.unknown_services),
    },
    performance: {
      avgResponseTime: parseFloat(stats.avg_response_time) || 0,
      maxResponseTime: parseInt(stats.max_response_time) || 0,
      minResponseTime: parseInt(stats.min_response_time) || 0,
    },
    errors: {
      total: parseInt(stats.total_errors) || 0,
    },
  });
}));

export { router as serviceRoutes };