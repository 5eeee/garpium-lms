import Link from "next/link";
import { IconBook, IconGraduation, IconShield, IconTrending, IconZap } from "@/components/ui/LmsIcon";
import { MyCompanySection } from "@/components/MyCompanySection";
import { StatRing } from "@/components/dashboard/StatRing";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { AccountSettingsTab } from "@/components/dashboard/AccountSettingsTab";
import type { getDashboardData } from "@/lib/dashboard-data";

type DashboardData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function profileVerificationIssues(user: DashboardData["user"]) {
  const items: string[] = [];
  if (!user.emailVerifiedAt) items.push("подтвердите email");
  if (!user.phone) items.push("привяжите номер телефона");
  else if (!user.phoneVerifiedAt) items.push("подтвердите телефон");
  if (!user.esiaVerifiedAt) items.push("пройдите проверку через Госуслуги");
  return items;
}

function ProfileVerificationBanner({ user }: { user: DashboardData["user"] }) {
  const issues = profileVerificationIssues(user);
  if (!issues.length) return null;

  return (
    <section className="dash-verify-banner">
      <div className="dash-verify-banner__icon" aria-hidden>
        <IconShield size={22} />
      </div>
      <div className="dash-verify-banner__body">
        <strong>Подтвердите личные данные</strong>
        <p>
          {issues.length === 1
            ? `Чтобы пользоваться всеми функциями платформы, ${issues[0]}.`
            : `Осталось: ${issues.join(", ")}.`}
        </p>
      </div>
      <Link className="course-button is-accent dash-verify-banner__action" href="/dashboard#settings">
        В настройки
      </Link>
    </section>
  );
}

