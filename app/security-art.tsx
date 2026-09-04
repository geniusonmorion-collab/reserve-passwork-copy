'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef } from 'react';

/*
 * Иллюстрации трёх карточек блока «Пассворк разработан в России…»:
 * ГОСТ-шифрование, размещение внутри инфраструктуры, отсутствие передачи
 * данных. Сцены нарисованы в фиксированных координатах и масштабируются
 * под ширину карточки (--sp-scale); анимация запускается на hover/focus
 * карточки — как у карточек фич на clerk.com.
 */

export type SecurityArtKind = 'gost' | 'infrastructure' | 'data';

const SCENES: Record<SecurityArtKind, { width: number; height: number; art: string; scene: string }> = {
  gost: { width: 494, height: 252, art: 'clerk-art--gost', scene: 'sp-gost' },
  infrastructure: { width: 742, height: 181, art: 'clerk-art--session', scene: 'sp-infra' },
  data: { width: 494, height: 212, art: 'clerk-art--fraud', scene: 'sp-data' },
};

const CARD_INSET = 54; // 27px отступ контента с каждой стороны карточки

/* Детерминированный ПСЧ: одинаковые «шифротексты» на сервере и клиенте. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const HEX = '0123456789ABCDEF';
const CIPHER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';

function cipherRow(random: () => number, length: number) {
  let out = '';
  for (let i = 0; i < length; i++) out += CIPHER_ALPHABET[Math.floor(random() * CIPHER_ALPHABET.length)];
  return out;
}

const gostRows = (() => {
  const random = seeded(0x34122015);
  return Array.from({ length: 10 }, () => cipherRow(random, 46));
})();

const PILL_PLAIN = 'user@passwork.ru';
const PILL_CIPHER = '8F2C71A04E9BD3C7';

const blockedEvents = [
  ['telemetry.vendor.io', 'Заблокировано · 14:09'],
  ['api.analytics.com', 'Заблокировано · 14:10'],
  ['cdn.cloud-sync.net', 'Заблокировано · 14:12'],
] as const;

/* Задержки мигания светодиодов — псевдослучайные, но стабильные. */
const ledDelays = (() => {
  const random = seeded(0x51ed);
  return Array.from({ length: 48 }, () => ({ delay: Math.round(random() * 1500), period: 1300 + Math.round(random() * 900) }));
})();

function GostScene() {
  return (
    <>
      <div className="sp-gost__rows">
        {gostRows.map((row, index) => (
          <span data-sp-row="" key={index} style={{ '--i': index } as CSSProperties}>
            {row}
          </span>
        ))}
      </div>
      <i className="sp-gost__dome" />
      <div className="sp-pill">
        <span className="sp-pill__text" data-sp-pill="">
          {PILL_PLAIN}
        </span>
        <i className="sp-pill__caret" />
      </div>
      <div className="sp-gost__card">
        <svg className="sp-lock" viewBox="0 0 56 64" aria-hidden="true">
          <g className="sp-lock__base">
            <path className="sp-lock__shackle" d="M16 28v-9a12 12 0 0 1 24 0v9" />
            <rect x="8" y="28" width="40" height="30" rx="6" />
            <path d="M28 38v10" />
          </g>
          <g className="sp-lock__glow">
            <path className="sp-lock__shackle" d="M16 28v-9a12 12 0 0 1 24 0v9" pathLength={1} />
            <rect x="8" y="28" width="40" height="30" rx="6" pathLength={1} />
            <path d="M28 38v10" pathLength={1} />
          </g>
        </svg>
      </div>
      <div className="sp-gost__title">
        <strong>ГОСТ Р 34.12-2015</strong>
        <i className="sp-badge">
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="m2.6 6.3 2.3 2.3 4.6-4.9" />
          </svg>
        </i>
      </div>
      <small className="sp-gost__sub">Кузнечик · 256-битный ключ</small>
    </>
  );
}

