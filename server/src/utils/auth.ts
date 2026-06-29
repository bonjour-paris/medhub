import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  role: 'seller' | 'customer' | 'admin';
  adminRole?: 'superadmin' | 'useradmin';
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  console.log('Auth header received:', authHeader);
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Missing or invalid token format');
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as JwtPayload;
    console.log('Token decoded:', { id: decoded.id, role: decoded.role, exp: decoded.exp });
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    console.log('Token verification error:', err.message, err.name);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRole = (role: string) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user as JwtPayload;
  console.log('User role check:', { user, requiredRole: role });
  if (!user || (user.role !== 'admin' && user.adminRole !== role)) {
    res.status(403).json({ message: `Forbidden: requires ${role}` });
    return;
  }
  next();
};