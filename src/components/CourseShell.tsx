"use client";

import { useState } from "react";
import { LmsSidebar } from "@/components/LmsSidebar";
import { LmsTopBar } from "@/components/LmsTopBar";
import { PoweredByGarpium } from "@/components/GarpiumLogo";
import type { CompanyBranding } from "@/lib/company";

export function CourseShell({
  children,
  company = null
}: {
  children: React.ReactNode;
  company?: CompanyBranding | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showPoweredBy = company ? company.showPoweredBy : true;

  return (
    <div className="lms-shell">
      <LmsSidebar
        companyLogo={company?.logoUrl}
        companyName={company?.name}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lms-main">
        <LmsTopBar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <div className="lms-content">
          <div className="lms-content__inner">
            {children}
            {showPoweredBy ? <PoweredByGarpium /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
