import 'dotenv/config';
import express, { json, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { redis } from './lib/redis';
import { apiLimiter } from './middleware/rateLimiter';
import { corsOptions } from './config/cors';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';

async function main() {
  const app = express();
  const PORT = process.env.PORT || 4000;

  // --- Global Middleware ---
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(json());
  app.use('/api', apiLimiter); // Apply base rate limiting to all API routes

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
  });

  // app.use('/api', publicRoutes);
  // app.use('/api/admin', adminRoutes);

  // --- Error Handling ---
  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
  });

  // Zod validation error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors,
      });
    }
    next(err);
  });

  // Generic error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    // TODO: Add Sentry hook here
    res.status(500).json({ message: 'An internal server error occurred' });
  });

  // --- Start Server ---
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// Connect to Redis and start the server
redis.connect().then(main).catch(err => {
    console.error('🔴 Failed to connect to Redis', err);
    process.exit(1);
});
