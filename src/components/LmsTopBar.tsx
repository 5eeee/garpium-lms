"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { IconBell, IconMenu } from "@/components/ui/LmsIcon";
import { lmsPageTitle } from "@/lib/lms-page-titles";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function LmsTopBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <header className="lms-topbar">
      {onMenuToggle ? (
        <button type="button" className="lms-icon-btn lms-mobile-nav-toggle" onClick={onMenuToggle} aria-label="Меню">
          <IconMenu size={20} />
        </button>
      ) : null}
      <h1 className="lms-topbar__title">{lmsPageTitle(pathname)}</h1>
      <div className="lms-topbar__actions">
        <Link className="lms-icon-btn" href="/dashboard#settings" title="Уведомления">
          <IconBell size={20} />
        </Link>
        <div className="lms-topbar__menu-wrap" ref={menuRef}>
          <button
            className="lms-topbar__avatar"
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {initials(user?.name, user?.email)}
          </button>
          {menuOpen ? (
            <div className="lms-topbar__dropdown" role="menu">
              <Link href="/dashboard" role="menuitem" onClick={() => setMenuOpen(false)}>
                Личный кабинет
              </Link>
              <Link href="/dashboard#settings" role="menuitem" onClick={() => setMenuOpen(false)}>
                Настройки
              </Link>
              <Link href="/security" role="menuitem" onClick={() => setMenuOpen(false)}>
                Безопасность
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                Выйти
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
