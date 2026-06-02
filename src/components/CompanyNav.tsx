"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY_NAV, liveNavLinks } from "@/lib/nav-config";

export function CompanyNav() {
  const pathname = usePathname();
  const links = liveNavLinks(COMPANY_NAV);

  return (
    <nav className="course-nav course-nav--top" aria-label="Кабинет компании">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link className={active ? "is-active" : undefined} href={link.href} key={link.href}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
