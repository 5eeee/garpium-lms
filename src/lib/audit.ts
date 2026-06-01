import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function getClientIp() {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    null
  );
}

export async function writeAuditLog(input: {
  userId?: string | null;
  companyId?: string | null;
  action: string;
  description: string;
  ip?: string | null;
}) {
  const ip = input.ip ?? (await getClientIp());
  await db.auditLog.create({
    data: {
      userId: input.userId || null,
      companyId: input.companyId || null,
      action: input.action,
      description: input.description,
      ip
    }
  });
}
