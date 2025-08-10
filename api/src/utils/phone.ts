const moroccanPhoneRegex = /^(0|\+212)[\s-]?[5-7]\d{8}$/;

/**
 * Validates a Moroccan phone number.
 * @param phone The phone number string to validate.
 * @returns True if the phone number is valid, false otherwise.
 */
export function validatePhone(phone: string): boolean {
  return moroccanPhoneRegex.test(phone);
}

/**
 * Normalizes a Moroccan phone number to the +212XXXXXXXXX format.
 * @param phone The phone number string to normalize.
 * @returns The normalized phone number or null if the format is invalid.
 */
export function normalizePhone(phone: string): string | null {
  if (!validatePhone(phone)) {
    return null;
  }

  // Remove spaces, hyphens, and the leading +
  const digits = phone.replace(/[\s-]/g, '').replace(/^\+/, '');

  if (digits.startsWith('0')) {
    return `+212${digits.substring(1)}`;
  }

  if (digits.startsWith('212')) {
    return `+${digits}`;
  }

  return null; // Should not happen if regex is correct
}

/**
 * Masks a phone number for display, e.g., +212XXXXXX123.
 * @param phone The phone number string (preferably normalized).
 * @returns The masked phone number.
 */
export function maskPhone(phone: string): string {
    if (phone.length < 10) {
        return phone;
    }
    const start = phone.slice(0, 4); // e.g., +212
    const end = phone.slice(-3);
    return `${start}XXXXX${end}`;
}
