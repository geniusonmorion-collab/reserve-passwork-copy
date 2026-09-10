'use client';

import { useEffect, useRef } from 'react';

// Port of Fora's Border_Glow_Card and Tabs/progress components (https://fora.so/).
// These are the tab's authored settings, not the generic component defaults.
const SMOOTHING = .05;
const BORDER_WIDTH = 1;

export function attachBorderGlow(card: HTMLElement, light: HTMLElement, proximity = 130, glowOpacity = .65) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame: number | null = null;
  let visible = false;
  let targetX = 0;
  let targetY = 0;
  let targetOpacity = 0;
  let x = 0;
  let y = 0;
  let opacity = 0;

  function draw() {
    // Fora interpolates by .05 on each frame, including the light's opacity.
    const smoothing = reducedMotion.matches ? 1 : SMOOTHING;
    x += (targetX - x) * smoothing;
    y += (targetY - y) * smoothing;
    opacity += (targetOpacity - opacity) * smoothing;
    light.style.background = `radial-gradient(${proximity * 1.5}px circle at ${x}px ${y}px, rgba(255,255,255,${glowOpacity.toFixed(3)}), transparent)`;
    light.style.opacity = String(opacity);
  }

  function animate() {
    draw();
    frame = requestAnimationFrame(animate);
  }

  function move(event: MouseEvent) {
    const bounds = card.getBoundingClientRect();
    targetX = event.clientX - bounds.left;
    targetY = event.clientY - bounds.top;
    const inside = targetX >= 0 && targetX <= bounds.width && targetY >= 0 && targetY <= bounds.height;
    if (inside) {
      const distance = Math.min(targetX, targetY, bounds.width - targetX, bounds.height - targetY);
      targetOpacity = Math.min(1, 1 - Math.max(0, (distance - BORDER_WIDTH) / proximity));
    } else {
      const closestX = Math.max(0, Math.min(targetX, bounds.width));
      const closestY = Math.max(0, Math.min(targetY, bounds.height));
      const distance = Math.sqrt((targetX - closestX) ** 2 + (targetY - closestY) ** 2);
      targetOpacity = Math.max(0, 1 - distance / proximity);
    }
    if (reducedMotion.matches) draw();
  }

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    document.removeEventListener('mousemove', move);
    light.style.willChange = 'auto';
  }

  function update() {
    stop();
    if (!visible || document.hidden) return;
    document.addEventListener('mousemove', move);
    if (reducedMotion.matches) draw();
    else {
      light.style.willChange = 'opacity, background';
      frame = requestAnimationFrame(animate);
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }, { threshold: 0 });
  observer.observe(card);
  document.addEventListener('visibilitychange', update);
  reducedMotion.addEventListener('change', update);
  return () => {
    observer.disconnect();
    stop();
    document.removeEventListener('visibilitychange', update);
    reducedMotion.removeEventListener('change', update);
  };
}

// Fora uses a separate, wider and dimmer proximity field on the two frames:
// 490px reach, 735px radial light, 25% white, 1px edge, black 85% inner fill.
export function ForaBorderFrame() {
  const card = useRef<HTMLSpanElement>(null);
  const light = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (card.current && light.current) return attachBorderGlow(card.current, light.current, 490, .25);
  }, []);

  return <span ref={card} className="product-features__border-frame" aria-hidden="true">
    <span ref={light} className="product-features__frame-glow" />
    <span className="product-features__frame-fill" />
  </span>;
}

export default function ForaTabEffects({ active, cycle }: { active: boolean; cycle: number }) {
  const card = useRef<HTMLSpanElement>(null);
  const light = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (card.current && light.current) return attachBorderGlow(card.current, light.current);
  }, []);

  return <>
    <span className="product-features__tab-surface" aria-hidden="true">
      <span ref={card} className="product-features__tab-border">
        <span ref={light} className="product-features__tab-glow" />
        <span className="product-features__tab-fill" />
      </span>
    </span>
    {active && <span className="product-features__tab-timer" aria-hidden="true">
      <span key={cycle} className="product-features__timer-entry">
        <span className="product-features__timer-track">
          <span className="product-features__timer-progress" />
        </span>
      </span>
    </span>}
  </>;
}
