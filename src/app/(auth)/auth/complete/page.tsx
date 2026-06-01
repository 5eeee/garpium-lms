"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { getPostLoginPath } from "@/lib/roles";

export default function AuthCompletePage() {
  const router = useRouter();

  useEffect(() => {
    async function finish() {
      const session = await getSession();
      if (!session?.user?.email) {
        router.replace("/login");
        return;
      }
      router.replace(
        getPostLoginPath({
          role: session.user.role,
          approvalStatus: session.user.approvalStatus
        })
      );
      router.refresh();
    }
    finish();
  }, [router]);

  return (
    <div className="auth-page">
      <p className="auth-panel__lead" style={{ textAlign: "center" }}>
        Завершаем вход...
      </p>
    </div>
  );
}
