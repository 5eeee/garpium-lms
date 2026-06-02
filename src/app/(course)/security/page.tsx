import Link from "next/link";
import { requireApproved } from "@/lib/session";

export default async function SecurityPage() {
  await requireApproved();
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Security Center</span>
        <h1 className="course-title">Безопасность аккаунта</h1>
        <p className="course-lead">Управление паролем и подтверждением личности.</p>
      </header>
      <section className="lesson-grid">
        <article className="lesson-card span-6">
          <span className="card-label">Пароль</span>
          <h2>Смена пароля</h2>
          <p className="lesson-text">Отправьте код на email или SMS из профиля, затем задайте новый пароль.</p>
          <Link className="course-button is-accent" href="/dashboard#settings">
            Открыть профиль
          </Link>
        </article>
        <article className="lesson-card span-6">
          <span className="card-label">Госуслуги</span>
          <h2>Подтверждение личности</h2>
          <p className="lesson-text">Верификация через ЕСИА доступна в разделе «Профиль».</p>
          <Link className="course-button" href="/dashboard#settings">
            Перейти в профиль
          </Link>
        </article>
        <article className="explain-card span-12">
          <h2>2FA и сессии</h2>
          <p className="lesson-text">
            Двухфакторная авторизация и управление активными устройствами — в roadmap (см. docs/ITERATIONS.md).
          </p>
        </article>
      </section>
    </>
  );
}
