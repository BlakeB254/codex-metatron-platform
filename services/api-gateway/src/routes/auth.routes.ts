import express, { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = express.Router();

// Proxy all auth requests to the dedicated auth service
router.use('/', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    console.error('Auth Service Proxy Error:', err);
    res.status(503).json({
      success: false,
      error: 'ServiceUnavailable',
      message: 'Authentication service is currently unavailable',
      timestamp: new Date().toISOString(),
    });
  },
  onProxyReq: (proxyReq, req) => {
    // Log auth requests
    console.log(`[AUTH PROXY] ${req.method} ${req.url} -> ${proxyReq.getHeader('host')}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log auth responses
    console.log(`[AUTH PROXY] ${req.method} ${req.url} <- ${proxyRes.statusCode}`);
  }
}));

export default router;