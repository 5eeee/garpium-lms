import "./lms-base.css";
import "./lms-shell.css";
import "./lms-theme.css";
import "./course-overrides.css";
import "./dashboard/dashboard.css";
import Script from "next/script";
import { headers } from "next/headers";
import { CourseTheme } from "@/components/CourseTheme";
import { CourseShell } from "@/components/CourseShell";
import { getCompanyBySubdomain } from "@/lib/company";
import { LMS_THEME_BOOT_SCRIPT } from "@/lib/lms-theme";

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const subdomain = headerList.get("x-company-subdomain");
  const company = subdomain ? await getCompanyBySubdomain(subdomain) : null;

  return (
    <>
      <Script id="lms-theme-boot" strategy="beforeInteractive">
        {LMS_THEME_BOOT_SCRIPT}
      </Script>
      <CourseTheme>
        <CourseShell company={company}>{children}</CourseShell>
      </CourseTheme>
    </>
  );
}
