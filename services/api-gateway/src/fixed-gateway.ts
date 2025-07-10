import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    port: PORT
  });
});

// Auth routes - proxy to auth service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api'
  },
  timeout: 5000,
  onError: (err, req, res) => {
    console.error('Auth proxy error:', err);
    res.status(500).json({ error: 'Auth service unavailable' });
  },
  onProxyReq: (proxyReq, req, res) => {
    const targetPath = req.url.replace('/api/auth', '/api');
    console.log(`Proxying auth request: ${req.method} ${req.url} -> http://localhost:3003${targetPath}`);
  }
}));

// Core server routes
app.use('/api/core', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/core': '/api'
  },
  onError: (err, req, res) => {
    console.error('Core proxy error:', err);
    res.status(500).json({ error: 'Core service unavailable' });
  }
}));

// Fallback route
app.use('*', (req, res) => {
  console.log(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: ['/health', '/api/auth/*', '/api/core/*']
  });
});

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth/*`);
  console.log(`🔧 Core routes: http://localhost:${PORT}/api/core/*`);
});