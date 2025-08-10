import prisma from '../lib/prisma';
import { CreateOrderDto } from 'shared';
import { generateOtp, verifyOtp } from '../utils/otp';
import { normalizePhone } from '../utils/phone';
import { customAlphabet } from 'nanoid';

// --- Helper: Generate short, human-readable Order IDs ---
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

// --- Helper: Calculate Totals and Check Stock ---
async function calculateTotalsAndValidateStock(items: { productId: string; qty: number }[]) {
  let subtotal = 0;
  const detailedItems = [];
  const productIds = items.map(item => item.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Product with ID ${item.productId} not found or is inactive.`);
    if (product.stock < item.qty) throw new Error(`Not enough stock for ${product.slug}. Only ${product.stock} left.`);

    subtotal += product.priceMAD * item.qty;
    detailedItems.push({ ...product, qty: item.qty });
  }

  // Fetch shipping rules from DB
  const shippingRulesSetting = await prisma.setting.findUnique({ where: { key: 'shipping.rules' } });
  const shippingRules = shippingRulesSetting?.value as any; // Add type guard for production
  const shipping = shippingRules?.default?.fee || 40; // Fallback fee

  const grandTotal = subtotal + shipping;

  return {
    totals: { subtotal, shipping, codFee: 0, grandTotal, currency: 'MAD' },
    detailedItems,
  };
}


// --- Main Service: Create a New Order ---
export async function createOrder(orderDto: CreateOrderDto) {
  const { items, customer } = orderDto;
  const normalizedPhone = normalizePhone(customer.phone);
  if (!normalizedPhone) throw new Error('Invalid phone number format.');
  customer.phone = normalizedPhone;

  // 1. Calculate totals and validate stock in a transaction for consistency
  const { totals, detailedItems } = await calculateTotalsAndValidateStock(items);

  // 2. Create the order record
  const order = await prisma.order.create({
    data: {
      shortId: nanoid(),
      customer,
      totals,
      items: detailedItems.map(p => ({
        productId: p.id,
        sku: p.sku,
        name: (p.i18n as any)['fr-MA'].name,
        price: p.priceMAD,
        qty: p.qty,
        image: p.images[0],
      })),
      status: 'VERIFYING',
      source: 'WEB',
      timeline: [{ status: 'NEW', timestamp: new Date().toISOString(), actor: 'system' }],
    },
    select: { id: true, shortId: true, status: true, totals: true }
  });

  // 3. Generate and send OTP
  const otp = await generateOtp(order.id);
  // TODO: Integrate with SMS/WhatsApp provider
  console.log(`✅ OTP for order ${order.shortId} (${order.id}): ${otp}`);

  // 4. Return response
  return {
    ...order,
    nextAction: {
      type: 'OTP_VERIFY',
      message: 'An OTP has been sent to your phone. Please enter it to confirm.',
    },
  };
}

// --- Main Service: Verify Order OTP ---
export async function verifyOrderOtp(orderId: string, code: string) {
    const isValid = await verifyOtp(orderId, code);

    if (!isValid) {
        // TODO: Increment attempt counter in DB
        return { success: false, message: 'Invalid or expired OTP.' };
    }

    const orderToConfirm = await prisma.order.findUnique({ where: { id: orderId } });
    if (!orderToConfirm || orderToConfirm.status !== 'VERIFYING') {
        return { success: false, message: 'Order cannot be confirmed.' };
    }

    // Use a transaction to ensure atomicity of order confirmation and stock deduction
    const confirmedOrder = await prisma.$transaction(async (tx) => {
        // 1. Update order status to CONFIRMED
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
                status: 'CONFIRMED',
                timeline: { push: { status: 'CONFIRMED', timestamp: new Date().toISOString(), actor: 'system' } },
                verification: { method: 'otp', verifiedAt: new Date().toISOString() },
            },
        });

        // 2. Deduct stock for each item in the order
        const orderItems = updatedOrder.items as any[];
        for (const item of orderItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.qty } },
            });
        }

        // 3. Create structured OrderItem records for analytics
        await tx.orderItem.createMany({
            data: orderItems.map(item => ({
                orderId: updatedOrder.id,
                productId: item.productId,
                quantity: item.qty,
                priceAtTime: item.price,
            }))
        });

        return updatedOrder;
    });

    // TODO: Send order confirmation notification (email, etc.)

    return {
        success: true,
        message: 'Order confirmed successfully!',
        order: { id: confirmedOrder.id, shortId: confirmedOrder.shortId, status: confirmedOrder.status },
    };
}
