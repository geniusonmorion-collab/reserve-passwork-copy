'use client';

import { useEffect, useRef } from 'react';
import './certification-motion.css';

const LEVELS = [0, 1, 2, 3];
const TOP = 'M-6-79Q0-82 6-79L164-3Q170 0 164 3L6 79Q0 82-6 79L-164 3Q-170 0-164-3Z';
const SIDES = 'M-168 0V17Q-168 20-163 23L-6 99Q0 102 6 99L163 23Q168 20 168 17V0L6 79Q0 82-6 79Z';

/** Four abstract trust layers; decorative motion never carries unique information. */
export default function CertificationMotion() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<SVGGElement>(null);
  const guidesRef = useRef<SVGPathElement>(null);
  const plateRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const stack = stackRef.current;
    const card = root?.closest('article');
    if (!root || !stack || !card) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const plates = plateRefs.current.filter((plate): plate is SVGGElement => plate !== null);
    const values = LEVELS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    let visible = false;
    let hovered = false;
    let cursorX = 0;
    let cursorY = 0;
    let focus = -1;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let spread = 0;
    let spreadVelocity = 0;

    const render = (now: number) => {
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.032) : 1 / 60;
      lastTime = now;
      elapsed += dt;
      // A short opening gesture also makes the movement visible on touch screens.
      const entrance = elapsed < 2.4 ? Math.sin(Math.min(elapsed / 2.4, 1) * Math.PI) * 0.75 : 0;
      const targetSpread = hovered ? 1 : entrance;
      spreadVelocity += ((targetSpread - spread) * 125 - spreadVelocity * 17) * dt;
      spread += spreadVelocity * dt;

      stack.setAttribute('transform', `translate(${cursorX * spread * 7} ${cursorY * spread * 3}) rotate(${cursorX * spread * 2},320,260)`);
      plates.forEach((plate, index) => {
        const value = values[index];
        const wave = Math.sin(elapsed * 1.25 - index * 0.65) * (2 + index * 1.1);
        const selected = hovered && focus === index;
        const targetY = -spread * (index * 19 + (selected ? 13 : 0)) + wave;
        const targetX = cursorX * spread * (index + 1) * 6;
        const stiffness = 145 - index * 12;
        value.vy += ((targetY - value.y) * stiffness - value.vy * 17) * dt;
        value.vx += ((targetX - value.x) * stiffness - value.vx * 17) * dt;
        value.y += value.vy * dt;
        value.x += value.vx * dt;
        plate.setAttribute('transform', `translate(${value.x.toFixed(3)} ${value.y.toFixed(3)})`);
      });
      const top = values[3];
      const bottom = values[0];
      guidesRef.current?.setAttribute('d', `M${152 + top.x} ${214 + top.y}L${152 + bottom.x} ${333 + bottom.y}M${488 + top.x} ${214 + top.y}L${488 + bottom.x} ${333 + bottom.y}M${320 + top.x} ${296 + top.y}L${320 + bottom.x} ${416 + bottom.y}`);
      frame = requestAnimationFrame(render);
    };

    const clearPointer = () => {
      hovered = false;
      focus = -1;
      root.dataset.hovered = 'false';
      plates.forEach(plate => { plate.dataset.selected = 'false'; });
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (reducedMotion.matches) {
        clearPointer();
        stack.removeAttribute('transform');
        plates.forEach(plate => plate.removeAttribute('transform'));
        values.forEach(value => { value.x = value.y = value.vx = value.vy = 0; });
        guidesRef.current?.setAttribute('d', 'M152 214V333M488 214V333M320 296V416');
        spread = spreadVelocity = 0;
      } else if (visible && !document.hidden) {
        frame = requestAnimationFrame(render);
      }
    };
    const move = (event: PointerEvent) => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const cardBounds = card.getBoundingClientRect();
      const artBounds = root.getBoundingClientRect();
      hovered = true;
      cursorX = Math.max(-1, Math.min(1, ((event.clientX - cardBounds.left) / cardBounds.width - 0.5) * 2));
      cursorY = Math.max(-1, Math.min(1, ((event.clientY - cardBounds.top) / cardBounds.height - 0.5) * 2));
      const inArt = event.clientX >= artBounds.left && event.clientX <= artBounds.right;
      focus = inArt ? Math.max(0, Math.min(3, Math.round((0.78 - (event.clientY - artBounds.top) / artBounds.height) * 5.5))) : -1;
      root.dataset.hovered = 'true';
      plates.forEach((plate, index) => { plate.dataset.selected = String(index === focus); });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) clearPointer();
      sync();
    }, { threshold: 0.15 });
    const visibilityChange = () => {
      if (document.hidden) clearPointer();
      sync();
    };

    observer.observe(card);
    document.addEventListener('visibilitychange', visibilityChange);
    reducedMotion.addEventListener('change', sync);
    finePointer.addEventListener('change', clearPointer);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', clearPointer);
    card.addEventListener('pointercancel', clearPointer);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', visibilityChange);
      reducedMotion.removeEventListener('change', sync);
      finePointer.removeEventListener('change', clearPointer);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', clearPointer);
      card.removeEventListener('pointercancel', clearPointer);
    };
  }, []);

  return (
    <div className="certification-motion" ref={rootRef} aria-hidden="true">
      <svg className="certification-motion__drawing" viewBox="0 0 640 460" fill="none">
        <g ref={stackRef}>
          <path ref={guidesRef} className="certification-motion__guides" d="M152 214V333M488 214V333M320 296V416" />
          {LEVELS.map(index => (
            <g key={index} transform={`translate(320 ${316 - index * 34})`}>
              <g className={`certification-motion__plate${index === 3 ? ' is-top' : ''}`} ref={element => { plateRefs.current[index] = element; }}>
                <path className="certification-motion__side" d={SIDES} />
                <path className="certification-motion__face" d={TOP} />
                <path className="certification-motion__edge" d="M-168 17L-6 99Q0 102 6 99L168 17M0 82V100" />
                {index === 3 && (
                  <g transform="matrix(1 .48 -1 .48 0 0)">
                    <rect className="certification-motion__emblem" x="-46" y="-46" width="92" height="92" rx="22" />
                    <text className="certification-motion__four" textAnchor="middle" dominantBaseline="central">4</text>
                  </g>
                )}
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