function InfrastructureScene() {
  return (
    <>
      <div className="sp-laptop">
        <i className="sp-laptop__glow" />
        <div className="sp-laptop__lid">
          <div className="sp-laptop__screen">
            <i className="sp-laptop__avatar" />
            <i className="sp-laptop__bar">
              <b />
            </i>
          </div>
        </div>
        <div className="sp-laptop__base">
          <i />
        </div>
      </div>

      <svg className="sp-infra__lines" viewBox="0 0 742 181" aria-hidden="true">
        <defs>
          <linearGradient id="sp-beam-in" gradientUnits="userSpaceOnUse" x1="176" y1="0" x2="284" y2="0">
            <stop offset="0" stopColor="#8b7cff" />
            <stop offset="1" stopColor="#4ec9ff" />
          </linearGradient>
          <linearGradient id="sp-beam-out" gradientUnits="userSpaceOnUse" x1="492" y1="0" x2="562" y2="0">
            <stop offset="0" stopColor="#8b7cff" />
            <stop offset="1" stopColor="#4ec9ff" />
          </linearGradient>
        </defs>
        <path className="sp-line" d="M176 92H284" />
        <path className="sp-line" d="M492 92h16c19 0 19-50 38-50h16" />
        <path className="sp-line" d="M492 92H562" />
        <path className="sp-line" d="M492 92h16c19 0 19 50 38 50h16" />
        <path className="sp-beam sp-beam--in" d="M176 92H284" pathLength={100} />
        <path className="sp-beam sp-beam--out" d="M492 92h16c19 0 19-50 38-50h16" pathLength={100} style={{ '--i': 0 } as CSSProperties} />
        <path className="sp-beam sp-beam--out" d="M492 92H562" pathLength={100} style={{ '--i': 1 } as CSSProperties} />
        <path className="sp-beam sp-beam--out" d="M492 92h16c19 0 19 50 38 50h16" pathLength={100} style={{ '--i': 2 } as CSSProperties} />
      </svg>

      <div className="sp-status">
        <i className="sp-spinner" />
        <span className="sp-status__text">
          <b>Аутентификация...</b>
          <b>Доступ подтверждён</b>
        </span>
        <i className="sp-status__check">
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="m2.6 6.3 2.3 2.3 4.6-4.9" />
          </svg>
        </i>
      </div>

      <div className="sp-racks">
        {Array.from({ length: 3 }, (_, rack) => (
          <div className="sp-rack" key={rack} style={{ '--i': rack } as CSSProperties}>
            <i className="sp-rack__port" />
            <span className="sp-rack__signal">
              <i />
              <i />
              <i />
            </span>
            <i className="sp-rack__vents" />
            <span className="sp-rack__leds">
              {Array.from({ length: 16 }, (_, led) => {
                const { delay, period } = ledDelays[rack * 16 + led];
                return <i key={led} style={{ '--d': `${delay}ms`, '--p': `${period}ms` } as CSSProperties} />;
              })}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function DataScene() {
  return (
    <>
      <div className="sp-bar">
        <i className="sp-spinner" />
        <span className="sp-bar__text">Исходящие соединения заблокированы</span>
        <span className="sp-bar__count">
          <span>
            <b>0</b>
            <b>1</b>
            <b>2</b>
            <b>3</b>
          </span>
        </span>
      </div>
      <svg className="sp-data__route" viewBox="0 0 494 212" aria-hidden="true">
        <defs>
          <linearGradient id="sp-beam-warn" gradientUnits="userSpaceOnUse" x1="0" y1="44" x2="0" y2="212">
            <stop offset="0" stopColor="#ff9a3c" />
            <stop offset="1" stopColor="#ff4d4d" />
          </linearGradient>
        </defs>
        <path className="sp-line" d="M24 44v14q0 8 6 14l28 28q6 6 6 14v98" />
        <path className="sp-beam sp-beam--warn" d="M24 44v14q0 8 6 14l28 28q6 6 6 14v98" pathLength={100} />
      </svg>
      {blockedEvents.map(([host, meta], index) => (
        <div className="sp-event" key={host} style={{ '--i': index } as CSSProperties}>
          <i className="sp-node">
            <b />
          </i>
          <span className="sp-event__copy">
            <strong>{host}</strong>
            <small>{meta}</small>
          </span>
        </div>
      ))}
    </>
  );
}

export default function SecurityArt({ kind }: { kind: SecurityArtKind }) {
  const artRef = useRef<HTMLDivElement>(null);
  const spec = SCENES[kind];

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    const { width, height } = SCENES[kind];

    const fit = () => {
      const scale = Math.min(1, (art.clientWidth - CARD_INSET) / width, art.clientHeight / height);
      art.style.setProperty('--sp-scale', String(Math.max(0.2, scale)));
    };
    fit();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (observer) observer.observe(art);
    else window.addEventListener('resize', fit);

    /* ГОСТ: «шифрование» текста в пилюле и живой шифротекст на фоне — только на hover. */
    let cleanupHover = () => {};
    const card = art.closest<HTMLElement>('.figma-security-card');
    const pill = art.querySelector<HTMLElement>('[data-sp-pill]');
    const rows = Array.from(art.querySelectorAll<HTMLElement>('[data-sp-row]'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (kind === 'gost' && card && pill && !reduced) {
      let frame = 0;
      let started = 0;
      let lastFlicker = 0;
      const random = seeded(Date.now() & 0xffff);
      const rowText = rows.map((row) => row.textContent ?? '');

      const scramblePill = (now: number) => {
        const p = Math.min(1, (now - started) / 1400);
        const edge = Math.floor(p * PILL_PLAIN.length);
        let text = '';
        for (let i = 0; i < PILL_PLAIN.length; i++) {
          if (i < edge) text += PILL_CIPHER[i];
          else if (i < edge + 3 && p < 1) text += HEX[Math.floor(random() * 16)];
          else text += PILL_PLAIN[i];
        }
        pill.textContent = text;
        return p;
      };
      const flickerRows = () => {
        rows.forEach((row, index) => {
          if (random() > 0.35) return;
          const chars = rowText[index].split('');
          for (let k = 0; k < 2; k++) {
            const at = Math.floor(random() * chars.length);
            chars[at] = CIPHER_ALPHABET[Math.floor(random() * CIPHER_ALPHABET.length)];
          }
          rowText[index] = chars.join('');
          row.textContent = rowText[index];
        });
      };
      const tick = (now: number) => {
        const p = scramblePill(now);
        if (p >= 1) pill.classList.add('is-done');
        if (now - lastFlicker > 110) {
          flickerRows();
          lastFlicker = now;
        }
        frame = requestAnimationFrame(tick);
      };
      const start = () => {
        cancelAnimationFrame(frame);
        started = performance.now();
        pill.classList.remove('is-done');
        frame = requestAnimationFrame(tick);
      };
      const stop = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        pill.textContent = PILL_PLAIN;
        pill.classList.remove('is-done');
      };
      card.addEventListener('pointerenter', start);
      card.addEventListener('pointerleave', stop);
      card.addEventListener('focus', start);
      card.addEventListener('blur', stop);
      cleanupHover = () => {
        stop();
        card.removeEventListener('pointerenter', start);
        card.removeEventListener('pointerleave', stop);
        card.removeEventListener('focus', start);
        card.removeEventListener('blur', stop);
      };
    }

    return () => {
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', fit);
      cleanupHover();
    };
  }, [kind]);

  return (
    <div className={`clerk-art ${spec.art}`} aria-hidden="true" ref={artRef}>
      <div className={`sp-scene ${spec.scene}`} style={{ width: spec.width, height: spec.height }}>
        {kind === 'gost' ? <GostScene /> : kind === 'infrastructure' ? <InfrastructureScene /> : <DataScene />}
      </div>
    </div>
  );
}
