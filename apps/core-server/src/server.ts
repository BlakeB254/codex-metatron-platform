import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { tenantMiddleware } from './middleware/tenant';
import { errorHandler } from './middleware/error-handler';
// Remove auth routes - handled by dedicated auth service
import { tenantRoutes } from './routes/tenant';
import { healthRoutes } from './routes/health';
import { serviceRoutes } from './routes/service';
import { adminRoutes } from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
export const masterDb = new Pool({
  connectionString: process.env.MASTER_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
masterDb.connect()
  .then(() => {
    console.log('✅ Connected to master database');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:5173']
    : ['http://localhost:5173', 'http://localhost:3000'], // Frontend on 5173, API Gateway on 3000
  credentials: true,
}));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 15);
  res.set('X-Request-ID', req.requestId);
  next();
});

// Health check route (before tenant middleware)
app.use('/health', healthRoutes);

// Authentication handled by dedicated auth service

// Admin routes (before tenant middleware)
app.use('/api/admin', adminRoutes);

// Tenant middleware for all other routes (except admin and auth)
app.use((req, res, next) => {
  // Skip tenant middleware for admin routes
  if (req.path.startsWith('/api/admin')) {
    return next();
  }
  return tenantMiddleware(req, res, next);
});

// API routes
app.use('/api/tenants', tenantRoutes);
app.use('/api/services', serviceRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Codex Metatron Platform - Core Server',
    version: '1.0.0',
    port: PORT,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    note: 'Authentication handled by dedicated Auth Service on port 3003',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  masterDb.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  masterDb.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Core Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${process.env.MASTER_DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🌐 CORS: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}`);
  console.log(`🔗 Auth Service: Handled by dedicated service on port 3003`);
});

// TypeScript extensions
declare global {
  namespace Express {
    interface Request {
      tenant?: any;
      requestId?: string;
    }
  }
}

export default app;