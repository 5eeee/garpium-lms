"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const links = [
  { href: "/", label: "Главная" },
  { href: "/courses/html", label: "Карта", match: ["/courses"] },
  { href: "/games", label: "Игры", match: ["/games"] },
  { href: "/glossary", label: "Глоссарий", match: ["/glossary"] },
  { href: "/dashboard", label: "Профиль", match: ["/dashboard"] },
  { href: "/support", label: "Поддержка", match: ["/support"] }
];

import { isCompanyAdmin } from "@/lib/roles";

export function CourseNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const showCompany = isCompanyAdmin(session?.user?.role);

  function isActive(href: string, match?: string[]) {
    if (pathname === href) return true;
    if (match?.some((part) => pathname.startsWith(part))) return true;
    return false;
  }

  return (
    <nav className="course-nav course-nav--top" aria-label="Навигация">
      {links.map((link) => (
        <Link className={isActive(link.href, link.match) ? "is-active" : undefined} href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
      {showCompany ? (
        <Link className={pathname.startsWith("/company") ? "is-active" : undefined} href="/company">
          Компания
        </Link>
      ) : null}
    </nav>
  );
}
