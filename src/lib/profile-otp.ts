import { createHash, randomInt } from "crypto";
import { hash, compare } from "bcryptjs";

export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith("7")) return `+${digits}`;
  if (digits.length === 10) return `+7${digits}`;
  return null;
}

export function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

export async function hashOtp(code: string) {
  return hash(code, 8);
}

export async function verifyOtp(code: string, otpHash: string | null | undefined) {
  if (!otpHash) return false;
  return compare(code, otpHash);
}

export function otpExpiresAt(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isOtpExpired(expires: Date | null | undefined) {
  if (!expires) return true;
  return expires.getTime() < Date.now();
}

/** Dev/demo: deterministic hint without exposing in production */
export function devOtpHint(enabled: boolean, code: string) {
  return enabled ? code : undefined;
}

export function isEsiaDemoMode() {
  return process.env.ESIA_DEMO_MODE === "true" || !process.env.ESIA_CLIENT_ID;
}
