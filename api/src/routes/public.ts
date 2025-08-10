import { Router } from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { getProductBySlug, getProducts } from '../services/productService';
import { createOrder, verifyOrderOtp } from '../services/orderService';
import { CreateOrderSchema, VerifyOtpSchema } from 'shared';
import { sensitiveActionLimiter } from '../middleware/rateLimiter';

const router = Router();

// --- Product Routes ---
// GET /api/products -> List products with pagination, filtering, and search
router.get('/products', async (req, res, next) => {
  try {
    const result = await getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:slug -> Get a single product's details
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
// POST /api/orders -> Create a new order
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
      if (error instanceof Error && (error.message.includes('stock') || error.message.includes('not found'))) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
);

// POST /api/orders/:id/verify-otp -> Verify an order's OTP to confirm it
router.post(
    '/orders/:id/verify-otp',
    sensitiveActionLimiter,
    processRequestBody(VerifyOtpSchema.extend({ id: z.string().cuid() })), // Also validate param
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { code } = req.body;

            const result = await verifyOrderOtp(id, code);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            res.json({ message: result.message, order: result.order });
        } catch (error) {
            next(error);
        }
    }
);


// --- WhatsApp Deeplink ---
// POST /api/whatsapp/deeplink -> Generate a wa.me link
// This is a placeholder implementation.
router.post('/whatsapp/deeplink', (req, res) => {
    // In a real app, you would validate the body (cart items, etc.)
    // and use the wa.ts utility to generate the link.
    const mockLink = 'https://wa.me/212600000000?text=Hello!';
    res.json({ link: mockLink });
});

export default router;
