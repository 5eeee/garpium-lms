"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const levels = [
  {
    title: "Уровень 1",
    text: "Растение в колонке 3 - дай ему воду через grid-column.",
    starter: ".garden {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  grid-template-rows: 1fr 1fr;\n}\n\n.water {\n\n}",
    check: (s: string) => /grid-column\s*:\s*3/.test(s),
    hint: ".water { grid-column: 3; }"
  },
  {
    title: "Уровень 2",
    text: "Растение во 2-й строке. Используй grid-row.",
    starter: ".garden {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  grid-template-rows: 1fr 1fr;\n}\n\n.water {\n\n}",
    check: (s: string) => /grid-row\s*:\s*2/.test(s),
    hint: ".water { grid-row: 2; }"
  },
  {
    title: "Уровень 3",
    text: "Займи две колонки: от 1 до 3 или span 2.",
    starter: ".garden {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n}\n\n.water {\n\n}",
    check: (s: string) => /grid-column\s*:\s*1\s*\/\s*3/.test(s) || /grid-column\s*:\s*span\s*2/.test(s),
    hint: "grid-column: 1 / 3; или grid-column: span 2;"
  },
  {
    title: "Уровень 4",
    text: "Сделай сетку 2×2 через grid-template-columns и rows.",
    starter: ".garden {\n  display: grid;\n\n}\n\n.water {\n  grid-column: 2;\n  grid-row: 2;\n}",
    check: (s: string) => /grid-template-columns\s*:\s*1fr\s+1fr/.test(s) && /grid-template-rows\s*:\s*1fr\s+1fr/.test(s),
    hint: "grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;"
  },
  {
    title: "Уровень 5",
    text: "Растение в правом нижнем углу 3×2.",
    starter: ".garden {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  grid-template-rows: 1fr 1fr;\n}\n\n.water {\n\n}",
    check: (s: string) => /grid-area\s*:\s*2\s*\/\s*3/.test(s) || (/grid-row\s*:\s*2/.test(s) && /grid-column\s*:\s*3/.test(s)),
    hint: "grid-row: 2; grid-column: 3;"
  },
  {
    title: "Уровень 6",
    text: "Добавь промежуток между грядками - gap: 12px.",
    starter: ".garden {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}\n\n.water {\n  grid-column: 2;\n}",
    check: (s: string) => /gap\s*:\s*12px/.test(s),
    hint: "gap: 12px;"
  }
];

export function GridGame() {
  const [level, setLevel] = useState(0);
  const [code, setCode] = useState(levels[0].starter);
  const [msg, setMsg] = useState("");
  const [msgClass, setMsgClass] = useState("grid-game__msg");
  const [win, setWin] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const lv = levels[level];
  const progress = ((level + 1) / levels.length) * 100;
  const liveCss = useMemo(() => code, [code]);

  function checkLevel() {
    if (lv.check(code)) {
      setMsg("Растение полито! Отлично.");
      setMsgClass("grid-game__msg is-success");
      setWin(true);
      setShowNext(true);
    } else {
      setMsg("Грядка сухая. Проверь grid-column / grid-row.");
      setMsgClass("grid-game__msg is-error");
      setWin(false);
      setShowNext(false);
    }
  }

  function nextLevel() {
    if (level >= levels.length - 1) return;
    const next = level + 1;
    setLevel(next);
    setCode(levels[next].starter);
    setMsg("");
    setMsgClass("grid-game__msg");
    setWin(false);
    setShowNext(false);
  }

  return (
    <div className={`grid-game span-12${win ? " is-win" : ""}`}>
      <style>{liveCss}</style>
      <div className="grid-game__sidebar">
        <div>
          <p className="grid-game__brand">Grid Сад</p>
          <p className="grid-game__level-title">
            {lv.title} / {levels.length}
          </p>
          <p className="grid-game__level-text">{lv.text}</p>
        </div>
        <textarea
          className="grid-game__editor"
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          value={code}
        />
        <div>
          <div className="grid-game__progress-wrap">
            <div className="grid-game__progress" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid-game__bar">
            <button className="grid-game__run" onClick={checkLevel} type="button">
              Полить
            </button>
            <button
              className="grid-game__hint"
              onClick={() => {
                setMsg(`Подсказка: ${lv.hint}`);
                setMsgClass("grid-game__msg is-hint");
              }}
              type="button"
            >
              Подсказка
            </button>
            {showNext ? (
              level === levels.length - 1 ? (
                <Link className="grid-game__next" href="/lessons/c-32">
                  Адаптив →
                </Link>
              ) : (
                <button className="grid-game__next" onClick={nextLevel} type="button">
                  Дальше →
                </button>
              )
            ) : null}
          </div>
          {msg ? <p className={msgClass}>{msg}</p> : null}
        </div>
      </div>
      <div className="grid-game__stage">
        <div className="garden">
          <div className="plot">1</div>
          <div className="plot">2</div>
          <div className="plot">3</div>
          <div className="plot">4</div>
          <div className="plot">5</div>
          <div className="water">🌱</div>
        </div>
      </div>
    </div>
  );
}