export function DashboardView({ data, pending }: { data: DashboardData; pending: boolean }) {
  const { user, level, levelTitle, issuedCerts, accessibleCourses } = data;
  const pendingJoin = user.joinRequests[0] ?? null;
  const featuredCourse = accessibleCourses[0] ?? null;
  const doneLessonIds = new Set(user.progress.filter((item) => item.status === "DONE").map((item) => item.lessonId));
  const featuredLessonIds = featuredCourse?.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)) ?? [];
  const featuredDone = featuredLessonIds.filter((id) => doneLessonIds.has(id)).length;
  const featuredPercent = featuredLessonIds.length > 0 ? Math.round((featuredDone / featuredLessonIds.length) * 100) : 0;

  const totalLessons = accessibleCourses.reduce(
    (sum, course) => sum + course.modules.reduce((m, mod) => m + mod.lessons.length, 0),
    0
  );
  const lessonsPercent = totalLessons > 0 ? Math.round((data.completedLessons / totalLessons) * 100) : 0;
  const coursesStarted = accessibleCourses.filter((course) => {
    const ids = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    return ids.some((id) => doneLessonIds.has(id));
  }).length;
  const coursesPercent =
    accessibleCourses.length > 0 ? Math.round((coursesStarted / accessibleCourses.length) * 100) : 0;
  const levelProgress = user.points % 100;
  const pointsPercent = levelProgress;

  const progressPanel = (
    <>
      {pending ? (
        <section className="dash-card dash-card--wide">
          <h2>Аккаунт ожидает одобрения</h2>
          <div className="dash-actions">
            <Link className="course-button is-accent" href="/pending">
              Подробнее
            </Link>
          </div>
        </section>
      ) : null}

      {!pending ? <ProfileVerificationBanner user={user} /> : null}

      <section className="dash-continue">
        <p className="dash-continue__label">Продолжить обучение</p>
        {featuredCourse ? (
          <>
            <div className="dash-continue__row">
              <div className="dash-continue__meta">
                <strong>{featuredCourse.title}</strong>
                <small>
                  {featuredDone}/{featuredLessonIds.length} уроков · {featuredPercent}%
                </small>
              </div>
              <div className="dash-continue__track">
                <div className="dash-progress" aria-hidden>
                  <span style={{ width: `${featuredPercent}%` }} />
                </div>
                <span className="dash-course__pct">{featuredPercent}%</span>
              </div>
              <Link className="course-button is-accent" href={`/learn/${featuredCourse.slug}`}>
                Продолжить →
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2>Курсы появятся после назначения</h2>
            <Link className="course-button is-accent" href="/learn">
              Открыть каталог
            </Link>
          </>
        )}
      </section>

      <div className="dash-stats dash-stats--rings">
        <StatRing
          accent="#e8622a"
          icon={<IconGraduation size={16} />}
          label="Завершено уроков"
          percent={lessonsPercent}
          value={data.completedLessons}
        />
        <StatRing
          accent="#0080ff"
          icon={<IconBook size={16} />}
          label="Курсов доступно"
          percent={coursesPercent}
          value={accessibleCourses.length}
        />
        <StatRing
          accent="#1d1d1b"
          icon={<IconZap size={16} />}
          label="Уровень"
          percent={pointsPercent}
          value={level}
        />
        <StatRing
          accent="#22a06b"
          icon={<IconTrending size={16} />}
          label="Баллы"
          percent={pointsPercent}
          value={user.points}
        />
      </div>

      <div className="dash-two-col">
        <section className="dash-card">
          <span className="dash-card__label">Достижения</span>
          <h2>
            Уровень {level} · {levelTitle}
          </h2>
          <div className="dash-metrics">
            <div className="dash-metric">
              Сертификаты
              <strong>{issuedCerts.length}</strong>
            </div>
            <div className="dash-metric">
              Баллы
              <strong>{user.points}</strong>
            </div>
          </div>
        </section>

        <section className="dash-card">
          <span className="dash-card__label">Активность</span>
          {user.auditLogs.length > 0 ? (
            <ul className="dash-list">
              {user.auditLogs.slice(0, 3).map((log) => (
                <li key={log.id}>
                  <span>{log.description}</span>
                  <span>{formatDate(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dash-empty">История пуста.</p>
          )}
        </section>
      </div>
    </>
  );

  const coursesPanel = (
    <>
      <section className="dash-card dash-card--wide">
        <span className="dash-card__label">Моё обучение</span>
        <h2>Программы и прогресс</h2>
        {accessibleCourses.length > 0 ? (
          <ul className="dash-list dash-list--boxed">
            {accessibleCourses.map((course) => {
              const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
              const doneCount = lessonIds.filter((id) => doneLessonIds.has(id)).length;
              const percent = lessonIds.length > 0 ? Math.round((doneCount / lessonIds.length) * 100) : 0;
              return (
                <li key={course.id} className="dash-course">
                  <div className="dash-course__title">
                    <span className="dash-course__icon" aria-hidden>
                      <IconGraduation size={18} />
                    </span>
                    <span>
                      <strong>{course.title}</strong>
                      <small>
                        {doneCount}/{lessonIds.length} уроков
                      </small>
                    </span>
                  </div>
                  <div className="dash-course__track">
                    <div className="dash-progress" aria-hidden>
                      <span style={{ width: `${percent}%` }} />
                    </div>
                    <span className="dash-course__pct">{percent}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="dash-empty">Курсы появятся после назначения.</p>
        )}
        <div className="dash-actions">
          <Link className="course-button is-accent" href="/learn">
            Каталог курсов
          </Link>
        </div>
      </section>

      <section className="dash-card">
        <span className="dash-card__label">Сертификаты</span>
        <h2>{issuedCerts.length} получено</h2>
        {issuedCerts.length > 0 ? (
          <ul className="dash-list">
            {issuedCerts.map((cert) => (
              <li key={cert.id}>
                <span>№ {cert.number}</span>
                <Link href={`/certificates/${cert.number}`}>{cert.issuedAt ? formatDate(cert.issuedAt) : "—"}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dash-empty">Пока нет сертификатов.</p>
        )}
      </section>
    </>
  );

  const companyPanel = (
    <>
      {data.showCompanyPanel && user.company ? (
        <Link className="dash-portal-link" href="/company">
          <div>
            <strong>Корпоративный кабинет</strong>
            <span>{user.company.name}</span>
          </div>
          <span className="course-button">Открыть →</span>
        </Link>
      ) : null}
      <MyCompanySection
        company={
          user.company
            ? {
                id: user.company.id,
                name: user.company.name,
                slug: user.company.slug,
                verificationStatus: user.company.verificationStatus,
                legalForm: user.company.legalForm,
                esiaVerifiedAt: user.company.esiaVerifiedAt?.toISOString() ?? null,
                inn: user.company.inn
              }
            : null
        }
        pendingJoin={pendingJoin}
        pendingVerification={user.company?.verificationStatus === "PENDING_VERIFICATION"}
      />
    </>
  );

  const settingsPanel = (
    <>
      {data.showPlatformPanel ? (
        <Link className="dash-portal-link" href="/admin">
          <div>
            <strong>Админ-панель платформы</strong>
            <span>Контент, пользователи, верификация</span>
          </div>
          <span className="course-button">Открыть →</span>
        </Link>
      ) : null}

      <AccountSettingsTab
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName,
          email: user.email,
          phone: user.phone,
          emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
          phoneVerifiedAt: user.phoneVerifiedAt?.toISOString() ?? null,
          esiaVerifiedAt: user.esiaVerifiedAt?.toISOString() ?? null,
          hasPassword: !!user.passwordHash
        }}
      />
    </>
  );

  return (
    <DashboardTabs
      avatarUrl={user.avatarUrl}
      companyPanel={companyPanel}
      coursesPanel={coursesPanel}
      firstName={user.firstName}
      lastName={user.lastName}
      middleName={user.middleName}
      progressPanel={progressPanel}
      settingsPanel={settingsPanel}
      tab="progress"
    />
  );
}
