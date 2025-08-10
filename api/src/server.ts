import 'dotenv/config';
import express, { json, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';

import { corsOptions } from './config/cors';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import publicRoutes from './routes/public';
// import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(cors(corsOptions));
app.use(helmet());
app.use(json());

// --- API Routes ---
app.get('/api', apiLimiter, (req, res) => {
  res.json({
    message: 'Welcome to the Bio Cosmetics API!',
    version: '1.0.0',
  });
});

app.use('/api', publicRoutes);
// app.use('/api/admin', adminRoutes);

// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// --- Error Handling ---
// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
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
  // TODO: Add Sentry-like error tracking hook here
  res.status(500).json({ message: 'Internal Server Error' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
