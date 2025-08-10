import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../lib/redis';

// Create a Redis store for rate-limiting
const store = new RedisStore({
  // @ts-expect-error - ioredis is supported but the types are not perfectly aligned
  sendCommand: (...args: string[]) => redis.call(...args),
});

// General API limiter for most routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: store,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});

// Stricter limiter for sensitive actions like creating an order or verifying an OTP
export const sensitiveActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10, // Limit each IP to 10 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: store,
  message: { message: 'Too many attempts, please try again later.' },
});

// Limiter for login attempts to prevent brute-force attacks
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 login attempts per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: store,
    message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});
