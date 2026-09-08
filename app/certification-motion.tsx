'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import './certification-motion.css';

const CYCLE_SECONDS = 12;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const BRANCHES = [
  'M0 120 H20 C66 120 66 52 106 52 H160',
  'M0 120 H160',
  'M0 120 H20 C66 120 66 188 106 188 H160',
];

/** A decorative access scenario; no real requests or security checks are made. */
export default function CertificationMotion() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const card = root.closest('article') ?? root;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const signals = Array.from(root.querySelectorAll<SVGPathElement>('[data-access-signal]'));
    let visible = false;
    let hovering = false;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let speed = 1;

    const paint = (time: number, staticView = false) => {
      const phase = staticView ? 'logged'
        : time < 0.65 || time >= 10.8 ? 'waiting'
        : time < 2.4 ? 'request'
        : time < 5 ? 'checking'
        : time < 7.15 ? 'allowed' : 'logged';
      if (root.dataset.phase !== phase) root.dataset.phase = phase;
      root.style.setProperty('--access-progress', String(staticView ? 1 : time < 10.8 ? clamp((time - 0.65) / 4.35) : 0));
      root.style.setProperty('--orbit-angle', `${staticView ? 0 : time / CYCLE_SECONDS * 360}deg`);
      signals.forEach((signal) => {
        const start = Number(signal.dataset.start);
        const duration = Number(signal.dataset.duration);
        const progress = clamp((time - start) / duration);
        const opacity = staticView || time < start || time > start + duration
          ? 0 : Math.min(clamp(progress * 8), clamp((1 - progress) * 8));
        signal.style.strokeDashoffset = String(0.12 - progress * 1.12);
        signal.style.opacity = String(opacity);
      });
    };
    const animate = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      speed += ((hovering ? 1.2 : 1) - speed) * Math.min(delta * 5, 1);
      elapsed += delta * speed;
      paint(elapsed % CYCLE_SECONDS);
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      root.dataset.running = String(visible && !document.hidden && !motion.matches);
      if (motion.matches) paint(8, true);
      else if (visible && !document.hidden) frame = requestAnimationFrame(animate);
    };
    const enter = () => { hovering = true; };
    const leave = () => { hovering = false; };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.2 });

    observer.observe(root);
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div className="certification-motion" ref={rootRef} data-phase="waiting" aria-hidden="true">
      <div className="trust-flow__source">
        <div className="trust-flow__source-scene">
          <span className="trust-flow__source-ring" />
          <span className="trust-flow__request-pulse" />
          <div className="trust-flow__avatar">
            <svg viewBox="0 0 16 16" className="trust-flow__icon">
              <circle cx="6.5" cy="5.2" r="2.7" />
              <path d="M1.8 13.5c.4-2.6 2.2-4.1 4.7-4.1 1 0 1.9.2 2.6.7M12.5 8.6v4.6M10.2 10.9h4.6" />
            </svg>
          </div>
          <span className="trust-flow__credential">••••••••<i /></span>
        </div>
      </div>

      <svg className="trust-flow__connection trust-flow__connection--desktop" viewBox="0 0 160 240" preserveAspectRatio="none">
        <path d="M0 120 H160" />
        <path d="M0 120 H160" pathLength="1" data-access-signal data-start="0.95" data-duration="1.4" />
      </svg>
      <svg className="trust-flow__connection trust-flow__connection--mobile" viewBox="0 0 42 48">
        <path d="M21 0 V48" />
        <path d="M21 0 V48" pathLength="1" data-access-signal data-start="0.95" data-duration="1.4" />
      </svg>

      <div className="trust-flow__center">
        <div className="trust-flow__orbit-scene">
          <div className="trust-flow__orbits">
            <span className="trust-flow__orbit trust-flow__orbit--outer" />
            <span className="trust-flow__orbit trust-flow__orbit--inner" />
            <span className="trust-flow__orbital-light" />
          </div>
          <div className="trust-flow__hub">
            <Image src="/assets/icon-security-a.svg" width={37} height={45} alt="" unoptimized />
            <span className="trust-flow__hub-check">
              <Image src="/assets/check-circle-blue.svg" width={23} height={23} alt="" unoptimized />
            </span>
          </div>
        </div>
        <div className="trust-flow__status">
          <span className="trust-flow__status-copy trust-flow__status-copy--waiting">Проверка прав</span>
          <span className="trust-flow__status-copy trust-flow__status-copy--checking"><i className="trust-flow__spinner" />Проверка доступа…</span>
          <span className="trust-flow__status-copy trust-flow__status-copy--allowed">Доступ разрешён</span>
        </div>
      </div>

      <svg className="trust-flow__connection trust-flow__connection--desktop" viewBox="0 0 160 240" preserveAspectRatio="none">
        {BRANCHES.map((d, index) => (
          <g key={d}>
            <path d={d} />
            <path d={d} pathLength="1" data-access-signal data-start={index === 2 ? 6.6 : 5.15 + index * 0.2} data-duration={index === 2 ? 0.6 : 1.2} />
          </g>
        ))}
      </svg>
      <svg className="trust-flow__connection trust-flow__connection--mobile" viewBox="0 0 42 48">
        <path d="M21 0 V48" />
        <path d="M21 0 V48" pathLength="1" data-access-signal data-start="5.15" data-duration="1.2" />
      </svg>

      <div className="trust-flow__destination">
        <div className="trust-flow__resource trust-flow__resource--vault">
          <span className="trust-flow__resource-icon">
            <svg className="trust-flow__icon" viewBox="0 0 20 16"><path d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z" /></svg>
          </span>
          <span>Сейф компании</span><span className="trust-flow__resource-dot" />
        </div>
        <div className="trust-flow__resource trust-flow__resource--passwords">
          <span className="trust-flow__resource-icon"><Image src="/assets/passwork-symbol.svg" width={22} height={22} alt="" unoptimized /></span>
          <span>Пароли и ключи</span><span className="trust-flow__resource-dot" />
        </div>
        <div className="trust-flow__resource trust-flow__resource--journal">
          <span className="trust-flow__resource-icon">
            <svg className="trust-flow__icon" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" /><path d="M8 4.6V8l2.4 1.5" /></svg>
          </span>
          <span className="trust-flow__journal-label"><span>Журнал действий</span><span>Доступ записан</span></span>
          <span className="trust-flow__resource-dot" />
        </div>
      </div>
    </div>
  );
}
