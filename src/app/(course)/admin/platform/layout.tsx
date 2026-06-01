import { PlatformAdminNav } from "@/components/PlatformAdminNav";
import { requireSuperAdmin } from "@/lib/session";

export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();
  return (
    <>
      <PlatformAdminNav />
      {children}
    </>
  );
}
