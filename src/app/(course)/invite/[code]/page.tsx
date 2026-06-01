import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { normalizeInviteCode } from "@/lib/invites";
import { InviteAcceptForm, InviteGuestActions } from "@/components/InviteAcceptForm";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = normalizeInviteCode(raw);

  const invitation = await db.invitation.findUnique({
    where: { code },
    include: { company: true, department: true }
  });

  if (!invitation || !invitation.active) {
    return (
      <>
        <header className="course-top">
          <h1 className="course-title">Приглашение не найдено</h1>
          <p className="course-lead">Ссылка недействительна или уже использована.</p>
        </header>
        <Link className="course-button" href="/login">
          На страницу входа
        </Link>
      </>
    );
  }

  const session = await getSession();

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Invite</span>
        <h1 className="course-title">Приглашение в «{invitation.company.name}»</h1>
        <p className="course-lead">
          Код: <code>{invitation.displayCode}</code>
          {invitation.department ? ` · отдел ${invitation.department.name}` : null}
          {invitation.jobTitle ? ` · ${invitation.jobTitle}` : null}
        </p>
      </header>

      <section className="lesson-grid">
        <article className="explain-card span-12">
          <h2>Как это работает</h2>
          <ol className="company-steps">
            <li>Примите приглашение — создаётся заявка на вступление.</li>
            <li>Администратор организации подтверждает заявку.</li>
            <li>После одобрения откроется доступ к корпоративному обучению.</li>
          </ol>
          {session?.user?.email ? (
            <InviteAcceptForm code={invitation.displayCode} />
          ) : (
            <>
              <p className="lesson-text">Войдите или зарегистрируйтесь, чтобы принять приглашение.</p>
              <InviteGuestActions code={code} />
            </>
          )}
        </article>
      </section>
    </>
  );
}
