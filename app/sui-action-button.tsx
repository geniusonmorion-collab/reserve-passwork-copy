type SuiActionButtonProps = {
  className: string;
  href: string;
  id?: string;
  label: string;
};

export default function SuiActionButton({
  className,
  href,
  id,
  label,
}: SuiActionButtonProps) {
  return (
    <a
      aria-label={label}
      className={`sui-action-button ${className}`}
      href={href}
      id={id}
    >
      <span className="sui-action-button__label" aria-hidden="true">
        {Array.from(label).map((character, index) => (
          <span
            className="sui-action-button__char"
            style={{ transitionDelay: `${index * 10}ms` }}
            key={`${character}-${index}`}
          >
            {character === ' ' ? '\u00a0' : character}
          </span>
        ))}
      </span>
    </a>
  );
}
