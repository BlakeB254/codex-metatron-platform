import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

// Import middleware
import { authMiddleware } from './middleware/auth.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { errorHandler } from './middleware/error.middleware';

// Import services
import { serviceRegistry } from './services/service-registry';
import { loadBalancer } from './services/load-balancer';

// Import routes
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 2000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(loggingMiddleware);

// Health check (no auth required)
app.use('/health', healthRoutes);

// Auth routes (public)
app.use('/auth', authRoutes);

// Authentication middleware for protected routes
app.use('/api', authMiddleware);
app.use('/api', tenantMiddleware);

// Service proxy routes
app.use('/api/crm', createProxyMiddleware({
  target: process.env.CRM_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/crm': '/api'
  },
  onError: (err, req, res) => {
    console.error('CRM Service Proxy Error:', err);
    res.status(503).json({
      success: false,
      error: 'ServiceUnavailable',
      message: 'CRM service is currently unavailable',
      timestamp: new Date().toISOString(),
    });
  },
  onProxyReq: (proxyReq, req) => {
    // Forward auth headers
    const authHeader = req.headers.authorization;
    if (authHeader) {
      proxyReq.setHeader('Authorization', authHeader);
    }
    
    // Forward tenant context
    const tenantId = (req as any).tenant?.tenantId;
    if (tenantId) {
      proxyReq.setHeader('X-Tenant-ID', tenantId);
    }
  }
}));

app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api'
  },
  onError: (err, req, res) => {
    console.error('Auth Service Proxy Error:', err);
    res.status(503).json({
      success: false,
      error: 'ServiceUnavailable',
      message: 'Authentication service is currently unavailable',
      timestamp: new Date().toISOString(),
    });
  }
}));

app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api'
  },
  onError: (err, req, res) => {
    console.error('Notification Service Proxy Error:', err);
    res.status(503).json({
      success: false,
      error: 'ServiceUnavailable',
      message: 'Notification service is currently unavailable',
      timestamp: new Date().toISOString(),
    });
  },
  onProxyReq: (proxyReq, req) => {
    // Forward auth headers
    const authHeader = req.headers.authorization;
    if (authHeader) {
      proxyReq.setHeader('Authorization', authHeader);
    }
    
    // Forward tenant context
    const tenantId = (req as any).tenant?.tenantId;
    if (tenantId) {
      proxyReq.setHeader('X-Tenant-ID', tenantId);
    }
  }
}));

app.use('/api/analytics', createProxyMiddleware({
  target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/analytics': '/api'
  },
  onError: (err, req, res) => {
    console.error('Analytics Service Proxy Error:', err);
    res.status(503).json({
      success: false,
      error: 'ServiceUnavailable',
      message: 'Analytics service is currently unavailable',
      timestamp: new Date().toISOString(),
    });
  },
  onProxyReq: (proxyReq, req) => {
    // Forward auth headers
    const authHeader = req.headers.authorization;
    if (authHeader) {
      proxyReq.setHeader('Authorization', authHeader);
    }
    
    // Forward tenant context
    const tenantId = (req as any).tenant?.tenantId;
    if (tenantId) {
      proxyReq.setHeader('X-Tenant-ID', tenantId);
    }
  }
}));

// Catch-all for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: 'API endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: 'Resource not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  serviceRegistry.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  serviceRegistry.disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Auth enabled: ${process.env.DISABLE_AUTH !== 'true'}`);
  console.log('🎯 Proxying to services:');
  console.log(`   CRM: ${process.env.CRM_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`   Auth: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3002'}`);
  console.log(`   Notifications: ${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'}`);
  console.log(`   Analytics: ${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004'}`);
  
  // Initialize service registry
  serviceRegistry.connect();
});

export default app;