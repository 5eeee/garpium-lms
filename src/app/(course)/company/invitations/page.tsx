import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";
import { InviteCreateForm } from "@/components/InviteCreateForm";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function CompanyInvitationsPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  const invitations = await db.invitation.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" }
  });

  const verified = company.verificationStatus === "VERIFIED";

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Company</span>
        <h1 className="course-title">Приглашения</h1>
        <p className="course-lead">
          {verified
            ? "Создавайте одноразовые и многоразовые коды для безопасного подключения сотрудников."
            : "Приглашения будут доступны после верификации организации."}
        </p>
      </header>

      <section className="lesson-grid">
        {verified ? (
          <article className="lesson-card span-12">
            <span className="card-label">Новое приглашение</span>
            <InviteCreateForm />
          </article>
        ) : null}

        <article className="lesson-card span-12">
          <span className="card-label">Список</span>
          {invitations.length ? (
            invitations.map((invite) => (
              <div className="admin-row" key={invite.id}>
                <span>
                  <code>{invite.displayCode}</code>
                  <small>
                    /invite/{invite.code} · {invite.type} · {invite.useCount} активаций
                    {!invite.active ? " · закрыто" : ""}
                  </small>
                </span>
              </div>
            ))
          ) : (
            <p className="lesson-text">Приглашений пока нет.</p>
          )}
        </article>
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/company">
          ← Дашборд
        </Link>
        <LogoutButton />
      </footer>
    </>
  );
}
