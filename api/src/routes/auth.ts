import { Router } from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { loginAdmin, verifyTotp } from '../services/authService';
import { AdminLoginSchema, TotpVerifySchema } from 'shared';
import { loginLimiter } from '../middleware/rateLimiter';
import { checkIpAllowlist } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post(
  '/login',
  checkIpAllowlist, // Optional: Apply IP allowlist before rate limiting
  loginLimiter,
  processRequestBody(AdminLoginSchema),
  async (req, res, next) => {
    try {
      const result = await loginAdmin(req.body);
      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/totp-verify
router.post(
  '/totp-verify',
  checkIpAllowlist,
  loginLimiter, // Apply the same limiter to prevent brute-forcing the TOTP
  processRequestBody(TotpVerifySchema.extend({ userId: z.string().cuid() })),
  async (req, res, next) => {
    try {
        const { userId, token } = req.body;
        const result = await verifyTotp(userId, token);
        if(!result.success) {
            return res.status(401).json({ message: result.message });
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
  }
);

export default router;
