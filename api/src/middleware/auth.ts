import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles.includes(requiredRole)) {
      return res.status(403).json({ message: 'Forbidden. You do not have the required role.' });
    }
    next();
  };
};

// Optional middleware for IP allowlisting
export const checkIpAllowlist = (req: Request, res: Response, next: NextFunction) => {
    const allowlist = process.env.ADMIN_IP_ALLOWLIST?.split(',') || [];
    if (allowlist.length === 0) {
        return next(); // No allowlist configured
    }
    const clientIp = req.ip;
    if (allowlist.includes(clientIp)) {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden. IP address not allowed.' });
};
