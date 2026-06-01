"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({ className = "course-button" }: { className?: string }) {
  return (
    <button
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      Выйти
    </button>
  );
}
