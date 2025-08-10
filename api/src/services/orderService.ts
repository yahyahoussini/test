import { prisma } from '../lib/prisma';
import redisClient from '../lib/redis';
import { CreateOrderDto } from 'shared';
import { generateOtp, verifyOtp } from '../utils/otp';
import { normalizePhone } from '../utils/phone';

// --- Helper Functions ---

async function calculateTotals(items: { productId: string; qty: number }[]) {
  let subtotal = 0;
  const productDetails = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId, active: true },
    });
    if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
    if (product.stock < item.qty) throw new Error(`Not enough stock for ${product.slug}.`);

    subtotal += product.priceMAD * item.qty;
    productDetails.push({ ...product, qty: item.qty });
  }

  // TODO: Fetch shipping and COD fees from settings in DB
  const shipping = 40; // Placeholder
  const codFee = 0; // Placeholder
  const grandTotal = subtotal + shipping + codFee;

  return {
    totals: { subtotal, shipping, codFee, grandTotal, currency: 'MAD' },
    detailedItems: productDetails,
  };
}

// --- Main Service Functions ---

export async function createOrder(orderDto: CreateOrderDto) {
  const { items, customer } = orderDto;
  const normalizedPhone = normalizePhone(customer.phone);
  if (!normalizedPhone) {
    throw new Error('Invalid phone number format.');
  }
  customer.phone = normalizedPhone;

  // 1. Calculate totals and validate stock
  const { totals, detailedItems } = await calculateTotals(items);

  // 2. Create the order in the database
  const order = await prisma.order.create({
    data: {
      customer,
      totals,
      items: detailedItems.map(p => ({
        productId: p.id,
        sku: p.sku,
        name: (p.i18n as any)['fr-MA'].name, // Default to French name for now
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

  // 3. Generate and store OTP
  const otp = await generateOtp(order.id);

  // 4. TODO: Send OTP via SMS/WhatsApp
  console.log(`OTP for order ${order.id}: ${otp}`);

  // 5. Return response to frontend
  return {
    ...order,
    nextAction: {
      type: 'OTP_VERIFY',
      message: 'An OTP has been sent to your phone. Please enter it to confirm.',
    },
  };
}

export async function verifyOrderOtp(orderId: string, code: string) {
  const isValid = await verifyOtp(orderId, code);

  if (!isValid) {
    // Optional: increment attempt counter in DB
    return { success: false, message: 'Invalid or expired OTP.' };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { success: false, message: 'Order not found.' };
  }

  // Use a transaction to confirm order and deduct stock
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // 1. Update order status
    const confirmedOrder = await tx.order.update({
      where: { id: orderId, status: 'VERIFYING' }, // Ensure we can only confirm once
      data: {
        status: 'CONFIRMED',
        timeline: {
          push: { status: 'CONFIRMED', timestamp: new Date().toISOString(), actor: 'system' },
        },
        verification: { method: 'otp', verifiedAt: new Date().toISOString() },
      },
    });

    // 2. Deduct stock for each item
    const orderItems = confirmedOrder.items as any[];
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.qty,
          },
        },
      });
    }

    // Create linked OrderItem records
    await tx.orderItem.createMany({
      data: orderItems.map(item => ({
        orderId: confirmedOrder.id,
        productId: item.productId,
        quantity: item.qty,
        priceAtTime: item.price,
      }))
    });

    return confirmedOrder;
  });

  // TODO: Send order confirmation notification

  return {
    success: true,
    message: 'Order confirmed successfully!',
    order: {
      id: updatedOrder.id,
      status: updatedOrder.status,
    },
  };
}
