import { CourseNav } from "@/components/CourseNav";
import { GarpiumLogo, PoweredByGarpium } from "@/components/GarpiumLogo";
import type { CompanyBranding } from "@/lib/company";

export function CourseShell({
  children,
  showNav = true,
  company = null
}: {
  children: React.ReactNode;
  showNav?: boolean;
  company?: CompanyBranding | null;
}) {
  const showPoweredBy = company ? company.showPoweredBy : true;

  return (
    <>
      <header className="course-app-header">
        <div className="course-app-header__brand">
          {company?.logoUrl ? (
            <>
              <img alt={company.name} className="course-app-header__company-logo" src={company.logoUrl} />
              <span className="course-app-header__company-name">{company.name}</span>
            </>
          ) : (
            <GarpiumLogo />
          )}
        </div>
        {showNav ? <CourseNav /> : null}
      </header>
      <div className="course-content">
        {children}
        {showPoweredBy ? <PoweredByGarpium /> : null}
      </div>
    </>
  );
}
