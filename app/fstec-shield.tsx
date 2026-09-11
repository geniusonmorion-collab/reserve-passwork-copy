'use client';

import { useEffect, useRef } from 'react';
import {
  SCENE,
  SHIELD_PATH,
  SHIELD_RATIO,
  contourWidthAt,
} from './fstec-shield-geometry';
import './fstec-shield.css';

/*
 * Иллюстрация панели сертификации, Figma 65:197: гранёный щит, утащенный вниз
 * так, что в кадре остаются верхушки и прямые линии, поле концентрических
 * контуров и стеклянная плашка сертификата.
 *
 * Вся композиция — один SVG в системе координат 535 × 535, включая свечение
 * и эмблему. `preserveAspectRatio="xMaxYMax meet"` прижимает её к правому
 * нижнему углу, поэтому карточка может быть любых пропорций: на узких
 * брейкпоинтах иллюстрация просто занимает меньше места, не искажаясь.
 *
 * Курсор «выбирает» контур: по его положению считается, через какой по ширине
 * контур он проходит, и близкие к нему кольца разгораются и чуть подаются.
 * Полярная таблица формы из `fstec-shield-geometry` даёт это одним делением,
 * без перебора путей и без замеров геометрии на каждом кадре.
 */

/** Разброс отклика по ширине контура: за его пределами кольцо не реагирует. */
const SPREAD = 96;
/** Постоянная времени сглаживания: за неё проходится 63 % пути до цели. */
const TAU = 0.13;
/** Центр нормализованного бокса формы. */
const BOX_CENTER = { x: 50, y: 59 };

function shieldTransform(width: number) {
  const height = width * SHIELD_RATIO;
  return `translate(${SCENE.cx - width / 2} ${SCENE.cy - height / 2}) scale(${width / 100})`;
}

/* Слои кометы: общая голова, разная длина следа. */
const cometLayers = [
  { name: 'tail', dash: 0.34 },
  { name: 'mid', dash: 0.18 },
  { name: 'glow', dash: 0.08 },
  { name: 'head', dash: 0.08 },
];

const FIELD = SCENE.field.map((width) => {
  const distance = Math.abs(width - SCENE.heroWidth) / 260;
  return { width, opacity: Math.max(0.03, 0.12 - distance * 0.07) };
});

function attachShieldPointer(root: HTMLElement, card: HTMLElement) {
  const allowed = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  const rings = Array.from(root.querySelectorAll<SVGPathElement>('[data-ring-width]'));
  const widths = rings.map((ring) => Number(ring.dataset.ringWidth));

  let frame = 0;
  // Считаем видимым до первого ответа наблюдателя: его колбэк асинхронный,
  // и иначе самое первое движение курсора не запускало бы цикл.
  let visible = true;
  let previous = 0;
  let hoverTarget = 0;
  let hover = 0;
  // Ширина контура под курсором: SCENE помечен as const, поэтому тип задаём.
  let pickTarget: number = SCENE.heroWidth;
  let pick: number = SCENE.heroWidth;

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
    // Курсор → координаты карточки 535 → единицы бокса формы.
    const scale = 535 / bounds.width;
    const dx = (event.clientX - bounds.left) * scale - SCENE.cx;
    const dy = (event.clientY - bounds.top) * scale - SCENE.cy;
    const width = contourWidthAt(BOX_CENTER.x + dx, BOX_CENTER.y + dy);
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
      <svg
        className="fs-shield__art"
        viewBox="0 0 535 535"
        preserveAspectRatio="xMaxYMax meet"
        fill="none"
      >
        <defs>
          <radialGradient id="fs-glow">
            <stop offset="0" stopColor="#8cbeff" stopOpacity=".2" />
            <stop offset=".55" stopColor="#73adff" stopOpacity=".06" />
            <stop offset="1" stopColor="#73adff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fs-hero-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6f0ff" stopOpacity=".72" />
            <stop offset="1" stopColor="#cce0ff" stopOpacity=".12" />
          </linearGradient>
          <linearGradient id="fs-hero-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a8c8ff" stopOpacity=".1" />
            <stop offset="1" stopColor="#80b0ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="409" cy="476" rx="325" ry="280" fill="url(#fs-glow)" />

        <g className="fs-shield__field">
          {FIELD.map((ring) => (
            <g key={ring.width} transform={shieldTransform(ring.width)}>
              <path
                className="fs-shield__ring"
                d={SHIELD_PATH}
                data-ring-width={ring.width}
                style={{ '--fs-o': ring.opacity.toFixed(3) } as React.CSSProperties}
              />
            </g>
          ))}
        </g>

        <g transform={shieldTransform(SCENE.heroWidth)}>
          <path
            className="fs-shield__hero"
            d={SHIELD_PATH}
            data-ring-width={SCENE.heroWidth}
            fill="url(#fs-hero-fill)"
            stroke="url(#fs-hero-stroke)"
          />
        </g>

        <g transform={shieldTransform(SCENE.heroWidth)}>
          {cometLayers.map((layer) => (
            <path
              key={layer.name}
              className={`fs-shield__comet fs-shield__comet--${layer.name}`}
              d={SHIELD_PATH}
              pathLength="1"
              style={{ '--fs-dash': layer.dash } as React.CSSProperties}
            />
          ))}
        </g>
        {/* Эмблема лежит на лицевой части щита и служит его гербом. Внутри
            SVG она масштабируется и прижимается вместе со всей композицией. */}
        <image
          className="fs-shield__emblem"
          href="/assets/figma-45-6893/fstec-emblem.webp"
          x="316"
          y="270"
          width="152"
          height="197"
        />
      </svg>
    </div>
  );
}
