import prisma from '../lib/prisma';
import { OrderStatus } from 'shared';

// --- Order Management Services ---

interface GetOrdersQuery {
    status?: OrderStatus;
    phone?: string;
    date?: string; // Expects ISO date string
    page?: string;
    limit?: string;
}

/**
 * Fetches a paginated list of orders for the admin panel.
 * Supports filtering by status, customer phone, and date.
 */
export async function getOrders(query: GetOrdersQuery) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {
        ...(query.status && { status: query.status }),
        ...(query.phone && { customer: { path: ['phone'], string_contains: query.phone } }),
        ...(query.date && {
            createdAt: {
                gte: new Date(query.date),
                lt: new Date(new Date(query.date).getTime() + 24 * 60 * 60 * 1000)
            }
        }),
    };

    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
    ]);

    return {
        data: orders,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Fetches a single order by its CUID.
 */
export async function getOrderById(id: string) {
    return prisma.order.findUnique({ where: { id } });
}

/**
 * Updates the status of an order.
 * This function should contain the logic for valid status transitions.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, adminId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new Error('Order not found');
    }

    // TODO: Add robust state transition validation logic here.
    // For example, you can't go from SHIPPED back to NEW.
    // For now, we allow any transition.

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: newStatus,
            timeline: {
                push: {
                    status: newStatus,
                    timestamp: new Date().toISOString(),
                    actor: adminId,
                },
            },
        },
    });

    return updatedOrder;
}
