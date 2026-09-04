'use client';

import { useEffect, useRef } from 'react';
import { initScrambleLinks } from './scramble-links';

type NavigationItem = {
  readonly label: string;
  readonly href: string;
};

export default function HeaderNav({
  items,
}: {
  items: readonly NavigationItem[];
}) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let resizeFrame = 0;
    let deferredMeasure = 0;
    let disposed = false;

    const measureCharacters = () => {
      if (nav.querySelector('[data-scrambling]')) {
        window.clearTimeout(deferredMeasure);
        deferredMeasure = window.setTimeout(measureCharacters, 320);
        return;
      }

      const characters = Array.from(
        nav.querySelectorAll<HTMLElement>('[data-signal-char]'),
      );
      characters.forEach((character) => character.style.removeProperty('width'));
      const widths = characters.map(
        (character) => character.getBoundingClientRect().width,
      );
      characters.forEach((character, index) => {
        character.style.width = `${widths[index] ?? 0}px`;
      });
    };

    const queueMeasure = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(measureCharacters);
    };

    measureCharacters();
    document.fonts.ready.then(() => {
      if (!disposed) measureCharacters();
    });
    window.addEventListener('resize', queueMeasure);
    const cleanupScramble = initScrambleLinks(nav);

    return () => {
      disposed = true;
      cleanupScramble();
      window.removeEventListener('resize', queueMeasure);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      if (deferredMeasure) window.clearTimeout(deferredMeasure);
    };
  }, []);

  return (
    <nav className="site-nav" aria-label="Главная навигация" ref={navRef}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          aria-label={item.label}
          data-signal-scramble
        >
          <span className="site-nav__label" aria-hidden="true">
            {Array.from(item.label).map((character, characterIndex) => (
              <span
                className="site-nav__char"
                data-signal-char={character}
                key={`${item.label}-${characterIndex}`}
              >
                {character === ' ' ? '\u00a0' : character}
              </span>
            ))}
          </span>
          <span
            className="site-nav__icon site-nav__icon--plus"
            aria-hidden="true"
          >
            <span className="site-nav__icon-glyph" />
          </span>
        </a>
      ))}
    </nav>
  );
}
