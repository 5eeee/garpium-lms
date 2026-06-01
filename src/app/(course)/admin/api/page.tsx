import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { ApiKeysManager } from "@/components/ApiKeysManager";

export const dynamic = "force-dynamic";

export default async function AdminApiPage() {
  await requireAdmin();
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Partner API</span>
        <h1 className="course-title">API для компаний</h1>
        <p className="course-lead">
          GARPIUM LMS - white-label обучение HTML/CSS для ваших клиентов и партнёров.
        </p>
      </header>
      <ApiKeysManager />
      <footer className="course-footer">
        <Link className="course-button" href="/admin">← Админка</Link>
        <Link className="course-button is-primary" href="/integration">
          Документация →
        </Link>
      </footer>
    </>
  );
}
