"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const levels = [
  {
    title: "Уровень 1",
    text: "Лягушата прыгнули на левый край. Используй justify-content, чтобы отправить их направо.",
    starter: ".pond {\n  display: flex;\n\n}",
    check: (s: string) => /justify-content\s*:\s*flex-end/.test(s),
    hint: "justify-content: flex-end;"
  },
  {
    title: "Уровень 2",
    text: "Теперь лягушата должны оказаться по центру пруда.",
    starter: ".pond {\n  display: flex;\n\n}",
    check: (s: string) => /justify-content\s*:\s*center/.test(s),
    hint: "justify-content: center;"
  },
  {
    title: "Уровень 3",
    text: "Равномерно распредели лягушат с пространством вокруг каждой.",
    starter: ".pond {\n  display: flex;\n\n}",
    check: (s: string) => /justify-content\s*:\s*space-around/.test(s),
    hint: "justify-content: space-around;"
  },
  {
    title: "Уровень 4",
    text: "Лягушата прилипли к верху. Опусти их вниз через align-items.",
    starter: ".pond {\n  display: flex;\n\n}",
    check: (s: string) => /align-items\s*:\s*flex-end/.test(s),
    hint: "align-items: flex-end;"
  },
  {
    title: "Уровень 5",
    text: "Выровняй лягушат по вертикали по центру.",
    starter: ".pond {\n  display: flex;\n\n}",
    check: (s: string) => /align-items\s*:\s*center/.test(s),
    hint: "align-items: center;"
  },
  {
    title: "Уровень 6",
    text: "Лягушата должны прыгать сверху вниз - поменяй направление оси.",
    starter: ".pond {\n  display: flex;\n\n}",
    check: (s: string) => /flex-direction\s*:\s*column/.test(s),
    hint: "flex-direction: column;"
  },
  {
    title: "Уровень 7",
    text: "Колонка + центр по горизонтали. Два свойства!",
    starter: ".pond {\n  display: flex;\n\n}",
    check: (s: string) => /flex-direction\s*:\s*column/.test(s) && /align-items\s*:\s*center/.test(s),
    hint: "flex-direction: column; align-items: center;"
  },
  {
    title: "Уровень 8",
    text: "Растяни лягушат на всю ширину пруда.",
    starter: ".pond {\n  display: flex;\n\n}",
    check: (s: string) => /justify-content\s*:\s*space-between/.test(s),
    hint: "justify-content: space-between;"
  }
];

export function FlexGame() {
  const [level, setLevel] = useState(0);
  const [code, setCode] = useState(levels[0].starter);
  const [msg, setMsg] = useState("");
  const [msgClass, setMsgClass] = useState("flex-game__msg");
  const [win, setWin] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const lv = levels[level];
  const progress = ((level + 1) / levels.length) * 100;
  const liveCss = useMemo(() => code, [code]);

  function checkLevel() {
    if (lv.check(code)) {
      setMsg("Отлично! Лягушата на месте.");
      setMsgClass("flex-game__msg is-success");
      setWin(true);
      setShowNext(true);
    } else {
      setMsg("Пока не то. Нажми «Подсказку» или перечитай задачу.");
      setMsgClass("flex-game__msg is-error");
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
    setMsgClass("flex-game__msg");
    setWin(false);
    setShowNext(false);
  }

  return (
    <div className={`flex-game span-12${win ? " is-win" : ""}`}>
      <style>{liveCss}</style>
      <div className="flex-game__sidebar">
        <div>
          <p className="flex-game__brand">Flex Лягушата</p>
          <p className="flex-game__level-title">
            {lv.title} / {levels.length}
          </p>
          <p className="flex-game__level-text">{lv.text}</p>
        </div>
        <textarea
          className="flex-game__editor"
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          value={code}
        />
        <div>
          <div className="flex-game__progress-wrap">
            <div className="flex-game__progress" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex-game__bar">
            <button className="flex-game__run" onClick={checkLevel} type="button">
              Проверить
            </button>
            <button
              className="flex-game__hint"
              onClick={() => {
                setMsg(`Подсказка: ${lv.hint}`);
                setMsgClass("flex-game__msg is-hint");
              }}
              type="button"
            >
              Подсказка
            </button>
            {showNext ? (
              level === levels.length - 1 ? (
                <Link className="flex-game__next" href="/games/grid">
                  Grid →
                </Link>
              ) : (
                <button className="flex-game__next" onClick={nextLevel} type="button">
                  Дальше →
                </button>
              )
            ) : null}
          </div>
          {msg ? <p className={msgClass}>{msg}</p> : null}
        </div>
      </div>
      <div className="flex-game__stage">
        <div className={`flex-game__pond pond${win ? " is-win" : ""}`}>
          <div className="flex-game__frog" />
          <div className="flex-game__frog" />
          <div className="flex-game__frog" />
        </div>
      </div>
    </div>
  );
}
