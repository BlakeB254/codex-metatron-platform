import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authDb } from '../server';
import { asyncHandler, UnauthorizedError, ValidationError, ConflictError } from '../middleware/error.middleware';

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['superadmin', 'admin', 'user']).default('user'),
  tenant_access: z.array(z.string()).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const confirmResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Helper function to generate JWT token
const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_access: user.tenant_access || [],
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRY || '7d' } as jwt.SignOptions
  );
};

// Login route
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  // Find user in database
  const result = await authDb.query(
    'SELECT id, email, password_hash, role, tenant_access, is_active FROM admins WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new UnauthorizedError('Account is disabled');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate JWT token
  const token = generateToken(user);

  // Update last login
  await authDb.query(
    'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Log successful login
  console.log(`[AUTH] Successful login for user: ${user.email} (ID: ${user.id})`);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_access: user.tenant_access,
    },
    timestamp: new Date().toISOString(),
  });
}));

// Register route (for creating new admin users)
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role, tenant_access } = registerSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await authDb.query(
    'SELECT id FROM admins WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const result = await authDb.query(
    `INSERT INTO admins (email, password_hash, role, tenant_access, is_active, created_at) 
     VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP) 
     RETURNING id, email, role, tenant_access, created_at`,
    [email, passwordHash, role, tenant_access || []]
  );

  const newUser = result.rows[0];

  // Generate JWT token
  const token = generateToken(newUser);

  // Log user creation
  console.log(`[AUTH] New user registered: ${newUser.email} (ID: ${newUser.id})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tenant_access: newUser.tenant_access,
      created_at: newUser.created_at,
    },
    timestamp: new Date().toISOString(),
  });
}));

// Verify token route
router.get('/verify', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify user still exists and is active
    const result = await authDb.query(
      'SELECT id, email, role, tenant_access, is_active FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      throw new UnauthorizedError('Invalid token');
    }

    res.json({
      success: true,
      valid: true,
      user: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}));

// Get current user profile
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  
  const result = await authDb.query(
    `SELECT id, email, role, tenant_access, created_at, last_login, is_active 
     FROM admins 
     WHERE id = $1 AND is_active = true`,
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('User not found');
  }

  res.json({
    success: true,
    user: result.rows[0],
    timestamp: new Date().toISOString(),
  });
}));

// Change password route
router.post('/change-password', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  // Get current user
  const result = await authDb.query(
    'SELECT id, password_hash FROM admins WHERE id = $1 AND is_active = true',
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('User not found');
  }

  const user = result.rows[0];

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await authDb.query(
    'UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newPasswordHash, user.id]
  );

  // Log password change
  console.log(`[AUTH] Password changed for user ID: ${user.id}`);

  res.json({
    success: true,
    message: 'Password changed successfully',
    timestamp: new Date().toISOString(),
  });
}));

// Logout route (client-side token invalidation)
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // In a more sophisticated setup, you might maintain a token blacklist
  // For now, we rely on client-side token removal
  
  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString(),
  });
}));

// Refresh token route
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  try {
    // Verify the existing token (even if expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, { ignoreExpiration: true }) as any;
    
    // Check if user still exists and is active
    const result = await authDb.query(
      'SELECT id, email, role, tenant_access, is_active FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      throw new UnauthorizedError('Invalid token');
    }

    const user = result.rows[0];

    // Generate new token
    const newToken = generateToken(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_access: user.tenant_access,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}));

export default router;