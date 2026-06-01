import Link from "next/link";
import type { Progress } from "@prisma/client";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { CertificateBlock } from "@/components/CertificateBlock";
import { LogoutButton } from "@/components/LogoutButton";
import { MyCompanySection } from "@/components/MyCompanySection";
import { isCompanyAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    include: {
      progress: true,
      certificates: true,
      company: true,
      joinRequests: {
        where: { status: "PENDING" },
        include: { company: true },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  const htmlDone = user?.progress.filter((item: Progress) => item.lessonId.startsWith("h-") && item.status === "DONE").length || 0;
  const cssDone = user?.progress.filter((item: Progress) => item.lessonId.startsWith("c-") && item.status === "DONE").length || 0;
  const pending = user?.approvalStatus !== "APPROVED";
  const totalDone = htmlDone + cssDone;
  const certificate = user?.certificates.find((item) => item.status === "ISSUED");
  const pendingJoin = user?.joinRequests[0] || null;

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Profile</span>
        <h1 className="course-title">Личный кабинет</h1>
        <p className="course-lead">
          {user?.firstName || "Пользователь"}, статус: <strong>{user?.approvalStatus}</strong>. Очки:{" "}
          <strong>{user?.points || 0}</strong>.
        </p>
      </header>

      {pending ? (
        <section className="explain-card span-12">
          <h2>Доступ ожидает одобрения</h2>
          <p>Администратор проверит заявку. После одобрения откроются уроки и прогресс.</p>
          <Link className="course-button" href="/pending">
            Подробнее
          </Link>
        </section>
      ) : null}

      <section className="lesson-grid">
        <MyCompanySection
          company={user?.company || null}
          pendingJoin={pendingJoin}
          pendingVerification={user?.company?.verificationStatus === "PENDING_VERIFICATION"}
        />

        <article className="lesson-card span-6">
          <span className="card-label">Прогресс HTML</span>
          <h2>{htmlDone} / 60</h2>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${(htmlDone / 60) * 100}%` }} />
          </div>
        </article>

        <article className="lesson-card span-6">
          <span className="card-label">Прогресс CSS</span>
          <h2>{cssDone} / 60</h2>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${(cssDone / 60) * 100}%` }} />
          </div>
        </article>

        <article className="lesson-card span-12">
          <span className="card-label">Очки</span>
          <h2>{user?.points || 0}</h2>
          <p className="lesson-text">+10 за каждый пройденный урок с заданием.</p>
        </article>

        <CertificateBlock
          canIssue={totalDone >= 120 && !certificate}
          certificate={certificate}
          name={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
          points={user?.points || 0}
        />

        {totalDone < 120 ? (
          <article className="explain-card span-12">
            <h2>Как получить сертификат</h2>
            <p>
              Пройдите все 60 уроков HTML и 60 уроков CSS. На каждом уроке выполните практику и нажмите «Проверить».
            </p>
          </article>
        ) : null}
      </section>

      {!pending ? (
        <footer className="course-footer">
          <Link className="course-button" href="/courses/html">
            Карта HTML
          </Link>
          <Link className="course-button" href="/games">
            Игры
          </Link>
          <Link className="course-button is-primary" href="/courses/css">
            Карта CSS
          </Link>
          {isCompanyAdmin(session.user.role) ? (
            <Link className="course-button" href="/company">
              Кабинет компании
            </Link>
          ) : null}
          <LogoutButton />
        </footer>
      ) : (
        <footer className="course-footer">
          <LogoutButton />
        </footer>
      )}
    </>
  );
}
