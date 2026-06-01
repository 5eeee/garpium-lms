import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAuthOptions } from "@/lib/auth";
import { canAccessCompanyPanel, isCompanyAdmin, isLmsAdmin, isSuperAdmin } from "@/lib/roles";
import { db } from "@/lib/db";

export async function getSession() {
  return getServerSession(await getAuthOptions());
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.email) redirect("/login");
  return session;
}

export async function requireApproved() {
  const session = await requireSession();
  if (session.user.approvalStatus !== "APPROVED") redirect("/pending");
  return session;
}

export async function requireCompanyPanel() {
  const session = await requireApproved();
  if (!canAccessCompanyPanel(session.user.role)) redirect("/dashboard");
  return session;
}

export async function requireCompanyAdmin() {
  const session = await requireApproved();
  if (!isCompanyAdmin(session.user.role)) redirect("/dashboard");
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireApproved();
  if (!isSuperAdmin(session.user.role)) redirect("/dashboard");
  return session;
}

export async function requireLmsAdmin() {
  const session = await requireApproved();
  if (!isLmsAdmin(session.user.role)) redirect("/dashboard");
  return session;
}

/** @deprecated use requireCompanyAdmin or requireLmsAdmin */
export async function requireAdmin() {
  return requireLmsAdmin();
}

export async function getCurrentUser() {
  const session = await requireSession();
  return db.user.findUnique({
    where: { email: session.user.email! },
    include: {
      company: true,
      memberships: { include: { company: true, department: true } }
    }
  });
}

export async function getCompanyForAdmin() {
  const session = await requireCompanyAdmin();
  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    include: { company: true }
  });
  if (!user?.company) return null;
  return user.company;
}
