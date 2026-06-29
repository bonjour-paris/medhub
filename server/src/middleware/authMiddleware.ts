import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  role: 'seller' | 'customer' | 'admin';
  adminRole?: 'superadmin' | 'useradmin';
  email: string;
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRole = (role: string) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user as JwtPayload;
  if (!user || (user.role !== 'admin' && user.adminRole !== role)) {
    res.status(403).json({ message: `Forbidden: requires ${role}` });
    return;
  }
  next();
};