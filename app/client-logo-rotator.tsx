/* eslint-disable @next/next/no-img-element */

'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

const logoColumns = [
  [
    {
      name: 'ВкусВилл',
      src: '/assets/client-logos/vkusvill.png',
      className: 'is-vkusvill',
    },
    {
      name: 'Открытая мобильная платформа',
      src: '/assets/client-logos/open-mobile-platform.svg',
      className: 'is-open-mobile-platform',
    },
  ],
  [
    {
      name: 'ПИК',
      src: '/assets/figma-9206/logo-pik.svg',
      className: 'is-pik',
    },
    {
      name: 'Группа Черкизово',
      src: '/assets/client-logos/cherkizovo.svg',
      className: 'is-cherkizovo',
    },
  ],
  [
    {
      name: 'ВТБ',
      src: '/assets/figma-9206/logo-vtb.svg',
      className: 'is-vtb',
    },
    {
      name: 'ДИТ Москвы',
      src: '/assets/client-logos/dit-moscow.svg',
      className: 'is-dit-moscow',
    },
  ],
  [
    {
      name: 'Иви',
      src: '/assets/figma-9206/logo-ivi.svg',
      className: 'is-ivi',
    },
    {
      name: 'HeadHunter',
      src: '/assets/client-logos/hh.png',
      className: 'is-hh',
    },
  ],
  [
    {
      name: 'Okko',
      src: '/assets/client-logos/okko.png',
      className: 'is-okko',
    },
    {
      name: 'СберЗдоровье',
      src: '/assets/client-logos/sber-health.png',
      className: 'is-sber-health',
    },
  ],
] as const;

export default function ClientLogoRotator() {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;

    if (!row) return;

    let isVisible = false;

    const syncAnimation = () => {
      row.classList.toggle('is-animating', isVisible && !document.hidden);
    };

    if (!('IntersectionObserver' in window)) {
      isVisible = true;
      syncAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        syncAnimation();
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    observer.observe(row);
    document.addEventListener('visibilitychange', syncAnimation);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncAnimation);
    };
  }, []);

  return (
    <section className="figma-client-logos" aria-label="Клиенты Пассворка">
      <div
        ref={rowRef}
        className="figma-shell figma-client-logos__row"
        role="list"
      >
        {logoColumns.map((column, columnIndex) => (
          <div
            className="figma-client-logo"
            key={column[0].name}
            role="listitem"
            aria-label={column.map((logo) => logo.name).join(', ')}
            style={
              {
                '--logo-delay': `${columnIndex * 100}ms`,
              } as CSSProperties
            }
          >
            <div className="figma-client-logo__track" aria-hidden="true">
              {[...column, column[0]].map((logo, trackIndex) => (
                <span
                  className={`figma-client-logo__frame ${logo.className}`}
                  key={`${logo.name}-${trackIndex}`}
                >
                  <img src={logo.src} alt="" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
