"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GarpiumLogo } from "@/components/GarpiumLogo";
import { TrafficDots } from "@/components/TrafficDots";

type Track = "html" | "css";

export function HomeLanding() {
  const [track, setTrack] = useState<Track>("html");

  useEffect(() => {
    const saved = localStorage.getItem("course_track");
    if (saved === "html" || saved === "css") {
      setTrack(saved);
    }
  }, []);

  function applyTrack(next: Track) {
    setTrack(next);
    localStorage.setItem("course_track", next);
  }

  const isHtml = track === "html";

  return (
    <div className={`is-home ${isHtml ? "theme-html" : "theme-css"}`}>
      <main className={`page ${isHtml ? "is-html" : "is-css"}`} id="home-panel">
        <TrafficDots />
        <div className="home-garpium">
          <GarpiumLogo compact />
        </div>

        <div className="track-switch" role="tablist" aria-label="Выбор курса">
          <button
            type="button"
            className={`track-switch__btn${isHtml ? " is-active" : ""}`}
            data-track="html"
            role="tab"
            aria-selected={isHtml}
            onClick={() => applyTrack("html")}
          >
            HTML
          </button>
          <button
            type="button"
            className={`track-switch__btn${!isHtml ? " is-active" : ""}`}
            data-track="css"
            role="tab"
            aria-selected={!isHtml}
            onClick={() => applyTrack("css")}
          >
            CSS
          </button>
        </div>

        <div className="hero">
          <div className="title-pill">
            <h1>{isHtml ? "Курс по HTML" : "Курс по CSS"}</h1>
          </div>
          <div className="logo-circle">
            <img src="/CSS.svg" alt="" className="css-logo" id="home-logo" />
          </div>
        </div>

        <p className="background-word" aria-hidden="true">
          {isHtml ? "HTML" : "CSS"}
        </p>

        <div className="home-stats">
          <span>120 уроков</span>
          <span>1.5 недели</span>
          <span>Свой проект</span>
          <span>Сертификат</span>
        </div>

        <nav className="home-actions" aria-label="Навигация курса">
          <Link className="home-action" href={isHtml ? "/lessons/h-01" : "/lessons/c-01"}>
            {isHtml ? "Начать HTML" : "Начать CSS"}
          </Link>
          <Link className="home-action home-action--ghost" href={isHtml ? "/courses/html" : "/courses/css"}>
            Карта курса
          </Link>
          <Link className="home-action home-action--ghost" href="/login">
            Личный кабинет
          </Link>
        </nav>
      </main>
    </div>
  );
}
