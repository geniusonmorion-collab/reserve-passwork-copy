/* eslint-disable @next/next/no-img-element */

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

const trustCode = ['5', '0', '6', '3', '4', '✓'] as const;
const cipherCodes = [
  'K7A·91F·04C',
  'D2E·83B·71A',
  '9C4·16F·A83',
  'G34·12·2015',
] as const;

function TrustLevelVisual() {
  return (
    <div className="clerk-proof clerk-proof--trust" aria-hidden="true">
      <div className="proof-mfa">
        <span className="proof-mfa__eyebrow">ПРОВЕРКА СЕРТИФИКАТА</span>
        <div className="proof-mfa__cells">
          {trustCode.map((symbol, index) => (
            <span
              className="proof-mfa__cell"
              key={`${symbol}-${index}`}
              style={
                { '--proof-delay': `${index * 78}ms` } as CSSProperties
              }
            >
              <i />
              <b>{symbol}</b>
            </span>
          ))}
        </div>
        <div className="proof-mfa__status">
          <span className="proof-mfa__spinner" />
          <span>4 УРОВЕНЬ ДОВЕРИЯ ПОДТВЕРЖДЁН</span>
          <time>5063</time>
        </div>
        <span className="proof-mfa__rail" />
        <span className="proof-mfa__node proof-mfa__node--one" />
        <span className="proof-mfa__node proof-mfa__node--two" />
        <span className="proof-mfa__node proof-mfa__node--three" />
      </div>
    </div>
  );
}

function GostVisual() {
  return (
    <div className="clerk-proof clerk-proof--gost" aria-hidden="true">
      <div className="proof-magic">
        <div className="proof-magic__glyphs">
          <span>4A 6C F2 91 07 3B 88 D1 5E 0A 74 C9 16 EF</span>
          <span>9D 31 A8 60 42 C7 F5 0B E3 19 67 AA 2E 8C</span>
          <span>B7 E0 54 1C 93 6F 2A D8 05 71 CC 3E A4 89</span>
          <span>0F A2 79 4D E6 18 B3 5C 90 27 FD 61 8A 34</span>
        </div>

        <div className="proof-magic__token">
          {cipherCodes.map((code, index) => (
            <span
              key={code}
              style={
                { '--proof-delay': `${index * -600}ms` } as CSSProperties
              }
            >
              {code}
            </span>
          ))}
        </div>

        <div className="proof-magic__credential">
          <span className="proof-magic__halo" />
          <span className="proof-magic__icon">
            <img src="/assets/icon-security-a.svg" alt="" />
          </span>
          <strong>ГОСТ</strong>
          <small>Р 34.12–2015</small>
        </div>
      </div>
    </div>
  );
}

function InfrastructureVisual() {
  const rows = [
    ['Сервер', 'локальный'],
    ['Контур', 'закрытый'],
    ['Хранилище', 'внутри'],
  ] as const;

  return (
    <div className="clerk-proof clerk-proof--session" aria-hidden="true">
      <div className="proof-session">
        <span className="proof-session__branch proof-session__branch--left" />
        <span className="proof-session__branch proof-session__branch--right" />
        <span className="proof-session__signal" />

        <div className="proof-session__panel">
          <div className="proof-session__device">
            <span>
              <img src="/assets/icon-devops.svg" alt="" />
            </span>
            <strong>PASSWORK</strong>
          </div>
          <div className="proof-session__details">
            {rows.map(([label, value]) => (
              <span key={label}>
                <small>{label}</small>
                <b>{value}</b>
              </span>
            ))}
          </div>
          <div className="proof-session__footer">
            <i />
            <span>РАЗВЁРНУТО ON-PREMISE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataBoundaryVisual() {
  return (
    <div className="clerk-proof clerk-proof--airgap" aria-hidden="true">
      <div className="proof-airgap">
        <div className="proof-airgap__status">
          <span className="proof-airgap__spinner" />
          <strong>Исходящие запросы заблокированы</strong>
          <time>0</time>
        </div>
        <div className="proof-airgap__rail">
          {[0, 1, 2, 3].map((index) => (
            <span
              className="proof-airgap__node"
              key={index}
              style={
                {
                  '--proof-node-delay': `${260 + index * 170}ms`,
                  '--proof-node-top': `${index * 22 + 7}px`,
                } as CSSProperties
              }
            >
              <i>×</i>
            </span>
          ))}
        </div>
        <span className="proof-airgap__boundary">ВНЕШНИЕ API · НЕТ</span>
      </div>
    </div>
  );
}

function SecurityProofVisual({
  kind,
}: {
  kind: (typeof securityProofs)[number]['kind'];
}) {
  if (kind === 'fstec') return <TrustLevelVisual />;
  if (kind === 'gost') return <GostVisual />;
  if (kind === 'infrastructure') return <InfrastructureVisual />;
  return <DataBoundaryVisual />;
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
      cards.forEach((card) => card.classList.toggle('is-active', card === nextCard));
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
        if (
          finePointer.matches &&
          !card.contains(document.activeElement)
        ) {
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
