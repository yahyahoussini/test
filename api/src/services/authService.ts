import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { AdminLoginDto } from 'shared';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

/**
 * Handles admin user login.
 * Validates credentials and returns a JWT if successful.
 */
export async function loginAdmin(credentials: AdminLoginDto) {
  const { email, password } = credentials;

  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin || !admin.active) {
    return { success: false, message: 'Invalid credentials or user inactive.' };
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    return { success: false, message: 'Invalid credentials.' };
  }

  // If TOTP is enabled, signal to the frontend that a second factor is required.
  if (admin.totpSecret) {
    return {
      success: true,
      totpRequired: true,
      message: 'Please enter your two-factor authentication code.',
      userId: admin.id, // Send a temporary user ID to link the TOTP verification
    };
  }

  // If TOTP is not enabled, issue the final JWT directly.
  const token = jwt.sign({ id: admin.id, roles: admin.roles }, JWT_SECRET, { expiresIn: '8h' });
  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });

  return { success: true, totpRequired: false, token };
}


/**
 * Verifies a TOTP token for a given user ID.
 * Returns a final JWT if the token is valid.
 */
export async function verifyTotp(userId: string, token: string) {
    const admin = await prisma.adminUser.findUnique({ where: { id: userId } });

    if (!admin || !admin.totpSecret) {
        return { success: false, message: 'User not found or TOTP not enabled.' };
    }

    const isTokenValid = authenticator.verify({
        token,
        secret: admin.totpSecret,
    });

    if (!isTokenValid) {
        return { success: false, message: 'Invalid two-factor authentication code.' };
    }

    // Token is valid, issue the final JWT.
    const finalToken = jwt.sign({ id: admin.id, roles: admin.roles }, JWT_SECRET, { expiresIn: '8h' });
    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });

    return { success: true, token: finalToken };
}
