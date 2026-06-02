"use client";

import Link from "next/link";
import { GarpiumLogo } from "@/components/GarpiumLogo";
import { TrafficDots } from "@/components/TrafficDots";

const audiences = [
  {
    title: "Сотрудник",
    text: "Проходите назначенные программы, отслеживайте прогресс и получайте сертификаты."
  },
  {
    title: "HR и компания",
    text: "Приглашайте команду, назначайте курсы по отделам и контролируйте завершение."
  },
  {
    title: "Партнёр Garpium",
    text: "Верифицируйте организации, подключайте white-label и API для интеграций."
  }
];

const steps = [
  { n: "1", title: "Регистрация", text: "Создайте аккаунт или войдите через корпоративное SSO." },
  { n: "2", title: "Верификация", text: "Компания проходит проверку — сотрудники получают доступ." },
  { n: "3", title: "Назначение", text: "Администратор назначает программы обучения." },
  { n: "4", title: "Сертификат", text: "По итогам курса выдаётся подтверждение результата." }
];

export function HomeLanding() {
  return (
    <div className="is-home theme-html">
      <main className="page is-html" id="home-panel">
        <TrafficDots />
        <div className="home-garpium">
          <GarpiumLogo compact />
        </div>

        <div className="home-hero">
          <div className="hero">
            <div className="title-pill">
              <h1>Корпоративная LMS</h1>
            </div>
            <div className="logo-circle" aria-hidden />
            <p className="background-word" aria-hidden>
              GARPIUM
            </p>
          </div>

          <p className="home-lead">
            Многоарендная платформа обучения: компании, сотрудники, верификация и назначение программ — в
            одном интерфейсе.
          </p>

          <div className="home-stats">
            <span className="home-stats__pill">Multi-tenant</span>
            <span className="home-stats__pill">Корпоративный кабинет</span>
            <span className="home-stats__pill">Верификация org</span>
          </div>

          <div className="home-actions">
            <Link className="home-action" href="/login">
              Войти
            </Link>
            <Link className="home-action home-action--ghost" href="/register">
              Регистрация
            </Link>
          </div>
        </div>

        <section className="home-section" aria-labelledby="home-audience-title">
          <h2 id="home-audience-title" className="home-section__title">
            Для кого
          </h2>
          <div className="home-cards">
            {audiences.map((item) => (
              <article className="home-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section" aria-labelledby="home-steps-title">
          <h2 id="home-steps-title" className="home-section__title">
            Как это работает
          </h2>
          <ol className="home-steps">
            {steps.map((step) => (
              <li className="home-step" key={step.n}>
                <span className="home-step__n">{step.n}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="home-footer">
          <Link href="/login">Вход</Link>
          <Link href="/register">Регистрация</Link>
          <a href="https://garpium.com" rel="noreferrer" target="_blank">
            garpium.com
          </a>
        </footer>
      </main>
    </div>
  );
}
