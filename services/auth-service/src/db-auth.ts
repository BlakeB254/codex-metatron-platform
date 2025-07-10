import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3003;

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.MASTER_DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

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

// Initialize admin user
async function initializeAdmin() {
  try {
    // Check if admins table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admins'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create admins table
      await db.query(`
        CREATE TABLE admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          tenant_access JSONB DEFAULT '[]',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        );
      `);
      console.log('✅ Created admins table');
    }

    // Check if test admin exists
    const adminExists = await db.query('SELECT id FROM admins WHERE email = $1', ['test']);
    
    if (adminExists.rows.length === 0) {
      // Create default admin
      const hashedPassword = await bcrypt.hash('test123', 12);
      await db.query(`
        INSERT INTO admins (email, password_hash, role, tenant_access)
        VALUES ($1, $2, $3, $4)
      `, ['test', hashedPassword, 'superadmin', JSON.stringify(['*'])]);
      console.log('✅ Created default admin user: test/test123');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin user
    const result = await db.query(
      'SELECT id, email, password_hash, role, tenant_access, is_active FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: admin.id, 
        email: admin.email, 
        role: admin.role,
        tenantAccess: admin.tenant_access
      },
      process.env.JWT_SECRET || 'dev-jwt-secret',
      { expiresIn: process.env.JWT_EXPIRY || '24h' } as jwt.SignOptions
    );

    // Update last login
    await db.query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        tenantAccess: admin.tenant_access
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
app.get('/api/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret') as any;

    // Get fresh user data
    const result = await db.query(
      'SELECT id, email, role, tenant_access, is_active FROM admins WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Start server and initialize database
app.listen(PORT, async () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  await initializeAdmin();
});