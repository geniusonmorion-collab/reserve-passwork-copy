'use client';

import { useEffect, useRef } from 'react';
import {
  EMBLEM,
  FIELD,
  HERO_WIDTH,
  SHIELD_PATH,
  contourTransform,
  contourWidthAt,
} from './fstec-shield-geometry';
import './fstec-shield.css';

/*
 * Иллюстрация панели сертификации, Figma 54:199: поле концентрических контуров
 * щита, подтверждённый контур и эмблема ФСТЭК по его центру.
 *
 * Композиция — один SVG в системе координат карточки 535 × 535, поэтому
 * масштабируется вместе с ней одним целым.
 *
 * Единственное движение — отклик на курсор: по его положению считается, контур
 * какой ширины через него проходит, и близкие к нему кольца разгораются
 * и чуть подаются.
 */

/** Разброс отклика по ширине контура: за его пределами кольцо не реагирует. */
const SPREAD = 78;
/** Постоянная времени сглаживания: за неё проходится 63 % пути до цели. */
const TAU = 0.13;

function attachShieldPointer(root: HTMLElement, card: HTMLElement) {
  const allowed = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  const rings = Array.from(root.querySelectorAll<SVGPathElement>('[data-width]'));
  const widths = rings.map((ring) => Number(ring.dataset.width));

  let frame = 0;
  let visible = true;
  let previous = 0;
  let hoverTarget = 0;
  let hover = 0;
  let pickTarget = HERO_WIDTH;
  let pick = HERO_WIDTH;

  function write() {
    for (let i = 0; i < rings.length; i++) {
      const near = Math.max(0, 1 - Math.abs(widths[i] - pick) / SPREAD);
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
    // Курсор → координаты карточки 535, в которых заданы все контуры.
    const scale = 535 / bounds.width;
    const width = contourWidthAt(
      (event.clientX - bounds.left) * scale,
      (event.clientY - bounds.top) * scale,
    );
    if (width > 0) pickTarget = width;
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
          <linearGradient id="fs-hero-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9ec9ff" stopOpacity=".14" />
            <stop offset="1" stopColor="#9ec9ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="fs-shield__field">
          {FIELD.map((ring) => (
            <g key={ring.width} transform={contourTransform(ring.width)}>
              <path
                className="fs-shield__ring"
                d={SHIELD_PATH}
                data-width={ring.width}
                style={{ '--fs-o': ring.opacity } as React.CSSProperties}
              />
            </g>
          ))}
        </g>

        <g transform={contourTransform(HERO_WIDTH)}>
          <path
            className="fs-shield__hero"
            d={SHIELD_PATH}
            data-width={HERO_WIDTH}
            fill="url(#fs-hero-fill)"
          />
        </g>

        {/* Эмблема по центру щита. Декоративна: сам факт сертификации несёт
            заголовок карточки. */}
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
