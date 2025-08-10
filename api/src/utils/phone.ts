const MOROCCAN_PHONE_REGEX = /^(0|\+212)[\s-]?[5-7]\d{8}$/;

/**
 * Validates if a string is a valid Moroccan phone number.
 * @param phone The phone number string to validate.
 * @returns True if valid, false otherwise.
 */
export function isValidPhone(phone: string): boolean {
  return MOROCCAN_PHONE_REGEX.test(phone);
}

/**
 * Normalizes a Moroccan phone number to the international +212XXXXXXXXX format.
 * Returns null if the phone number is invalid.
 * @param phone The phone number string to normalize.
 * @returns The normalized phone number or null.
 */
export function normalizePhone(phone: string): string | null {
  if (!isValidPhone(phone)) {
    return null;
  }

  const digits = phone.replace(/[\s-]/g, '').replace(/^\+/, '');

  if (digits.startsWith('0')) {
    // Converts 06... to +2126...
    return `+212${digits.substring(1)}`;
  }

  if (digits.startsWith('212')) {
    // Already in 212... format, just add the +
    return `+${digits}`;
  }

  // This case should ideally not be reached if isValidPhone passed.
  return null;
}

/**
 * Masks a phone number for display in logs or UI, e.g., +212XXXXXX123.
 * @param phone The phone number string (preferably normalized).
 * @returns The masked phone number.
 */
export function maskPhone(phone: string): string {
    if (phone.length < 9) {
        return phone;
    }
    const start = phone.slice(0, 4); // e.g., +212
    const end = phone.slice(-3);
    return `${start}*****${end}`;
}
