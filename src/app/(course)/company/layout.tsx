import { CompanyNav } from "@/components/CompanyNav";
import { requireCompanyPanel } from "@/lib/session";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  await requireCompanyPanel();
  return (
    <>
      <CompanyNav />
      {children}
    </>
  );
}
