import { CompanyNav } from "@/components/CompanyNav";
import { requireCompanyPanel } from "@/lib/session";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  await requireCompanyPanel();
  return (
    <div className="company-zone">
      <CompanyNav />
      {children}
    </div>
  );
}
