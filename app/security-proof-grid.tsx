'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

const securityProofs = [
  {
    title: 'ФСТЭК России, 4 уровень доверия',
    description:
      'Соответствует требованиям госсектора и критической инфраструктуры',
    kind: 'fstec',
  },
  {
    title: 'ГОСТ-шифрование',
    description:
      'Подтверждает соответствие требованиям безопасности госсектора и критической инфраструктуры',
    kind: 'gost',
  },
  {
    title: 'Размещение внутри инфраструктуры',
    description:
      'Полное развёртывание на серверах заказчика без зависимости от облачных провайдеров',
    kind: 'infrastructure',
  },
  {
    title: 'Отсутствие передачи данных',
    description:
      'Без телеметрии, внешних API и зависимости от зарубежных сервисов',
    kind: 'data',
  },
] as const;

const cipherCodes = [
  'Yb9WrnC5nFrvvz',
  '4A6CF291073B88',
  'D2E83B71A9C416',
  'GOST34122015',
] as const;

const magicGlyphRows = [
  '4A6CF291073B88D15E0A74C916EF3D27',
  '9D31A86042C7F50BE31967AA2E8C7014',
  'B7E0541C936F2AD80571CC3EA4896DF2',
  '0FA2794DE618B35C9027FD618A34C7E9',
  '53D8A1F6B2940CE77A163D8BF01942C5',
  'C74E1960AD3F825B41E69C087D2FA536',
  '18B6F03A4D97CE251F68A2DB930C547E',
  'A3F81D9C620E475BB27D106AF39C58E4',
] as const;

const sessionRows = [
  ['Сервер', 'Passwork Server'],
  ['Контур', 'Локальная сеть'],
  ['Размещение', 'On-premise'],
] as const;

const blockedRows = [
  ['telemetry.passwork', 'Заблокировано · 0 запросов'],
  ['external.api', 'Заблокировано · 0 запросов'],
  ['cloud.service', 'Заблокировано · 0 запросов'],
] as const;

