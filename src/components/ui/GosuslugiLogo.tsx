type Props = { size?: number; className?: string };

/** Inline SVG — не зависит от /public, работает после деплоя */
export function GosuslugiLogo({ size = 24, className = "" }: Props) {
  return (
    <svg
      aria-hidden
      className={`gosuslugi-logo ${className}`.trim()}
      height={size}
      viewBox="0 0 48 48"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#fff" height="48" rx="10" width="48" />
      <path
        d="M24 8c-4.2 0-7.6 3.4-7.6 7.6 0 3.1 1.9 5.8 4.6 7 2.7-1.2 4.6-3.9 4.6-7C25.6 11.4 22.2 8 24 8z"
        fill="#EF3E58"
      />
      <path
        d="M12.8 28.4c-1.8 2.4-1.4 5.8 1 7.6 2.4 1.8 5.8 1.4 7.6-1 1.2-1.6 1.4-3.6.8-5.4-2.4.4-4.9-.2-6.9-1.8-1.2 1.2-2 2.4-2.5 3.6z"
        fill="#0066B3"
      />
      <path
        d="M35.2 28.4c-.5-1.2-1.3-2.4-2.5-3.6-2 1.6-4.5 2.2-6.9 1.8-.6 1.8-.4 3.8.8 5.4 1.8 2.4 5.2 2.8 7.6 1 2.4-1.8 2.8-5.2 1-7.6z"
        fill="#0066B3"
      />
      <path
        d="M24 22.8c-3.8 0-7.2 1.8-9.4 4.6 1.8 3.2 5.2 5.2 9.4 5.2s7.6-2 9.4-5.2c-2.2-2.8-5.6-4.6-9.4-4.6z"
        fill="#0066B3"
      />
    </svg>
  );
}
