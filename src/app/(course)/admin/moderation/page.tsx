import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";

export default async function AdminModerationPage() {
  await requireSuperAdmin();
  const [pendingUsers, pendingOrgs] = await Promise.all([
    db.user.count({ where: { approvalStatus: "PENDING" } }),
    db.company.count({ where: { verificationStatus: "PENDING_VERIFICATION" } })
  ]);

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Moderation</span>
        <h1 className="course-title">Модерация платформы</h1>
        <p className="course-lead">Очереди проверки пользователей и организаций.</p>
      </header>
      <section className="lesson-grid">
        <article className="lesson-card span-6">
          <span className="card-label">Пользователи</span>
          <h2>{pendingUsers}</h2>
          <p className="lesson-text">Ожидают одобрения аккаунта.</p>
          <Link className="course-button" href="/admin">
            Админ LMS
          </Link>
        </article>
        <article className="lesson-card span-6">
          <span className="card-label">Организации</span>
          <h2>{pendingOrgs}</h2>
          <p className="lesson-text">Ожидают верификации Garpium.</p>
          <Link className="course-button is-accent" href="/admin/platform/organizations">
            Открыть верификацию
          </Link>
        </article>
      </section>
    </>
  );
}
