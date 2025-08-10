import { totp } from 'otplib';
import redisClient from '../lib/redis';

// The secret for OTP generation should ideally be unique per user/order
// and stored securely. For this MVP, we'll derive it from a base secret
// and the order ID.
const OTP_BASE_SECRET = process.env.JWT_SECRET || 'a-very-strong-secret-for-otp';
const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

function getOtpSecret(orderId: string): string {
    // This is a simplistic way to get a unique secret per order.
    // A more robust solution might involve a securely stored, randomly generated secret.
    return `${OTP_BASE_SECRET}-${orderId}`;
}

totp.options = {
    step: OTP_TTL_SECONDS, // Validity period
    window: 1, // Allow one previous step to be valid for a short time
    digits: 6,
};

/**
 * Generates a 6-digit OTP for a given order ID and stores it.
 * In this implementation, we don't store the OTP directly.
 * We rely on TOTP's time-based generation and verification.
 * We will, however, use Redis to track that an OTP was issued for this order ID.
 * @param orderId The ID of the order to generate an OTP for.
 * @returns The generated OTP.
 */
export async function generateOtp(orderId: string): Promise<string> {
    const secret = getOtpSecret(orderId);
    const token = totp.generate(secret);

    // Store a marker in Redis to indicate an OTP has been issued for this order.
    // This helps prevent verification attempts on orders without a recent OTP request.
    const redisKey = `otp:${orderId}`;
    await redisClient.set(redisKey, 'issued', {
        EX: OTP_TTL_SECONDS + 60, // Give a little buffer
    });

    return token;
}

/**
 * Verifies a 6-digit OTP for a given order ID.
 * @param orderId The ID of the order.
 * @param token The OTP provided by the user.
 * @returns True if the OTP is valid, false otherwise.
 */
export async function verifyOtp(orderId: string, token: string): Promise<boolean> {
    const redisKey = `otp:${orderId}`;
    const otpIssued = await redisClient.get(redisKey);

    if (!otpIssued) {
        console.warn(`OTP verification attempt for order ${orderId} without an issued OTP.`);
        return false; // No OTP was recently issued for this order.
    }

    const secret = getOtpSecret(orderId);
    const isValid = totp.verify({ token, secret });

    // If verification is successful, remove the key from Redis to prevent reuse.
    if (isValid) {
        await redisClient.del(redisKey);
    }

    return isValid;
}
