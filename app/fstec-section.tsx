'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';

/*
 * Блок сертификации ФСТЭК России: факты сертификата, иллюстрация-«сертификат»
 * с четырьмя допусками, которые зажигаются при появлении блока в вьюпорте,
 * и отрасли применения. Факты — из сертификата № 5063 от 30.04.2026
 * (4-й уровень доверия; ГИС до 1 класса, ИСПДн до 1 уровня, значимые объекты
 * КИИ до 1 категории, АСУ ТП до 1 класса).
 */

const clearances = [
  {
    code: 'ГИС',
    level: 'до 1 класса',
    title: 'Государственные информационные системы',
  },
  {
    code: 'КИИ',
    level: 'до 1 категории',
    title: 'Значимые объекты критической инфраструктуры',
  },
  {
    code: 'ИСПДн',
    level: 'до 1 уровня',
    title: 'Информационные системы персональных данных',
  },
  {
    code: 'АСУ ТП',
    level: 'до 1 класса',
    title: 'Автоматизированные системы управления ТП',
  },
] as const;

const sectors = [
  { title: 'Производство', subtitle: 'АСУ ТП 1 класса', icon: 'factory' },
  { title: 'Инфраструктура', subtitle: 'КИИ 1 категории', icon: 'servers' },
  { title: 'Госорганы', subtitle: 'ГИС 1 класса', icon: 'government' },
  { title: 'Операторы ПДн', subtitle: 'ИСПДн 1 уровня', icon: 'personal-data' },
] as const;

function SectorIcon({ kind }: { kind: (typeof sectors)[number]['icon'] }) {
  return (
    <span className="figma-sector-card__icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none">
        {kind === 'factory' ? (
          <>
            <path d="M2.5 17.5V7.8l5 3.4V7.8l5 3.4V4.5h3v13" />
            <path d="M2.5 17.5h15M6 14.5h.01M10 14.5h.01M14 14.5h.01" />
          </>
        ) : kind === 'servers' ? (
          <>
            <rect x="2.5" y="3" width="15" height="5.5" rx="1.5" />
            <rect x="2.5" y="11.5" width="15" height="5.5" rx="1.5" />
            <path d="M5.5 5.75h.01M5.5 14.25h.01M8.5 5.75h6M8.5 14.25h6" />
          </>
        ) : kind === 'government' ? (
          <path d="m2.5 7 7.5-4 7.5 4M3.5 17h13M5 8.5V15M8.3 8.5V15M11.7 8.5V15M15 8.5V15" />
        ) : (
          <>
            <path d="M16 9.5c0 3.7-2.5 6.3-6 7.7-3.5-1.4-6-4-6-7.7V5.2c2.1-.2 4.2-1.1 6-2.4 1.8 1.3 3.9 2.2 6 2.4v4.3Z" />
            <circle cx="10" cy="8" r="1.7" />
            <path d="M7.4 12.7c.7-1.3 1.5-2 2.6-2s1.9.7 2.6 2" />
          </>
        )}
      </svg>
    </span>
  );
}

export default function FstecSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="figma-fstec" id="certification" aria-labelledby="fstec-title" ref={sectionRef}>
      <div className="figma-shell">
        <div className="figma-fstec__head">
          <div className="figma-fstec__copy">
            <span className="figma-eyebrow">Сертификат ФСТЭК России № 5063 · 30 апреля 2026</span>
            <h2 id="fstec-title">
              Пассворк сертифицирован
              <br />
              ФСТЭК России
            </h2>
            <p>
              Сертификат по 4-му уровню доверия — наивысшему для коммерческих средств защиты информации.
              Пассворк стал первым менеджером паролей в России с такой сертификацией: его можно включать в
              состав аттестованных систем без дополнительного обоснования перед регулятором.
            </p>
            <div className="figma-fstec__actions">
              <a className="figma-button figma-button--primary" href="#certification">
                Попробовать бесплатно
              </a>
            </div>
          </div>

          <div className="figma-fstec__art" aria-hidden="true">
            <div className="figma-cert">
              <div className="figma-cert__head">
                <span className="figma-cert__seal">
                  <svg viewBox="0 0 40 40">
                    <circle className="figma-cert__ring" cx="20" cy="20" r="17" pathLength={1} />
                    <path d="M20 9.5 27.5 12.6v5.2c0 4.6-3.2 7.9-7.5 9.6-4.3-1.7-7.5-5-7.5-9.6v-5.2z" />
                    <path className="figma-cert__tick" d="m16.4 18.6 2.4 2.4 4.9-5.2" pathLength={1} />
                  </svg>
                </span>
                <span className="figma-cert__org">
                  <b>ФСТЭК России</b>
                  <span>Сертификат соответствия</span>
                </span>
                <span className="figma-cert__num">№ 5063</span>
              </div>
              <div className="figma-cert__level">
                <b>4</b>
                <span>
                  уровень
                  <br />
                  доверия
                </span>
              </div>
              <ul className="figma-cert__list">
                {clearances.map((item, index) => (
                  <li key={item.code} style={{ '--i': index } as CSSProperties} title={item.title}>
                    <i />
                    <b>{item.code}</b>
                    <span>{item.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="figma-fstec__sectors">
          <span className="figma-eyebrow">Где можно применять</span>
          <div className="figma-sectors" aria-label="Области применения">
            {sectors.map((sector) => (
              <article className="figma-sector-card" key={sector.title}>
                <SectorIcon kind={sector.icon} />
                <div>
                  <h3>{sector.title}</h3>
                  <p>{sector.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
