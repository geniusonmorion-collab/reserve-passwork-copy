'use client';

import { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  radius?: number | string;
  baseColor?: string;
  surface?: string;
  color?: readonly [number, number, number, number];
  proximity?: number;
};

// Fora's Border_Glow_Card: one-pixel edge, translucent inner fill,
// and per-frame interpolation of the pointer, radius and light strength.
export function GlowBorder({
  className = '',
  radius = 'var(--passwork-card-radius)',
  baseColor = '#000',
  surface = 'rgba(0,0,0,.85)',
  color = [255, 255, 255, .25],
  proximity = 490,
}: Props) {
  const container = useRef<HTMLSpanElement>(null);
  const light = useRef<HTMLSpanElement>(null);
  const config = useRef({ color, proximity });

  useEffect(() => {
    config.current = { color, proximity };
  }, [color, proximity]);

  useEffect(() => {
    const box = container.current!;
    const glow = light.current!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame: number | null = null;
    let visible = false;
    let pointer: { x: number; y: number } | null = null;
    let x = 0, y = 0, opacity = 0;
    let reach = config.current.proximity;
    const rgba = [...config.current.color];

    function draw() {
      const target = config.current;
      const smoothing = reduced.matches ? 1 : .05;
      let tx = x, ty = y, targetOpacity = 0;
      if (pointer) {
        const bounds = box.getBoundingClientRect();
        tx = pointer.x - bounds.left;
        ty = pointer.y - bounds.top;
        const inside = tx >= 0 && tx <= bounds.width && ty >= 0 && ty <= bounds.height;
        const distance = inside
          ? Math.max(0, Math.min(tx, ty, bounds.width - tx, bounds.height - ty) - 1)
          : Math.hypot(tx - Math.max(0, Math.min(tx, bounds.width)), ty - Math.max(0, Math.min(ty, bounds.height)));
        targetOpacity = Math.max(0, 1 - distance / target.proximity);
      }
      x += (tx - x) * smoothing;
      y += (ty - y) * smoothing;
      opacity += (targetOpacity - opacity) * smoothing;
      reach += (target.proximity - reach) * smoothing;
      rgba.forEach((value, i) => { rgba[i] = value + (target.color[i] - value) * smoothing; });
      glow.style.background = `radial-gradient(${reach * 1.5}px circle at ${x}px ${y}px, rgb(var(--border-glow-rgb, ${rgba.slice(0, 3).map(Math.round).join(' ')}) / ${rgba[3].toFixed(3)}), transparent)`;
      glow.style.opacity = String(opacity);
    }

    function tick() {
      draw();
      frame = requestAnimationFrame(tick);
    }

    function move(event: MouseEvent) {
      pointer = { x: event.clientX, y: event.clientY };
      if (reduced.matches) draw();
    }

    function leave() {
      pointer = null;
      if (reduced.matches) draw();
    }

    function stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      document.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
      glow.style.willChange = 'auto';
    }

    function update() {
      stop();
      if (!visible || document.hidden) return;
      document.addEventListener('mousemove', move);
      document.documentElement.addEventListener('mouseleave', leave);
      if (reduced.matches) draw();
      else {
        glow.style.willChange = 'opacity, background';
        frame = requestAnimationFrame(tick);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(box);
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    return () => {
      observer.disconnect();
      stop();
      document.removeEventListener('visibilitychange', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  return (
    <span ref={container} aria-hidden="true" className={`fq-glow ${className}`} style={{ borderRadius: radius, background: `var(--card-glow-base, ${baseColor})` }}>
      <span ref={light} style={{ position: 'absolute', inset: 0, opacity: 0 }} />
      <span style={{ position: 'absolute', inset: 1, borderRadius: `max(0px, calc(${typeof radius === 'number' ? `${radius}px` : radius} - 1px))`, background: `var(--card-glow-surface, ${surface})` }} />
    </span>
  );
}