function MfaArtwork() {
  return (
    <div className="clerk-art clerk-art--mfa" aria-hidden="true">
      <div className="clerk-mfa">
        {Array.from({ length: 6 }, (_, index) => (
          <span
            className="clerk-mfa__cell"
            key={index}
            style={
              { '--clerk-delay': `${index * 120}ms` } as CSSProperties
            }
          >
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

function MagicLinksArtwork() {
  return (
    <div className="clerk-art clerk-art--magic" aria-hidden="true">
      <div className="clerk-magic">
        <div className="clerk-magic__glyphs">
          {magicGlyphRows.map((row, index) => (
            <span
              key={row}
              style={
                {
                  '--clerk-delay': `${index * -180}ms`,
                  '--clerk-direction': index % 2 ? '-1' : '1',
                } as CSSProperties
              }
            >
              {row}
            </span>
          ))}
        </div>
        <span className="clerk-magic__shade" />

        <div className="clerk-magic__token">
          {cipherCodes.map((code, index) => (
            <span
              key={code}
              style={
                { '--clerk-delay': `${index * -600}ms` } as CSSProperties
              }
            >
              {code}
            </span>
          ))}
        </div>

        <span className="clerk-magic__dome" />
        <div className="clerk-magic__identity">
          <div className="clerk-magic__portrait">
            <svg
              viewBox="0 0 80 96"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path
                className="clerk-magic__portrait-shadow"
                d="M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776"
              />
              <path
                className="clerk-magic__portrait-shadow"
                d="M27.705 60.474a26.884 26.884 0 0 0 1.577 2.682c1.786 2.642 5.36 6.792 10.718 6.792h.005c5.358 0 8.932-4.15 10.718-6.792a26.884 26.884 0 0 0 1.577-2.682"
              />
              <path
                className="clerk-magic__portrait-draw"
                pathLength="1"
                d="M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776"
              />
              <path
                className="clerk-magic__portrait-draw clerk-magic__portrait-draw--inner"
                pathLength="1"
                d="M27.705 60.474a26.884 26.884 0 0 0 1.577 2.682c1.786 2.642 5.36 6.792 10.718 6.792h.005c5.358 0 8.932-4.15 10.718-6.792a26.884 26.884 0 0 0 1.577-2.682"
              />
            </svg>
            <span className="clerk-magic__scan" />
          </div>
          <strong>ГОСТ 34.12</strong>
          <small>локальный ключ</small>
        </div>
      </div>
    </div>
  );
}

function SessionArtwork() {
  return (
    <div className="clerk-art clerk-art--session" aria-hidden="true">
      <div className="clerk-session">
        <span className="clerk-session__wing clerk-session__wing--left" />
        <span className="clerk-session__wing clerk-session__wing--right" />
        <span className="clerk-session__trace" />

        <div className="clerk-session__panel">
          <div className="clerk-laptop">
            <span className="clerk-laptop__screen">
              <i className="clerk-laptop__shine" />
              <b>PW</b>
            </span>
            <span className="clerk-laptop__base" />
          </div>

          <div className="clerk-session__rows">
            {sessionRows.map(([label, value], index) => (
              <span
                key={label}
                style={
                  { '--clerk-delay': `${index * 50}ms` } as CSSProperties
                }
              >
                <small>{label}</small>
                <b>{value}</b>
              </span>
            ))}
          </div>

          <div className="clerk-session__button">Внутри инфраструктуры</div>
        </div>
      </div>
    </div>
  );
}

function FraudArtwork() {
  return (
    <div className="clerk-art clerk-art--fraud" aria-hidden="true">
      <div className="clerk-fraud">
        <div className="clerk-fraud__status">
          <span className="clerk-fraud__spinner" />
          <strong>Исходящие соединения заблокированы</strong>
          <time>0</time>
        </div>

        <div className="clerk-fraud__feed">
          <svg
            className="clerk-fraud__route"
            viewBox="0 0 39 150"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M2 0v20.5c0 2.1.84 4.16 2.34 5.66l30.32 30.32A8 8 0 0 1 37 62.14V150" />
          </svg>

          {blockedRows.map(([name, detail], index) => (
            <div
              className="clerk-fraud__event"
              key={name}
              style={
                { '--clerk-delay': `${index * 180}ms` } as CSSProperties
              }
            >
              <span className="clerk-fraud__node">
                <i />
                <b>×</b>
              </span>
              <span className="clerk-fraud__event-copy">
                <strong>{name}</strong>
                <small>{detail}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityProofVisual({
  kind,
}: {
  kind: (typeof securityProofs)[number]['kind'];
}) {
  if (kind === 'fstec') return <MfaArtwork />;
  if (kind === 'gost') return <MagicLinksArtwork />;
  if (kind === 'infrastructure') return <SessionArtwork />;
  return <FraudArtwork />;
}

export default function SecurityProofGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>('.figma-security-card'),
    );
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const visibility = new Map<HTMLElement, number>();
    let activeCard: HTMLElement | null = null;
    let focusFrame = 0;

    const setActiveCard = (nextCard: HTMLElement | null) => {
      activeCard = nextCard;
      cards.forEach((card) =>
        card.classList.toggle('is-active', card === nextCard),
      );
    };

    const activateBestVisibleCard = () => {
      if (document.hidden) {
        setActiveCard(null);
        return;
      }

      let nextCard: HTMLElement | null = null;
      let nextRatio = 0;

      visibility.forEach((ratio, card) => {
        if (ratio > nextRatio) {
          nextCard = card;
          nextRatio = ratio;
        }
      });

      if (nextRatio >= 0.55) setActiveCard(nextCard);
      else if (!activeCard || (visibility.get(activeCard) ?? 0) < 0.3) {
        setActiveCard(null);
      }
    };

    const cleanups = cards.map((card) => {
      const handlePointerEnter = () => {
        if (finePointer.matches && !document.hidden) setActiveCard(card);
      };
      const handlePointerLeave = () => {
        if (finePointer.matches && !card.contains(document.activeElement)) {
          setActiveCard(null);
        }
      };
      const handleFocusIn = () => setActiveCard(card);
      const handleFocusOut = () => {
        if (focusFrame) window.cancelAnimationFrame(focusFrame);
        focusFrame = window.requestAnimationFrame(() => {
          focusFrame = 0;
          if (!card.contains(document.activeElement) && !card.matches(':hover')) {
            setActiveCard(null);
          }
        });
      };
      const handlePointerDown = () => {
        if (!finePointer.matches) setActiveCard(card);
      };

      card.addEventListener('pointerenter', handlePointerEnter);
      card.addEventListener('pointerleave', handlePointerLeave);
      card.addEventListener('focusin', handleFocusIn);
      card.addEventListener('focusout', handleFocusOut);
      card.addEventListener('pointerdown', handlePointerDown);

      return () => {
        card.removeEventListener('pointerenter', handlePointerEnter);
        card.removeEventListener('pointerleave', handlePointerLeave);
        card.removeEventListener('focusin', handleFocusIn);
        card.removeEventListener('focusout', handleFocusOut);
        card.removeEventListener('pointerdown', handlePointerDown);
      };
    });

    const handleVisibilityChange = () => {
      if (document.hidden) setActiveCard(null);
      else if (!finePointer.matches) activateBestVisibleCard();
    };
    const handlePointerModeChange = () => {
      setActiveCard(null);
      if (!finePointer.matches) activateBestVisibleCard();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    finePointer.addEventListener('change', handlePointerModeChange);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target as HTMLElement, entry.intersectionRatio);
        });
        if (!finePointer.matches) activateBestVisibleCard();
      },
      { threshold: [0, 0.3, 0.55, 0.7, 1] },
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      if (focusFrame) window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      finePointer.removeEventListener('change', handlePointerModeChange);
    };
  }, []);

  return (
    <div className="figma-security-grid" ref={gridRef} role="list">
      {securityProofs.map((proof) => (
        <article
          aria-label={`${proof.title}. Интерактивная демонстрация`}
          className={`figma-security-card is-${proof.kind}`}
          key={proof.title}
          role="listitem"
          tabIndex={0}
        >
          <SecurityProofVisual kind={proof.kind} />
          <div className="figma-security-card__copy">
            <h3>{proof.title}</h3>
            <p>{proof.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
