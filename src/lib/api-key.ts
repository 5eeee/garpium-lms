import { createHash, randomBytes } from "crypto";
import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";

export function generateApiKey() {
  const raw = `garp_${randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 12);
  return { raw, prefix };
}

export async function hashApiKey(raw: string) {
  return hash(raw, 12);
}

export async function verifyApiKey(raw: string, keyHash: string) {
  return compare(raw, keyHash);
}

export async function authenticateApiKey(request: Request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token.startsWith("garp_")) return null;

  const prefix = token.slice(0, 12);
  const candidates = await db.apiKey.findMany({
    where: { prefix, active: true },
    include: { company: true }
  });

  for (const item of candidates) {
    const ok = await verifyApiKey(token, item.keyHash);
    if (!ok) continue;
    await db.apiKey.update({
      where: { id: item.id },
      data: { lastUsedAt: new Date() }
    });
    return item;
  }

  return null;
}

export function keyFingerprint(raw: string) {
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}
