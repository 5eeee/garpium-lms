import Link from "next/link";

export function GarpiumLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={`garpium-logo${compact ? " garpium-logo--compact" : ""}`}
      href="https://garpium.com"
      rel="noreferrer"
      target="_blank"
    >
      <img alt="GARPIUM" className="garpium-logo__img" src="/garpium-logo.png" />
      {!compact ? <span className="garpium-logo__text">LMS</span> : null}
    </Link>
  );
}

export function PoweredByGarpium() {
  return (
    <footer className="powered-by-garpium">
      <span>Обучение предоставлено</span>
      <GarpiumLogo compact />
    </footer>
  );
}
