import { requireSuperAdmin } from "@/lib/session";

export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  return children;
}
