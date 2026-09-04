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

const cipherTokens = [
  ['П', '8F'],
  ['А', '04'],
  ['С', '71'],
  ['С', 'C2'],
  ['В', 'A9'],
  ['О', '3D'],
  ['Р', 'E8'],
  ['К', '16'],
] as const;

function FstecVisual() {
  return (
    <div className="security-proof-motion security-proof-motion--fstec" aria-hidden="true">
      <div className="fstec-radar">
        <span className="fstec-radar__ring fstec-radar__ring--outer" />
        <span className="fstec-radar__ring fstec-radar__ring--middle" />
        <span className="fstec-radar__ring fstec-radar__ring--inner" />
        <span className="fstec-radar__sweep" />
        <span className="fstec-radar__dot fstec-radar__dot--one" />
        <span className="fstec-radar__dot fstec-radar__dot--two" />
        <span className="fstec-radar__dot fstec-radar__dot--three" />

        <span className="fstec-badge">
          <img src="/assets/icon-security-a.svg" alt="" />
          <strong>4</strong>
          <small>УД</small>
        </span>
      </div>

      <div className="fstec-verification">
        <span className="fstec-verification__pulse" />
        <span>СЕРТИФИКАТ № 5063</span>
        <img src="/assets/check-circle-blue.svg" alt="" />
      </div>
    </div>
  );
}

function GostVisual() {
  return (
    <div className="security-proof-motion security-proof-motion--gost" aria-hidden="true">
      <div className="gost-console">
        <div className="gost-console__header">
          <span className="gost-console__key">
            <span />
          </span>
          <span>КУЗНЕЧИК · 256 БИТ</span>
          <i />
        </div>

        <div className="gost-cipher">
          {cipherTokens.map(([plain, encrypted], index) => (
            <span
              className="gost-token"
              key={`${plain}-${encrypted}`}
              style={
                {
                  '--token-delay': `${index * 70}ms`,
                } as CSSProperties
              }
            >
              <span className="gost-token__plain">{plain}</span>
              <span className="gost-token__encrypted">{encrypted}</span>
            </span>
          ))}
          <span className="gost-cipher__scanner" />
        </div>

        <div className="gost-console__footer">
          <span>БЛОК 128</span>
          <span className="gost-console__progress">
            <i />
          </span>
          <img src="/assets/check-circle-blue.svg" alt="" />
        </div>
      </div>
    </div>
  );
}

function InfrastructureVisual() {
  return (
    <div
      className="security-proof-motion security-proof-motion--infrastructure"
      aria-hidden="true"
    >
      <div className="infrastructure-zone">
        <div className="infrastructure-zone__header">
          <span>
            <i /> ЛОКАЛЬНЫЙ КОНТУР
          </span>
          <img src="/assets/check-circle-blue.svg" alt="" />
        </div>

        <svg
          className="infrastructure-network"
          viewBox="0 0 360 112"
          preserveAspectRatio="none"
        >
          <path d="M22 25H111L142 48" />
          <path d="M22 87H111L142 64" />
          <path d="M338 25H249L218 48" />
          <path d="M338 87H249L218 64" />
        </svg>

        <span className="infrastructure-node infrastructure-node--one" />
        <span className="infrastructure-node infrastructure-node--two" />
        <span className="infrastructure-node infrastructure-node--three" />
        <span className="infrastructure-node infrastructure-node--four" />

        <div className="infrastructure-rack">
          <div className="infrastructure-rack__title">
            <img src="/assets/icon-devops.svg" alt="" />
            <span>PASSWORK</span>
          </div>
          {[0, 1, 2].map((row) => (
            <span className="infrastructure-rack__row" key={row}>
              <i />
              <i />
              <b />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataVisual() {
  return (
    <div className="security-proof-motion security-proof-motion--data" aria-hidden="true">
      <div className="data-airgap">
        <div className="data-airgap__labels">
          <span>ЛОКАЛЬНЫЙ КОНТУР</span>
          <span>ВНЕШНИЙ API</span>
        </div>

        {[0, 1, 2].map((lane) => (
          <span className={`data-lane data-lane--${lane + 1}`} key={lane}>
            <i
              style={
                {
                  '--packet-delay': `${lane * 420}ms`,
                } as CSSProperties
              }
            />
          </span>
        ))}

        <span className="data-airgap__external-lines" />

        <span className="data-airgap__gate">
          <i />
        </span>

        <div className="data-airgap__status">
          <img src="/assets/check-circle-blue.svg" alt="" />
          <span>0 исходящих соединений</span>
        </div>
      </div>
    </div>
  );
}

function SecurityProofVisual({ kind }: { kind: (typeof securityProofs)[number]['kind'] }) {
  if (kind === 'fstec') return <FstecVisual />;
  if (kind === 'gost') return <GostVisual />;
  if (kind === 'infrastructure') return <InfrastructureVisual />;
  return <DataVisual />;
}

export default function SecurityProofGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) return;

    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>('.figma-security-card'),
    );
    const visibleCards = new Set<HTMLElement>();
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const syncAnimations = () => {
      cards.forEach((card) => {
        card.classList.toggle(
          'is-active',
          visibleCards.has(card) &&
            !document.hidden &&
            (!hoverQuery.matches || card.matches(':hover')),
        );
      });
    };

    cards.forEach((card) => {
      card.addEventListener('pointerenter', syncAnimations);
      card.addEventListener('pointerleave', syncAnimations);
    });

    document.addEventListener('visibilitychange', syncAnimations);
    hoverQuery.addEventListener('change', syncAnimations);

    if (!('IntersectionObserver' in window)) {
      cards.forEach((card) => visibleCards.add(card));
      syncAnimations();

      return () => {
        cards.forEach((card) => {
          card.removeEventListener('pointerenter', syncAnimations);
          card.removeEventListener('pointerleave', syncAnimations);
        });
        document.removeEventListener('visibilitychange', syncAnimations);
        hoverQuery.removeEventListener('change', syncAnimations);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;

          if (entry.isIntersecting) visibleCards.add(card);
          else visibleCards.delete(card);
        });

        syncAnimations();
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      cards.forEach((card) => {
        card.removeEventListener('pointerenter', syncAnimations);
        card.removeEventListener('pointerleave', syncAnimations);
      });
      document.removeEventListener('visibilitychange', syncAnimations);
      hoverQuery.removeEventListener('change', syncAnimations);
    };
  }, []);

  return (
    <div className="figma-security-grid" ref={gridRef} role="list">
      {securityProofs.map((proof) => (
        <article
          className={`figma-security-card is-${proof.kind}`}
          key={proof.title}
          role="listitem"
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
