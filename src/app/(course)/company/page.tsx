import Link from "next/link";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { requireCompanyPanel, getCompanyForPanel, getSession } from "@/lib/session";
import { JoinRequestActions } from "@/components/JoinRequestActions";
import { LogoutButton } from "@/components/LogoutButton";
import { isCompanyAdmin, verificationLabel } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  await requireCompanyPanel();
  const session = await getSession();
  const canManage = isCompanyAdmin(session?.user?.role);
  const company = await getCompanyForPanel();

  if (!company) {
    return (
      <>
        <header className="course-top">
          <span className="course-kicker">Company</span>
          <h1 className="course-title">Кабинет компании</h1>
          <p className="course-lead">Организация не привязана к аккаунту.</p>
        </header>
        <footer className="course-footer">
          <Link className="course-button" href="/dashboard">
            Личный кабинет
          </Link>
          <LogoutButton />
        </footer>
      </>
    );
  }

  const [members, joinRequests, invitations, departments] = await Promise.all([
    db.organizationMember.findMany({
      where: { companyId: company.id, status: "ACTIVE" },
      include: { user: true, department: true },
      orderBy: { joinedAt: "desc" }
    }),
    db.joinRequest.findMany({
      where: { companyId: company.id, status: "PENDING" },
      include: { user: true, invitation: true },
      orderBy: { createdAt: "desc" }
    }),
    db.invitation.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    db.department.count({ where: { companyId: company.id } })
  ]);

  const verified = company.verificationStatus === "VERIFIED";

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Company</span>
        <h1 className="course-title">{company.name}</h1>
        <p className="course-lead">
          Статус организации: <strong>{verificationLabel(company.verificationStatus)}</strong>
          {!verified ? " · Корпоративные функции ограничены до проверки." : null}
        </p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-4">
          <span className="card-label">Сотрудники</span>
          <h2>{members.length}</h2>
          <Link className="course-button" href="/company/employees">
            Управление
          </Link>
        </article>
        <article className="lesson-card span-4">
          <span className="card-label">Заявки</span>
          <h2>{joinRequests.length}</h2>
          <Link className="course-button" href="/company/invitations">
            Приглашения
          </Link>
        </article>
        <article className="lesson-card span-4">
          <span className="card-label">Отделы</span>
          <h2>{departments}</h2>
          <Link className="course-button" href="/company/departments">
            Структура
          </Link>
        </article>
        {verified ? (
          <article className="lesson-card span-4">
            <span className="card-label">Курсы</span>
            <h2>Назначения</h2>
            <Link className="course-button is-primary" href="/company/courses">
              Назначить
            </Link>
          </article>
        ) : null}

        <article className="lesson-card span-12">
          <span className="card-label">Заявки на вступление</span>
          <h2>{joinRequests.length ? "Требуют решения" : "Нет новых заявок"}</h2>
          {joinRequests.length ? (
            joinRequests.map((request) => (
              <div className="admin-row" key={request.id}>
                <span>
                  {request.user.firstName} {request.user.lastName}
                  <small>
                    {request.user.email}
                    {request.invitation ? ` · ${request.invitation.displayCode}` : ""}
                  </small>
                </span>
                {canManage ? <JoinRequestActions requestId={request.id} /> : null}
              </div>
            ))
          ) : (
            <p className="lesson-text">
              Сотрудники подключаются через приглашения или корпоративный домен email.
            </p>
          )}
        </article>

        <article className="lesson-card span-12">
          <span className="card-label">Активные приглашения</span>
          <h2>{invitations.filter((i) => i.active).length}</h2>
          {invitations.length ? (
            invitations.map((invite) => (
              <div className="admin-row" key={invite.id}>
                <span>
                  <code>{invite.displayCode}</code>
                  <small>
                    {invite.type === "SINGLE_USE" ? "одноразовое" : "многоразовое"} · использований:{" "}
                    {invite.useCount}
                    {invite.maxUses ? ` / ${invite.maxUses}` : ""}
                    {!invite.active ? " · неактивно" : ""}
                  </small>
                </span>
              </div>
            ))
          ) : (
            <p className="lesson-text">
              <Link href="/company/invitations">Создайте приглашение</Link> для подключения сотрудников.
            </p>
          )}
        </article>
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/company/courses">
          Курсы
        </Link>
        <Link className="course-button" href="/company/settings">
          Настройки
        </Link>
        <Link className="course-button is-primary" href="/dashboard">
          Личный кабинет
        </Link>
        <LogoutButton />
      </footer>
    </>
  );
}
