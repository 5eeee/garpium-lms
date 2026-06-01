"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "LMS" },
  { href: "/admin/platform/organizations", label: "Организации" }
];

export function PlatformAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="course-nav course-nav--top" aria-label="Платформа">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link className={active ? "is-active" : undefined} href={link.href} key={link.href}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
