"use client";

import { useEffect, useState } from "react";

const R = 42;
const C = 2 * Math.PI * R;

export function StatRing({
  label,
  value,
  percent,
  icon,
  accent = "var(--accent, #e8622a)"
}: {
  label: string;
  value: string | number;
  percent: number;
  icon?: React.ReactNode;
  accent?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = C - (mounted ? clamped / 100 : 0) * C;

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [clamped]);

  return (
    <div className="dash-ring">
      <div className="dash-ring__chart">
        <svg aria-hidden viewBox="0 0 96 96">
          <circle className="dash-ring__track" cx="48" cy="48" r={R} />
          <circle
            className="dash-ring__fill"
            cx="48"
            cy="48"
            r={R}
            stroke={accent}
            strokeDasharray={C}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="dash-ring__center">
          {icon ? <span className="dash-ring__icon">{icon}</span> : null}
          <strong>{value}</strong>
        </div>
      </div>
      <span className="dash-ring__label">{label}</span>
      <span className="dash-ring__pct">{Math.round(clamped)}%</span>
    </div>
  );
}
