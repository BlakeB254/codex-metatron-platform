import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

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

// Initialize database schema and default data
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database schema...');
    
    // Read and execute the complete schema
    const schemaPath = path.join(__dirname, '../../../database/schema/complete-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await db.query(schemaSql);
      console.log('✅ Database schema initialized');
    } else {
      console.log('⚠️ Schema file not found, creating basic tables...');
      await createBasicTables();
    }

    // Create default admin user
    await createDefaultAdmin();
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Create basic tables if schema file is not available
async function createBasicTables() {
  // Create clients table
  await db.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      company_name VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      tenant_ids JSONB DEFAULT '[]',
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create tenants table (updated with client_id)
  await db.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      api_key VARCHAR(255) UNIQUE NOT NULL,
      tier VARCHAR(50) DEFAULT 'free',
      status VARCHAR(50) DEFAULT 'active',
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create admins table (updated with client_id)
  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      tenant_access JSONB DEFAULT '[]',
      client_access JSONB DEFAULT '[]',
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    );
  `);

  console.log('✅ Basic tables created');
}

// Create default admin user
async function createDefaultAdmin() {
  try {
    // Check if test admin exists
    const adminExists = await db.query('SELECT id FROM admins WHERE email = $1', ['test']);
    
    if (adminExists.rows.length === 0) {
      // Create default admin
      const hashedPassword = await bcrypt.hash('test123', 12);
      await db.query(`
        INSERT INTO admins (email, password_hash, role, tenant_access, client_access)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'test', 
        hashedPassword, 
        'superadmin', 
        JSON.stringify(['*']), // Access to all tenants
        JSON.stringify(['*'])  // Access to all clients
      ]);
      console.log('✅ Created default admin user: test/test123');
    } else {
      console.log('ℹ️ Default admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
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

    // Find admin user with client information
    const result = await db.query(`
      SELECT 
        a.id, a.email, a.password_hash, a.role, a.tenant_access, a.client_access, 
        a.is_active, a.client_id,
        c.name as client_name, c.company_name
      FROM admins a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.email = $1
    `, [email]);

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
        clientId: admin.client_id,
        tenantAccess: admin.tenant_access,
        clientAccess: admin.client_access
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
        clientId: admin.client_id,
        clientName: admin.client_name,
        companyName: admin.company_name,
        tenantAccess: admin.tenant_access,
        clientAccess: admin.client_access
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
    const result = await db.query(`
      SELECT 
        a.id, a.email, a.role, a.tenant_access, a.client_access, 
        a.is_active, a.client_id,
        c.name as client_name, c.company_name
      FROM admins a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.id = $1
    `, [decoded.userId]);

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const admin = result.rows[0];

    res.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        clientId: admin.client_id,
        clientName: admin.client_name,
        companyName: admin.company_name,
        tenantAccess: admin.tenant_access,
        clientAccess: admin.client_access
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get user's accessible tenants/applications
app.get('/api/tenants', async (req, res) => {
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

    let query = '';
    let params: any[] = [];

    if (decoded.role === 'superadmin') {
      // Superadmin sees all tenants
      query = `
        SELECT t.*, c.name as client_name, c.company_name
        FROM tenants t
        LEFT JOIN clients c ON t.client_id = c.id
        ORDER BY t.created_at DESC
      `;
    } else if (decoded.role === 'admin') {
      // Admin sees tenants based on their access
      if (decoded.tenantAccess.includes('*')) {
        query = `
          SELECT t.*, c.name as client_name, c.company_name
          FROM tenants t
          LEFT JOIN clients c ON t.client_id = c.id
          ORDER BY t.created_at DESC
        `;
      } else {
        query = `
          SELECT t.*, c.name as client_name, c.company_name
          FROM tenants t
          LEFT JOIN clients c ON t.client_id = c.id
          WHERE t.id = ANY($1)
          ORDER BY t.created_at DESC
        `;
        params = [decoded.tenantAccess];
      }
    } else {
      // Client sees only their tenants
      query = `
        SELECT t.*, c.name as client_name, c.company_name
        FROM tenants t
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE t.client_id = $1
        ORDER BY t.created_at DESC
      `;
      params = [decoded.clientId];
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      tenants: result.rows
    });

  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
  await initializeDatabase();
});