/**
 * Navigation registry — only `live: true` items appear in sidebar/CompanyNav.
 * Sync with docs/GARPIUM-IMPLEMENTATION-MAP.md and docs/ITERATIONS.md
 */

export type NavLinkDef = {
  href: string;
  label: string;
  exact?: boolean;
  /** Shown in navigation; route may still exist for direct URL */
  live: boolean;
};

/** Employee sidebar — Основное */
export const MAIN_NAV: NavLinkDef[] = [
  { href: "/dashboard", label: "Мой прогресс", live: true },
  { href: "/learn", label: "Обучение", live: true },
  { href: "/dashboard#company", label: "Моя компания", live: true },
  { href: "/support", label: "Помощь", live: true },
  // Wiki v1
  { href: "/knowledge", label: "База знаний", live: true }
];

/** Company admin sidebar + CompanyNav */
export const COMPANY_NAV: NavLinkDef[] = [
  { href: "/company", label: "Обзор", exact: true, live: true },
  { href: "/company/employees", label: "Сотрудники", live: true },
  { href: "/company/departments", label: "Отделы", live: true },
  { href: "/company/courses", label: "Курсы", live: true },
  { href: "/company/invitations", label: "Приглашения", live: true },
  { href: "/company/analytics", label: "Аналитика", live: true },
  { href: "/company/settings", label: "Настройки", live: true },
  { href: "/company/programs", label: "Программы", live: false },
  { href: "/company/knowledge", label: "База знаний", live: true },
  { href: "/company/onboarding", label: "Onboarding", live: false },
  { href: "/company/integrations", label: "Интеграции", live: false }
];

export const PLATFORM_NAV: NavLinkDef[] = [
  { href: "/admin/platform/organizations", label: "Верификация", live: true },
  { href: "/admin", label: "Админ LMS", live: true },
  { href: "/admin/moderation", label: "Модерация", live: true },
  { href: "/admin/marketplace", label: "Маркетплейс", live: false }
];

export const AUTHOR_NAV: NavLinkDef[] = [
  { href: "/admin/content", label: "Контент LMS", live: true },
  { href: "/studio/courses", label: "Мои курсы", live: true },
  { href: "/marketplace", label: "Маркетплейс", live: false }
];

export function liveNavLinks(links: NavLinkDef[]) {
  return links.filter((l) => l.live);
}
