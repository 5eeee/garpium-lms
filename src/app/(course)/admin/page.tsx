import Link from "next/link";
import type { CodeAttempt, Course, Lesson, Module, SupportThread, User } from "@prisma/client";
import { db } from "@/lib/db";
import { requireLmsAdmin } from "@/lib/session";
import { ApprovalButton } from "@/components/ApprovalButton";
import { getSession } from "@/lib/session";
import { isSuperAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

type CourseWithModules = Course & {
  modules: (Module & { lessons: Lesson[] })[];
};

type AttemptWithUser = CodeAttempt & {
  user: User;
};

type ThreadWithUser = SupportThread & {
  user: User;
  messages: { body: string; createdAt: Date }[];
};

export default async function AdminPage() {
  await requireLmsAdmin();
  const session = await getSession();
  const showPlatform = isSuperAdmin(session?.user?.role);
  const [pendingUsers, users, courses, attempts, threads] = await Promise.all([
    db.user.findMany({ where: { approvalStatus: "PENDING" }, orderBy: { createdAt: "desc" } }),
    db.user.findMany({ orderBy: { points: "desc" }, take: 20 }),
    db.course.findMany({ include: { modules: { include: { lessons: true } } } }),
    db.codeAttempt.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: true } }),
    db.supportThread.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } }
    })
  ]);

  const lessonCount = courses.flatMap((course: CourseWithModules) =>
    course.modules.flatMap((module: Module & { lessons: Lesson[] }) => module.lessons)
  ).length;

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Admin</span>
        <h1 className="course-title">Управление LMS</h1>
        <p className="course-lead">Одобрение студентов, контроль прогресса, курсы, попытки и поддержка.</p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-6">
          <span className="card-label">Заявки</span>
          <h2>{pendingUsers.length}</h2>
          {pendingUsers.length ? (
            pendingUsers.map((user: User) => (
              <div className="admin-row" key={user.id}>
                <span>
                  {user.firstName} {user.lastName}
                  <small>{user.email}</small>
                </span>
                <ApprovalButton userId={user.id} />
              </div>
            ))
          ) : (
            <p className="lesson-text">Новых заявок нет.</p>
          )}
        </article>

        <article className="lesson-card span-6">
          <span className="card-label">Рейтинг</span>
          <h2>Топ-20</h2>
          {users.map((user: User) => (
            <div className="admin-row" key={user.id}>
              <span>
                {user.firstName} {user.lastName}
                <small>{user.approvalStatus}</small>
              </span>
              <strong>{user.points}</strong>
            </div>
          ))}
        </article>

        <article className="lesson-card span-6">
          <span className="card-label">Контент</span>
          <h2>{lessonCount} уроков</h2>
          <p className="lesson-text">Курсов в базе: {courses.length}</p>
          <Link className="course-button is-primary" href="/admin/content">
            Открыть CMS
          </Link>
        </article>

        <article className="lesson-card span-6">
          <span className="card-label">Partner API</span>
          <h2>GARPIUM B2B</h2>
          <p className="lesson-text">Ключи для подключения других компаний</p>
          <Link className="course-button is-primary" href="/admin/api">
            API-ключи
          </Link>
        </article>

        {showPlatform ? (
          <article className="lesson-card span-6">
            <span className="card-label">Platform</span>
            <h2>Организации</h2>
            <p className="lesson-text">Верификация заявок на создание компаний</p>
            <Link className="course-button is-primary" href="/admin/platform/organizations">
              Верификация →
            </Link>
          </article>
        ) : null}

        <article className="lesson-card span-6">
          <span className="card-label">Попытки</span>
          <h2>Последние 10</h2>
          {attempts.map((attempt: AttemptWithUser) => (
            <div className="admin-row" key={attempt.id}>
              <span>
                {attempt.user.email}
                <small>{attempt.tier}</small>
              </span>
              <strong>{attempt.ok ? "OK" : "FAIL"}</strong>
            </div>
          ))}
        </article>

        <article className="lesson-card span-12">
          <span className="card-label">Поддержка</span>
          <h2>Обращения</h2>
          {threads.length ? (
            threads.map((thread: ThreadWithUser) => (
              <div className="admin-row" key={thread.id}>
                <span>
                  {thread.subject}
                  <small>
                    {thread.user.email} — {thread.messages[0]?.body.slice(0, 80)}
                  </small>
                </span>
                <strong>{thread.status}</strong>
              </div>
            ))
          ) : (
            <p className="lesson-text">Обращений пока нет.</p>
          )}
        </article>
      </section>
    </>
  );
}
