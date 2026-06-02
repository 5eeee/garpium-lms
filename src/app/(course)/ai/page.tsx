import { requireApproved } from "@/lib/session";

const features = ["Генерация курса", "Генерация тестов", "AI-наставник", "AI-аналитик руководителя"];

export default async function AiPage() {
  await requireApproved();
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">AI Services</span>
        <h1 className="course-title">AI-модуль Garpium</h1>
        <p className="course-lead">Архитектурная точка входа для генерации курсов, тестов и анализа прогресса.</p>
      </header>
      <section className="lesson-grid">
        {features.map((feature) => (
          <article className="explain-card span-6" key={feature}>
            <h2>{feature}</h2>
            <p className="lesson-text">Функция будет подключена после выбора провайдера и политики безопасности данных.</p>
          </article>
        ))}
      </section>
    </>
  );
}
