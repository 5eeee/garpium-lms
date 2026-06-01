const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function normalizeInviteCode(raw: string) {
  return raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function formatInviteCode(code: string) {
  const normalized = normalizeInviteCode(code);
  if (normalized.length !== 12) return normalized;
  return `GARP-${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8, 12)}`;
}

export function generateInviteCode() {
  let code = "";
  for (let i = 0; i < 12; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function extractEmailDomain(email: string) {
  const at = email.indexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1).toLowerCase();
}
