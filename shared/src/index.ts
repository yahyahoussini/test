import { z } from 'zod';

// --- General & i18n ---
export const LocaleSchema = z.enum(['ar-MA', 'fr-MA']);
export type Locale = z.infer<typeof LocaleSchema>;

// --- Phone Number Validation (as specified) ---
const moroccanPhoneRegex = /^(0|\+212)[\s-]?[5-7]\d{8}$/;
export const PhoneSchema = z.string().regex(moroccanPhoneRegex, {
  message: 'Numéro de téléphone marocain invalide.',
});

// --- Product Schemas ---
export const ProductI18nSchema = z.object({
  name: z.string().min(3),
  subtitle: z.string().optional(),
  descriptionHtml: z.string(),
  ingredients: z.array(z.string()).optional(),
  howToUse: z.string().optional(),
});
export type ProductI18n = z.infer<typeof ProductI18nSchema>;

export const ProductSchema = z.object({
  id: z.string().cuid(),
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

// --- Order Schemas ---
export const OrderStatusSchema = z.enum([
  'NEW', 'VERIFYING', 'CONFIRMED', 'PACKED', 'SHIPPED',
  'DELIVERED', 'CANCELLED', 'RTO', 'NO_ANSWER'
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSourceSchema = z.enum(['WEB', 'WHATSAPP']);
export type OrderSource = z.infer<typeof OrderSourceSchema>;

export const CartItemSchema = z.object({
  productId: z.string().cuid(),
  qty: z.number().int().min(1),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CustomerInfoSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  phone: PhoneSchema,
  city: z.string().min(2, 'La ville est requise'),
  address: z.string().min(5, 'L\'adresse est requise'),
  notes: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Le panier est vide'),
  customer: CustomerInfoSchema,
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter la politique de confidentialité.' }),
  }),
});
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export const VerifyOtpSchema = z.object({
  code: z.string().length(6, 'Le code OTP doit comporter 6 chiffres'),
});
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;

export const OrderResponseSchema = z.object({
    id: z.string(),
    shortId: z.string(),
    status: OrderStatusSchema,
    totals: z.any(), // Not defining shape here to avoid duplication with backend logic
    nextAction: z.object({
        type: z.enum(['OTP_VERIFY', 'WAIT_CONFIRMATION', 'COMPLETE']),
        message: z.string(),
    }).optional(),
});
export type OrderResponse = z.infer<typeof OrderResponseSchema>;

// --- Admin & Auth Schemas ---
export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type AdminLoginDto = z.infer<typeof AdminLoginSchema>;

export const TotpVerifySchema = z.object({
  token: z.string().length(6, 'Le code doit comporter 6 chiffres'),
});
export type TotpVerifyDto = z.infer<typeof TotpVerifySchema>;

export const UpdateOrderStatusSchema = z.object({
    to: OrderStatusSchema
});
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
