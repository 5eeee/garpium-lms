import Link from "next/link";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";
import { OrganizationVerificationActions } from "@/components/OrganizationVerificationActions";
import { verificationLabel } from "@/lib/roles";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function PlatformOrganizationsPage() {
  await requireSuperAdmin();

  const [pending, recent] = await Promise.all([
    db.company.findMany({
      where: { verificationStatus: "PENDING_VERIFICATION", isGarpium: false },
      include: { owner: true },
      orderBy: { createdAt: "desc" }
    }),
    db.company.findMany({
      where: { verificationStatus: { not: "PENDING_VERIFICATION" }, isGarpium: false },
      include: { owner: true },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Platform</span>
        <h1 className="course-title">Верификация организаций</h1>
        <p className="course-lead">
          Проверка заявок на создание компаний. После подтверждения открываются корпоративные функции.
        </p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-12">
          <span className="card-label">Ожидают проверки</span>
          <h2>{pending.length}</h2>
          {pending.length ? (
            pending.map((org) => (
              <div className="admin-row admin-row--stack" key={org.id}>
                <span>
                  <strong>{org.name}</strong>
                  <small>
                    {org.inn ? `ИНН ${org.inn} · ` : ""}
                    {org.corporateEmail || org.owner?.email || "—"} · код {org.slug}
                  </small>
                  {org.legalName ? <small>{org.legalName}</small> : null}
                  {org.legalAddress ? <small>{org.legalAddress}</small> : null}
                  {org.additionalInfo ? <small>{org.additionalInfo}</small> : null}
                </span>
                <OrganizationVerificationActions organizationId={org.id} />
              </div>
            ))
          ) : (
            <p className="lesson-text">Новых заявок нет.</p>
          )}
        </article>

        <article className="lesson-card span-12">
          <span className="card-label">История</span>
          <h2>Последние решения</h2>
          {recent.length ? (
            recent.map((org) => (
              <div className="admin-row" key={org.id}>
                <span>
                  {org.name}
                  <small>
                    {verificationLabel(org.verificationStatus)} · {org.owner?.email || "—"}
                  </small>
                </span>
              </div>
            ))
          ) : (
            <p className="lesson-text">История пуста.</p>
          )}
        </article>
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/admin">
          ← LMS Admin
        </Link>
        <LogoutButton />
      </footer>
    </>
  );
}
