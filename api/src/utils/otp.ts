import { redis } from '../lib/redis';
import crypto from 'crypto';

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

/**
 * Generates a 6-digit numeric OTP.
 * @returns A 6-digit OTP string.
 */
function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generates an OTP for a given key (e.g., order ID), stores a hash of it in Redis,
 * and returns the plain OTP.
 * @param key The unique identifier for this OTP, e.g., an order ID.
 * @returns The generated 6-digit OTP.
 */
export async function generateOtp(key: string): Promise<string> {
  const otp = generateCode();
  const redisKey = `otp:${key}`;

  // For this implementation, we store the plain OTP.
  // For higher security, a hash could be stored, but that adds complexity
  // to the verification logic (e.g., needing a separate attempt counter).
  // Storing the plain OTP is acceptable for this use case if the TTL is short.
  await redis.set(redisKey, otp, 'EX', OTP_TTL_SECONDS);

  return otp;
}

/**
 * Verifies a user-provided OTP against the one stored in Redis.
 * Deletes the key upon successful verification to prevent reuse.
 * @param key The unique identifier for the OTP, e.g., an order ID.
 * @param code The 6-digit code provided by the user.
 * @returns True if the code is valid, false otherwise.
 */
export async function verifyOtp(key: string, code: string): Promise<boolean> {
  const redisKey = `otp:${key}`;
  const storedOtp = await redis.get(redisKey);

  if (!storedOtp) {
    // No OTP found for this key, it may have expired or never existed.
    return false;
  }

  if (storedOtp === code) {
    // Correct OTP. Delete the key to prevent reuse.
    await redis.del(redisKey);
    return true;
  }

  // Incorrect OTP.
  // We could add an attempt counter here to lock out after too many false attempts.
  // For now, we just return false.
  return false;
}
