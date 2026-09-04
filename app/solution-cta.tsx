const arrowPath =
  'M12.7432 4.11621V6.68066L7.20996 10.7549V8.89355L10.9619 6.12891L0.000976562 6.12988L0 4.62988L10.917 4.62891L7.20996 1.87012V0L12.7432 4.11621Z';

function SolutionArrow() {
  return (
    <span className="solution-card__arrow" aria-hidden="true">
      <svg viewBox="0 0 13 11">
        <path d={arrowPath} />
        <path d={arrowPath} />
      </svg>
    </span>
  );
}

export default function SolutionCta({ label }: { label: string }) {
  return (
    <span className="solution-card__cta">
      <span className="solution-card__cta-reveal" aria-hidden="true" />
      <SolutionArrow />
      <span className="solution-card__cta-label" aria-hidden="true">
        {[...label].map((character, index) => (
          <span
            className="solution-card__cta-char"
            style={{ transitionDelay: `${index * 10}ms` }}
            key={`${character}-${index}`}
          >
            {character === ' ' ? '\u00A0' : character}
          </span>
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
