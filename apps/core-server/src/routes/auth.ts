import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { masterDb } from '../server';
import { asyncHandler, UnauthorizedError } from '../middleware/error-handler';

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// Login route for superadmin/admin users
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  // Find admin user
  const result = await masterDb.query(
    'SELECT id, email, password_hash, role, tenant_access, is_active FROM admins WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const admin = result.rows[0];

  if (!admin.is_active) {
    throw new UnauthorizedError('Account is disabled');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, admin.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      tenant_access: admin.tenant_access,
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRY || '7d' } as jwt.SignOptions
  );

  // Update last login
  await masterDb.query(
    'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [admin.id]
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      tenant_access: admin.tenant_access,
    },
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
    const result = await masterDb.query(
      'SELECT id, email, role, tenant_access, is_active FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      throw new UnauthorizedError('Invalid token');
    }

    res.json({
      valid: true,
      user: result.rows[0],
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
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
  const result = await masterDb.query(
    'SELECT id, password_hash FROM admins WHERE id = $1 AND is_active = true',
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('User not found');
  }

  const admin = result.rows[0];

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await masterDb.query(
    'UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [newPasswordHash, admin.id]
  );

  res.json({
    message: 'Password changed successfully',
  });
}));

// Logout route (client-side token invalidation)
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    message: 'Logout successful',
  });
});

// Get current user profile
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  
  const result = await masterDb.query(
    `SELECT id, email, role, tenant_access, created_at, last_login, is_active 
     FROM admins 
     WHERE id = $1 AND is_active = true`,
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('User not found');
  }

  res.json({
    user: result.rows[0],
  });
}));

export { router as authRoutes };