import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    port: PORT
  });
});

// Simple auth endpoints
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
  if (email === 'test' && password === 'test123') {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test',
        role: 'superadmin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/verify', (req, res) => {
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'test',
      role: 'superadmin'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});