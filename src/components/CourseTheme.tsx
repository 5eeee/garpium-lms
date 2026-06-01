"use client";

import { usePathname } from "next/navigation";

export function CourseTheme({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHtml =
    pathname.includes("/courses/html") ||
    pathname.includes("/lessons/h-") ||
    (pathname.startsWith("/admin/content/") && pathname.includes("h-"));

  const theme = isHtml ? "theme-html" : "theme-css";

  return (
    <div className={`course-app ${theme}`}>
      <main className="course-shell">{children}</main>
    </div>
  );
}
