"use client";

import { useEffect } from "react";
import { applyLmsTheme, getStoredTheme } from "@/lib/lms-theme";

export function CourseTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyLmsTheme(getStoredTheme());
  }, []);

  return <div className="lms-app course-app">{children}</div>;
}
