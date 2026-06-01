export function TrafficDots() {
  return (
    <div className="traffic">
      <button className="traffic__dot traffic__dot--red" type="button" aria-label="Закрыть">
        <svg className="traffic__icon" viewBox="0 0 10 10">
          <path d="M2 2 8 8M8 2 2 8" />
        </svg>
      </button>
      <button className="traffic__dot traffic__dot--yellow" type="button" aria-label="Свернуть">
        <svg className="traffic__icon" viewBox="0 0 10 10">
          <path d="M2 5h6" />
        </svg>
      </button>
      <button className="traffic__dot traffic__dot--green" type="button" aria-label="Развернуть">
        <svg className="traffic__icon" viewBox="0 0 10 10">
          <path d="M5 2v6M2 5h6" />
        </svg>
      </button>
    </div>
  );
}
