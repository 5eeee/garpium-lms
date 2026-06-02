import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { isCompanyAdmin, isLmsAdmin, isSuperAdmin } from "@/lib/roles";

export async function getAdminApiSession() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email || !isLmsAdmin(session.user.role)) return null;
  if (session.user.approvalStatus !== "APPROVED") return null;
  return session;
}

export async function getSuperAdminApiSession() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email || !isSuperAdmin(session.user.role)) return null;
  if (session.user.approvalStatus !== "APPROVED") return null;
  return session;
}

export async function getCompanyAdminApiSession() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email || !isCompanyAdmin(session.user.role)) return null;
  if (session.user.approvalStatus !== "APPROVED") return null;
  return session;
}
