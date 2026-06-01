import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { isLmsAdmin } from "@/lib/roles";

export async function getAdminApiSession() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email || !isLmsAdmin(session.user.role)) return null;
  return session;
}
