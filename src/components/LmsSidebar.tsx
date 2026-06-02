"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  IconBook,
  IconBuilding,
  IconDashboard,
  IconGraduation,
  IconGrid,
  IconHeadphones,
  IconMail,
  IconSettings,
  IconShield,
  IconTrending,
  IconUser,
  IconUsers,
  IconZap
} from "@/components/ui/LmsIcon";
import { LogoutButton } from "@/components/LogoutButton";
import { AUTHOR_NAV, COMPANY_NAV, MAIN_NAV, PLATFORM_NAV, liveNavLinks } from "@/lib/nav-config";
import { canAccessCompanyPanel, isInstructor, isSuperAdmin } from "@/lib/roles";

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  match?: string[];
  exact?: boolean;
};

const mainIcons: Record<string, NavItem["Icon"]> = {
  "/dashboard": IconDashboard,
  "/learn": IconGraduation,
  "/dashboard#company": IconBuilding,
  "/support": IconHeadphones
};

const companyIcons: Record<string, NavItem["Icon"]> = {
  "/company": IconGrid,
  "/company/employees": IconUsers,
  "/company/departments": IconBuilding,
  "/company/courses": IconBook,
  "/company/invitations": IconMail,
  "/company/analytics": IconTrending,
  "/company/settings": IconSettings
};

const platformIcons: Record<string, NavItem["Icon"]> = {
  "/admin/platform/organizations": IconShield,
  "/admin": IconZap,
  "/admin/moderation": IconShield
};

const authorIcons: Record<string, NavItem["Icon"]> = {
  "/admin/content": IconBook,
  "/studio/courses": IconGraduation
};

function isActive(pathname: string, href: string, match?: string[], exact?: boolean) {
  if (href.includes("#")) return false;
  if (pathname === href) return true;
  if (exact) return false;
  return match?.some((part) => pathname.startsWith(part)) ?? false;
}

function displayName(first?: string | null, last?: string | null, name?: string | null) {
  const full = `${first || ""} ${last || ""}`.trim();
  return full || name || "Пользователь";
}

export function LmsSidebar({
  open,
  onClose
}: {
  companyName?: string | null;
  companyLogo?: string | null;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const showCompany = canAccessCompanyPanel(session?.user?.role);
  const showPlatform = isSuperAdmin(session?.user?.role);
  const showAuthor = isInstructor(session?.user?.role);
  const user = session?.user;

  const mainNav: NavItem[] = liveNavLinks(MAIN_NAV).map((link) => ({
    href: link.href,
    label: link.label,
    Icon: mainIcons[link.href] || IconDashboard,
    match: link.href === "/dashboard" ? ["/dashboard", "/pending"] : link.href === "/learn" ? ["/learn"] : undefined,
    exact: link.exact
  }));

  const companyNav: NavItem[] = liveNavLinks(COMPANY_NAV).map((link) => ({
    href: link.href,
    label: link.label,
    Icon: companyIcons[link.href] || IconGrid,
    match: link.href === "/company" ? undefined : [link.href],
    exact: link.exact
  }));

  const platformNav: NavItem[] = liveNavLinks(PLATFORM_NAV).map((link) => ({
    href: link.href,
    label: link.label,
    Icon: platformIcons[link.href] || IconGrid,
    match:
      link.href === "/admin"
        ? ["/admin"]
        : link.href === "/admin/platform/organizations"
          ? ["/admin/platform"]
          : [link.href],
    exact: link.href === "/admin/platform/organizations"
  }));

  const authorNav: NavItem[] = liveNavLinks(AUTHOR_NAV).map((link) => ({
    href: link.href,
    label: link.label,
    Icon: authorIcons[link.href] || IconBook,
    match: [link.href]
  }));

  function onNavClick(href: string) {
    if (href.includes("#")) {
      window.location.hash = href.split("#")[1] || "";
    }
    onClose?.();
  }

  return (
    <>
      {open ? <div className="lms-sidebar-backdrop" onClick={onClose} aria-hidden /> : null}
      <aside className={`lms-sidebar${open ? " is-open" : ""}`} aria-label="Навигация">
        {user ? (
          <Link className="lms-sidebar__profile" href="/dashboard#settings" onClick={onClose}>
            <span className="lms-sidebar__avatar">
              {user.avatarUrl ? <img alt="" src={user.avatarUrl} /> : <IconUser size={22} />}
            </span>
            <span className="lms-sidebar__profile-text">
              <strong>{displayName(user.firstName, user.lastName, user.name)}</strong>
              <small>{user.email}</small>
            </span>
          </Link>
        ) : null}

        <p className="lms-sidebar__section">Основное</p>
        <ul className="lms-sidebar__nav">
          {mainNav.map((item) => (
            <li key={item.href}>
              {item.href.includes("#") ? (
                <a
                  className="lms-sidebar__link"
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavClick(item.href);
                  }}
                >
                  <item.Icon className="lms-sidebar__icon" />
                  {item.label}
                </a>
              ) : (
                <Link
                  className={`lms-sidebar__link${isActive(pathname, item.href, item.match, item.exact) ? " is-active" : ""}`}
                  href={item.href}
                  onClick={() => onClose?.()}
                >
                  <item.Icon className="lms-sidebar__icon" />
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {showCompany ? (
          <>
            <p className="lms-sidebar__section">Компания</p>
            <ul className="lms-sidebar__nav">
              {companyNav.map((item) => (
                <li key={item.href}>
                  <Link
                    className={`lms-sidebar__link${isActive(pathname, item.href, item.match, item.exact) ? " is-active" : ""}`}
                    href={item.href}
                    onClick={onClose}
                  >
                    <item.Icon className="lms-sidebar__icon" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {showPlatform ? (
          <>
            <p className="lms-sidebar__section">Платформа</p>
            <ul className="lms-sidebar__nav">
              {platformNav.map((item) => (
                <li key={item.href}>
                  <Link
                    className={`lms-sidebar__link${isActive(pathname, item.href, item.match, item.exact) ? " is-active" : ""}`}
                    href={item.href}
                    onClick={onClose}
                  >
                    <item.Icon className="lms-sidebar__icon" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {showAuthor ? (
          <>
            <p className="lms-sidebar__section">Автор</p>
            <ul className="lms-sidebar__nav">
              {authorNav.map((item) => (
                <li key={item.href}>
                  <Link
                    className={`lms-sidebar__link${isActive(pathname, item.href, item.match) ? " is-active" : ""}`}
                    href={item.href}
                    onClick={onClose}
                  >
                    <item.Icon className="lms-sidebar__icon" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className="lms-sidebar__footer">
          <LogoutButton className="lms-sidebar__logout" />
        </div>
      </aside>
    </>
  );
}
