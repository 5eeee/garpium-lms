"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/company", label: "Дашборд", exact: true },
  { href: "/company/employees", label: "Сотрудники" },
  { href: "/company/departments", label: "Отделы" },
  { href: "/company/courses", label: "Курсы" },
  { href: "/company/invitations", label: "Приглашения" },
  { href: "/company/settings", label: "Настройки" },
  { href: "/company/analytics", label: "Аналитика" },
  { href: "/admin/api", label: "API" },
  { href: "/integration", label: "Интеграции" }
];

export function CompanyNav() {
  const pathname = usePathname();

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
