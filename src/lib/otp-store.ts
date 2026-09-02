// Shared in-memory OTP store for email verification & password reset
interface OTPRecord {
  code: string;
  expiresAt: number;
}

const globalForOTP = globalThis as unknown as { otpStore?: Map<string, OTPRecord> };

export const otpStore = globalForOTP.otpStore ?? new Map<string, OTPRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalForOTP.otpStore = otpStore;
}

export function generateOTP(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  // Generate 6 digit numeric code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Set expiry to 10 minutes from now
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(normalizedEmail, { code, expiresAt });
  return code;
}

export function verifyOTP(email: string, code: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }
  return record.code === code.trim();
}

export function clearOTP(email: string): void {
  const normalizedEmail = email.toLowerCase().trim();
  otpStore.delete(normalizedEmail);
}
