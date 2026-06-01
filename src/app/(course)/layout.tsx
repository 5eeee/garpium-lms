import "../../../style.css";
import "./course-overrides.css";
import { headers } from "next/headers";
import { CourseTheme } from "@/components/CourseTheme";
import { CourseShell } from "@/components/CourseShell";
import { getCompanyBySubdomain } from "@/lib/company";

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const subdomain = headerList.get("x-company-subdomain");
  const company = subdomain ? await getCompanyBySubdomain(subdomain) : null;

  return (
    <CourseTheme>
      <CourseShell company={company}>{children}</CourseShell>
    </CourseTheme>
  );
}
