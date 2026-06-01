"use client";

import { useState } from "react";
import Link from "next/link";

const levels = [
  {
    q: "Выбери все абзацы <p>",
    options: ["p", ".p", "#p", "*p"],
    answer: 0,
    explain: "Селектор по тегу - просто имя тега без точки и решётки."
  },
  {
    q: "Выбери элемент с классом card",
    options: ["card", ".card", "#card", "card()"],
    answer: 1,
    explain: "Класс всегда с точкой: .card"
  },
  {
    q: "Выбери элемент с id header",
    options: [".header", "header", "#header", "*header"],
    answer: 2,
    explain: "Id с решёткой: #header."
  },
  {
    q: "Прямой дочерний div внутри .menu",
    options: [".menu div", ".menu > div", ".menu + div", ".menu ~ div"],
    answer: 1,
    explain: "Комбинатор > - только прямые дети."
  },
  {
    q: "Элемент при наведении мыши",
    options: [":active", ":hover", "::hover", ":focus"],
    answer: 1,
    explain: ":hover - когда курсор над элементом."
  },
  {
    q: "Первый дочерний элемент родителя",
    options: [":first", ":first-child", "::first", ":child(1)"],
    answer: 1,
    explain: ":first-child - первый ребёнок среди соседей."
  }
];

export function SelectorGame() {
  const [level, setLevel] = useState(0);
  const [msg, setMsg] = useState("");
  const [msgClass, setMsgClass] = useState("selector-game__msg");
  const [showNext, setShowNext] = useState(false);
  const [locked, setLocked] = useState(false);

  const lv = levels[level];
  const progress = ((level + 1) / levels.length) * 100;

  function pick(index: number) {
    if (locked) return;
    setLocked(true);
    if (index === lv.answer) {
      setMsg(`✓ ${lv.explain}`);
      setMsgClass("selector-game__msg is-success");
      setShowNext(true);
    } else {
      setMsg("✗ Неверно. Подумай: тег, класс или id?");
      setMsgClass("selector-game__msg is-error");
    }
  }

  function next() {
    if (level >= levels.length - 1) return;
    setLevel(level + 1);
    setMsg("");
    setMsgClass("selector-game__msg");
    setShowNext(false);
    setLocked(false);
  }

  return (
    <div className="selector-game span-12">
      <div className="selector-game__progress-wrap">
        <div className="selector-game__progress" style={{ width: `${progress}%` }} />
      </div>
      <p className="selector-game__question">{lv.q}</p>
      <div className="selector-game__options">
        {lv.options.map((opt, i) => (
          <button
            className={`selector-game__opt${locked ? (i === lv.answer ? " is-correct" : i !== lv.answer && msgClass.includes("error") ? " is-wrong" : "") : ""}`}
            disabled={locked}
            key={opt}
            onClick={() => pick(i)}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
      {msg ? <p className={msgClass}>{msg}</p> : null}
      {showNext ? (
        level === levels.length - 1 ? (
          <Link className="selector-game__next" href="/games/flex">
            Flex игра →
          </Link>
        ) : (
          <button className="selector-game__next" onClick={next} type="button">
            Дальше →
          </button>
        )
      ) : null}
    </div>
  );
}
