import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';

// Create a Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
(async () => {
    if (process.env.NODE_ENV !== 'test') {
        await redisClient.connect();
    }
})();


// Create a Redis store for rate-limiting
const store = new RedisStore({
  // @ts-expect-error - Known issue with a dependency of rate-limit-redis
  sendCommand: (...args: string[]) => redisClient.sendCommand(args),
});


// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: process.env.NODE_ENV === 'production' ? store : undefined,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Stricter limiter for sensitive actions like order creation or OTP verification
export const sensitiveActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: process.env.NODE_ENV === 'production' ? store : undefined,
  message: 'Too many attempts, please try again later.',
});

// Limiter for login attempts
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: process.env.NODE_ENV === 'production' ? store : undefined,
    message: 'Too many login attempts. Please try again in 15 minutes.',
});
