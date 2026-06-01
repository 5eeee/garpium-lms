"use client";

import { useMemo, useState } from "react";
import glossaryData from "@/lib/glossary.json";

type Tab = "html" | "css";

export function GlossaryView() {
  const [tab, setTab] = useState<Tab>("html");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const list = glossaryData[tab] as { t: string; d: string }[];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => item.t.toLowerCase().includes(q) || item.d.toLowerCase().includes(q));
  }, [tab, query]);

  return (
    <>
      <div className="map-tabs">
        <button
          className={`map-tabs__btn${tab === "html" ? " is-active" : ""}`}
          onClick={() => setTab("html")}
          type="button"
        >
          HTML ({glossaryData.html.length})
        </button>
        <button
          className={`map-tabs__btn${tab === "css" ? " is-active" : ""}`}
          onClick={() => setTab("css")}
          type="button"
        >
          CSS ({glossaryData.css.length})
        </button>
      </div>

      <label className="glossary-search">
        <span>Поиск</span>
        <input
          maxLength={60}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Например: flex, form, aria"
          type="search"
          value={query}
        />
      </label>

      <div className="glossary-grid">
        {items.length ? (
          items.map((item) => (
            <dl className="glossary-item" key={item.t}>
              <dt>{item.t}</dt>
              <dd>{item.d}</dd>
            </dl>
          ))
        ) : (
          <p className="lesson-text">Ничего не найдено.</p>
        )}
      </div>
    </>
  );
}
