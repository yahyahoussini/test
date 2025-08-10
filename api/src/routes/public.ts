import { Router } from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { prisma } from '../lib/prisma';
import { CreateOrderSchema } from 'shared';
import { sensitiveActionLimiter } from '../middleware/rateLimiter';
import { createOrder, verifyOrderOtp } from '../services/orderService';
import { getProductBySlug, getProducts } from '../services/productService';

const router = Router();

// --- Product Routes ---

// GET /api/products -> list with pagination
router.get('/products', async (req, res, next) => {
  try {
    const query = req.query; // You can add Zod validation here for query params
    const products = await getProducts(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:slug -> detail
router.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});


// --- Order Routes ---

// POST /api/orders -> create NEW
router.post(
  '/orders',
  sensitiveActionLimiter,
  processRequestBody(CreateOrderSchema),
  async (req, res, next) => {
    try {
      const orderDto = req.body;
      const result = await createOrder(orderDto);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('stock')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
);

// POST /api/orders/:id/verify-otp -> verify OTP
router.post('/orders/:id/verify-otp', sensitiveActionLimiter, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code } = req.body; // Add Zod validation for the code
        if (!code || typeof code !== 'string' || code.length !== 6) {
            return res.status(400).json({ message: 'Invalid OTP format.' });
        }

        const result = await verifyOrderOtp(id, code);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.json({ message: result.message, order: result.order });
    } catch (error) {
        next(error);
    }
});

// --- Other Public Routes ---

// POST /api/whatsapp/deeplink
// ... implementation ...

export default router;
