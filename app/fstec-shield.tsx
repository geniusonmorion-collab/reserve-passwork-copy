'use client';

import { useEffect, useRef } from 'react';
import { EMBLEM, FIELD, HERO_PATH, offsetAt } from './fstec-shield-geometry';
import './fstec-shield.css';

/*
 * Иллюстрация панели сертификации, Figma 45:6893: щит с полем концентрических
 * контуров и эмблема ФСТЭК на нём гербом.
 *
 * Вся композиция — один SVG в системе координат карточки 535 × 535, включая
 * свечение и эмблему, поэтому она масштабируется вместе с карточкой одним
 * целым. Пути поля уже посчитаны в этих координатах параллельным офсетом,
 * так что трансформы группам не нужны.
 *
 * Курсор «выбирает» контур: расстояние от него до подтверждённого контура
 * сравнивается со сдвигом каждого кольца, и близкие разгораются и подаются.
 */

/** Разброс отклика по сдвигу контура: за его пределами кольцо не реагирует. */
const SPREAD = 46;
/** Постоянная времени сглаживания: за неё проходится 63 % пути до цели. */
const TAU = 0.13;

/* Слои кометы: общая голова, разная длина следа. */
const cometLayers = [
  { name: 'tail', dash: 0.34 },
  { name: 'mid', dash: 0.18 },
  { name: 'glow', dash: 0.08 },
  { name: 'head', dash: 0.08 },
];

function attachShieldPointer(root: HTMLElement, card: HTMLElement) {
  const allowed = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  const rings = Array.from(root.querySelectorAll<SVGPathElement>('[data-offset]'));
  const offsets = rings.map((ring) => Number(ring.dataset.offset));

  let frame = 0;
  let visible = true;
  let previous = 0;
  let hoverTarget = 0;
  let hover = 0;
  let pickTarget = 0;
  let pick = 0;

  function write() {
    for (let i = 0; i < rings.length; i++) {
      const near = Math.max(0, 1 - Math.abs(offsets[i] - pick) / SPREAD);
      // Квадрат близости сужает отклик: далёкие кольца не подрагивают.
      rings[i].style.setProperty('--fs-near', (near * near * hover).toFixed(4));
    }
  }

  function animate(now: number) {
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now;
    const step = 1 - Math.exp(-delta / TAU);
    hover += (hoverTarget - hover) * step;
    pick += (pickTarget - pick) * step;
    write();
    if (hover < 0.001 && hoverTarget === 0) {
      stop();
      hover = 0;
      write();
      return;
    }
    frame = requestAnimationFrame(animate);
  }

  function start() {
    if (frame || !visible || document.hidden) return;
    previous = 0;
    frame = requestAnimationFrame(animate);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function move(event: PointerEvent) {
    const bounds = card.getBoundingClientRect();
    if (!bounds.width) return;
    // Курсор → координаты карточки 535, в которых посчитаны все контуры.
    const scale = 535 / bounds.width;
    pickTarget = offsetAt(
      (event.clientX - bounds.left) * scale,
      (event.clientY - bounds.top) * scale,
    );
    hoverTarget = 1;
    start();
  }

  function leave() {
    hoverTarget = 0;
    start();
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { hoverTarget = 0; stop(); hover = 0; write(); }
    else if (hoverTarget) start();
  }, { threshold: 0 });

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (hoverTarget) start();
  };

  function bind() {
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(card);
  }

  function unbind() {
    card.removeEventListener('pointermove', move);
    card.removeEventListener('pointerleave', leave);
    card.removeEventListener('pointercancel', leave);
    document.removeEventListener('visibilitychange', onVisibility);
    observer.disconnect();
    hoverTarget = 0;
    stop();
    hover = 0;
    write();
  }

  const sync = () => (allowed.matches ? bind() : unbind());
  allowed.addEventListener('change', sync);
  write();
  if (allowed.matches) bind();

  return () => {
    allowed.removeEventListener('change', sync);
    unbind();
  };
}

export default function FstecShield() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const card = root?.closest<HTMLElement>('.figma-security-card');
    if (root && card) return attachShieldPointer(root, card);
  }, []);

  return (
    <div ref={rootRef} className="fs-shield" aria-hidden="true">
      <svg className="fs-shield__art" viewBox="0 0 535 535" fill="none">
        <defs>
          <radialGradient id="fs-glow">
            <stop offset="0" stopColor="#8cbeff" stopOpacity=".2" />
            <stop offset=".55" stopColor="#73adff" stopOpacity=".06" />
            <stop offset="1" stopColor="#73adff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fs-hero-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6f0ff" stopOpacity=".72" />
            <stop offset="1" stopColor="#cce0ff" stopOpacity=".16" />
          </linearGradient>
          <linearGradient id="fs-hero-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a8c8ff" stopOpacity=".1" />
            <stop offset="1" stopColor="#80b0ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="267.5" cy="352" rx="300" ry="272" fill="url(#fs-glow)" />

        <g className="fs-shield__field">
          {FIELD.map((ring) => (
            <path
              key={ring.distance}
              className="fs-shield__ring"
              d={ring.d}
              data-offset={ring.distance}
              style={{ '--fs-o': ring.opacity.toFixed(3) } as React.CSSProperties}
            />
          ))}
        </g>

        <path
          className="fs-shield__hero"
          d={HERO_PATH}
          data-offset={0}
          fill="url(#fs-hero-fill)"
          stroke="url(#fs-hero-stroke)"
        />

        {cometLayers.map((layer) => (
          <path
            key={layer.name}
            className={`fs-shield__comet fs-shield__comet--${layer.name}`}
            d={HERO_PATH}
            pathLength="1"
            style={{ '--fs-dash': layer.dash } as React.CSSProperties}
          />
        ))}

        {/* Эмблема лежит на щите гербом. Декоративна: сам факт сертификации
            несёт заголовок карточки. */}
        <image
          className="fs-shield__emblem"
          href="/assets/figma-45-6893/fstec-emblem.webp"
          x={EMBLEM.x}
          y={EMBLEM.y}
          width={EMBLEM.width}
          height={EMBLEM.height}
        />
      </svg>
    </div>
  );
}
