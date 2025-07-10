import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3003;

// Multi-database connections
const DATABASE_URL = process.env.DATABASE_URL || process.env.MASTER_DATABASE_URL || 'postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const cdxDb = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('neon') ? { rejectUnauthorized: false } : false
});

const authDb = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('neon') ? { rejectUnauthorized: false } : false
});

// Set schema for auth database operations
authDb.on('connect', async (client) => {
  await client.query('SET search_path TO auth_db, public');
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
    port: PORT,
    database: 'multi-db-architecture'
  });
});

// Get tenant info from CDX-DB
async function getTenantInfo(tenantId: string) {
  const result = await cdxDb.query(
    'SELECT id, name, status, settings FROM tenants WHERE id = $1',
    [tenantId]
  );
  return result.rows[0] || null;
}

// Sync user creation to CDX-DB for aggregation
async function syncUserToCDX(userData: any) {
  try {
    // Update tenant user count in CDX-DB
    await cdxDb.query(`
      INSERT INTO audit_log (action, resource_type, resource_id, details, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `, [
      'user_created',
      'user',
      userData.id,
      JSON.stringify({ tenant_id: userData.tenant_id, email: userData.email })
    ]);
  } catch (error) {
    console.error('Error syncing user to CDX-DB:', error);
  }
}

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, tenant_id, first_name, last_name, role = 'user' } = req.body;

    if (!email || !password || !tenant_id) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and tenant_id are required'
      });
    }

    // Validate tenant exists
    const tenant = await getTenantInfo(tenant_id);
    if (!tenant) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tenant'
      });
    }

    // Check if user already exists
    const existingUser = await authDb.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in auth-db
    const result = await authDb.query(`
      INSERT INTO users (email, password_hash, tenant_id, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, tenant_id, role, first_name, last_name, created_at
    `, [email, hashedPassword, tenant_id, role, first_name, last_name]);

    const user = result.rows[0];

    // Sync to CDX-DB
    await syncUserToCDX(user);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        tenant_id: user.tenant_id,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

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

    // For superadmin, check CDX-DB admins table
    if (email === 'test' || email.includes('admin')) {
      const adminResult = await cdxDb.query(
        'SELECT id, email, password_hash, role, tenant_access, client_access, is_active FROM admins WHERE email = $1',
        [email]
      );

      if (adminResult.rows.length > 0) {
        const admin = adminResult.rows[0];

        if (!admin.is_active) {
          return res.status(401).json({
            success: false,
            message: 'Account is disabled'
          });
        }

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
            userType: 'admin',
            tenantAccess: admin.tenant_access,
            clientAccess: admin.client_access
          },
          process.env.JWT_SECRET || 'dev-jwt-secret',
          { expiresIn: process.env.JWT_EXPIRY || '24h' } as jwt.SignOptions
        );

        // Update last login
        await cdxDb.query(
          'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
          [admin.id]
        );

        return res.json({
          success: true,
          token,
          user: {
            id: admin.id,
            email: admin.email,
            role: admin.role,
            userType: 'admin',
            tenantAccess: admin.tenant_access,
            clientAccess: admin.client_access
          }
        });
      }
    }

    // For regular users, check auth-db
    const userResult = await authDb.query(`
      SELECT 
        u.id, u.email, u.password_hash, u.tenant_id, u.role, 
        u.first_name, u.last_name, u.is_active, u.last_login
      FROM users u
      WHERE u.email = $1
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get tenant info
    const tenant = await getTenantInfo(user.tenant_id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenant_id,
        userType: 'user'
      },
      process.env.JWT_SECRET || 'dev-jwt-secret',
      { expiresIn: process.env.JWT_EXPIRY || '24h' } as jwt.SignOptions
    );

    // Update last login
    await authDb.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Log auth event
    await authDb.query(`
      INSERT INTO auth_events (user_id, tenant_id, event_type, ip_address, success)
      VALUES ($1, $2, $3, $4, $5)
    `, [user.id, user.tenant_id, 'login', req.ip, true]);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
        tenantName: tenant?.name,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: 'user'
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

    if (decoded.userType === 'admin') {
      // Get fresh admin data from CDX-DB
      const result = await cdxDb.query(
        'SELECT id, email, role, tenant_access, client_access, is_active FROM admins WHERE id = $1',
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
        user: { ...result.rows[0], userType: 'admin' }
      });
    } else {
      // Get fresh user data from auth-db
      const result = await authDb.query(
        'SELECT id, email, role, tenant_id, first_name, last_name, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0 || !result.rows[0].is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      const user = result.rows[0];
      const tenant = await getTenantInfo(user.tenant_id);

      res.json({
        success: true,
        user: { 
          ...user, 
          tenantName: tenant?.name,
          userType: 'user' 
        }
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get tenant users (for admin access)
app.get('/api/users', async (req, res) => {
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

    if (decoded.userType === 'admin' && decoded.role === 'superadmin') {
      // Superadmin can see all users
      query = `
        SELECT id, email, tenant_id, role, first_name, last_name, 
               is_active, last_login, created_at
        FROM users 
        ORDER BY created_at DESC
      `;
    } else if (decoded.userType === 'admin') {
      // Regular admin can see users in their accessible tenants
      query = `
        SELECT id, email, tenant_id, role, first_name, last_name, 
               is_active, last_login, created_at
        FROM users 
        WHERE tenant_id = ANY($1)
        ORDER BY created_at DESC
      `;
      params = [decoded.tenantAccess];
    } else {
      // Regular users can only see themselves
      query = `
        SELECT id, email, tenant_id, role, first_name, last_name, 
               is_active, last_login, created_at
        FROM users 
        WHERE id = $1
      `;
      params = [decoded.userId];
    }

    const result = await authDb.query(query, params);

    res.json({
      success: true,
      users: result.rows
    });

  } catch (error) {
    console.error('Get users error:', error);
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

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Multi-DB Auth Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️ Using multi-database architecture:`);
  console.log(`   - CDX-DB: Platform admins and aggregation`);
  console.log(`   - AUTH-DB: Application users and sessions`);
});