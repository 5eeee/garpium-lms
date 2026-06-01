"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MapTabs({ track }: { track: "html" | "css" }) {
  const pathname = usePathname();

  return (
    <div className="map-tabs">
      <Link
        className={`map-tabs__btn${track === "html" ? " is-active" : ""}`}
        href="/courses/html"
        aria-current={pathname.includes("/html") ? "page" : undefined}
      >
        HTML (60)
      </Link>
      <Link
        className={`map-tabs__btn${track === "css" ? " is-active" : ""}`}
        href="/courses/css"
        aria-current={pathname.includes("/css") ? "page" : undefined}
      >
        CSS (60)
      </Link>
    </div>
  );
}
