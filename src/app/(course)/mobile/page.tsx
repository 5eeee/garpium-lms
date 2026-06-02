export default function MobilePlatformPage() {
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Mobile</span>
        <h1 className="course-title">Мобильная платформа</h1>
        <p className="course-lead">PWA-режим, мини-уроки, квизы, уведомления, сертификаты и offline-доступ.</p>
      </header>
      <section className="lesson-grid">
        {["Мини-уроки", "Квизы", "Push-уведомления", "Offline"].map((item) => (
          <article className="lesson-card span-3" key={item}>
            <span className="card-label">PWA</span>
            <h2>{item}</h2>
            <p className="lesson-text">Адаптация интерфейса под телефон без смены визуальной системы.</p>
          </article>
        ))}
      </section>
    </>
  );
}
