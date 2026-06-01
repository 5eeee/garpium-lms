import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export async function getApprovedApiSession() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id || session.user.approvalStatus !== "APPROVED") return null;
  return session;
}
