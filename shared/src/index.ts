import { z } from 'zod';

// --- General ---
export const LocaleSchema = z.enum(['ar-MA', 'fr-MA']);
export type Locale = z.infer<typeof LocaleSchema>;

// --- Phone Number Validation ---
const moroccanPhoneRegex = /^(0|\+212)[\s-]?[5-7]\d{8}$/;
export const PhoneSchema = z.string().regex(moroccanPhoneRegex, {
  message: "Invalid Moroccan phone number format.",
});

// --- Product ---
export const ProductI18nSchema = z.object({
  name: z.string().min(3),
  subtitle: z.string().optional(),
  descriptionHtml: z.string(),
  ingredients: z.array(z.string()).optional(),
  howToUse: z.string().optional(),
});
export type ProductI18n = z.infer<typeof ProductI18nSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  slug: z.string(),
  active: z.boolean(),
  priceMAD: z.number().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()),
  i18n: z.record(LocaleSchema, ProductI18nSchema),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Product = z.infer<typeof ProductSchema>;


// --- Order ---
export const OrderStatusSchema = z.enum([
  'NEW', 'VERIFYING', 'CONFIRMED', 'PACKED', 'SHIPPED',
  'DELIVERED', 'CANCELLED', 'RTO', 'NO_ANSWER'
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSourceSchema = z.enum(['WEB', 'WHATSAPP', 'MANUAL']);
export type OrderSource = z.infer<typeof OrderSourceSchema>;

export const CartItemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1),
});

export const CustomerInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: PhoneSchema,
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  notes: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  customer: CustomerInfoSchema,
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: "You must accept the privacy policy." }),
  }),
});
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export const VerifyOtpSchema = z.object({
  code: z.string().length(6, "OTP must be 6 digits"),
});
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;

export const OrderResponseSchema = z.object({
    id: z.string(),
    shortId: z.string(),
    status: OrderStatusSchema,
    totals: z.object({
        subtotal: z.number(),
        shipping: z.number(),
        codFee: z.number(),
        grandTotal: z.number(),
        currency: z.literal('MAD'),
    }),
    nextAction: z.object({
        type: z.enum(['OTP_VERIFY', 'WAIT_CONFIRMATION', 'COMPLETE']),
        message: z.string(),
    }).optional(),
});
export type OrderResponse = z.infer<typeof OrderResponseSchema>;

// --- Admin ---
export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type AdminLoginDto = z.infer<typeof AdminLoginSchema>;

export const TotpVerifySchema = z.object({
  token: z.string().length(6),
});
export type TotpVerifyDto = z.infer<typeof TotpVerifySchema>;
