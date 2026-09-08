'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import './certification-motion.css';

const CYCLE_SECONDS = 12;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const BRANCHES = [
  'M0 120 H18 C45 120 45 100 74 100 H140',
  'M0 120 H18 C45 120 45 128 74 128 H140',
  'M0 120 H18 C45 120 45 155 74 155 H140',
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
      <div className="access-flow__stage access-flow__source">
        <div className="access-flow__device">
          <div className="access-flow__hardware-canvas">
            <Image className="access-flow__hardware" src="/assets/fstec-motion/access-laptop.png" width={1448} height={1086} sizes="(max-width: 767px) 230px, 280px" alt="" unoptimized />
            <div className="access-flow__screen">
              <Image src="/assets/passwork-symbol.svg" width={31} height={31} alt="" unoptimized />
              <span className="access-flow__password">••••••••</span>
              <span className="access-flow__progress"><i /></span>
            </div>
          </div>
        </div>
        <span className="access-flow__caption">Запрос сотрудника</span>
      </div>

      <svg className="access-flow__connection access-flow__connection--in" viewBox="0 0 140 240" preserveAspectRatio="none">
        <path d="M0 120 H140" />
        <path d="M0 120 H140" pathLength="1" data-access-signal data-start="0.95" data-duration="1.4" />
      </svg>
      <svg className="access-flow__connection access-flow__connection--mobile access-flow__connection--in" viewBox="0 0 42 48">
        <path d="M21 0 V48" />
        <path d="M21 0 V48" pathLength="1" data-access-signal data-start="0.95" data-duration="1.4" />
      </svg>

      <div className="access-flow__stage access-flow__center">
        <div className="access-flow__hub">
          <Image src="/assets/passwork-symbol.svg" width={34} height={34} alt="" unoptimized />
        </div>
        <div className="access-flow__status">
          <span className="access-flow__status-content access-flow__status-content--request">
            <span className="access-flow__pending-dot" />Запрос доступа
          </span>
          <span className="access-flow__status-content access-flow__status-content--checking">
            <span className="access-flow__spinner" />Проверка доступа…
          </span>
          <span className="access-flow__status-content access-flow__status-content--allowed">
            <Image src="/assets/check-circle-blue.svg" width={21} height={21} alt="" unoptimized />Доступ разрешён
          </span>
        </div>
        <span className="access-flow__caption">Проверка прав в Пассворке</span>
        <div className="access-flow__audit">
          <span className="access-flow__audit-connector" />
          <div className="access-flow__audit-entry">
            <Image src="/assets/check-circle-blue.svg" width={17} height={17} alt="" unoptimized />
            <span>Доступ записан в журнал</span>
          </div>
        </div>
      </div>

      <svg className="access-flow__connection access-flow__connection--out" viewBox="0 0 140 240" preserveAspectRatio="none">
        {BRANCHES.map((d, index) => (
          <g key={d}>
            <path d={d} />
            <path d={d} pathLength="1" data-access-signal data-start={5.15 + index * 0.15} data-duration="1.3" />
          </g>
        ))}
      </svg>
      <svg className="access-flow__connection access-flow__connection--mobile access-flow__connection--out" viewBox="0 0 42 48">
        <path d="M21 0 V48" />
        <path d="M21 0 V48" pathLength="1" data-access-signal data-start="5.15" data-duration="1.3" />
      </svg>

      <div className="access-flow__stage access-flow__destination">
        <div className="access-flow__servers">
          <div className="access-flow__hardware-canvas">
            <Image className="access-flow__hardware" src="/assets/fstec-motion/access-servers.png" width={1448} height={1086} sizes="(max-width: 767px) 250px, 310px" alt="" unoptimized />
            <span className="access-flow__server-light access-flow__server-light--1" />
            <span className="access-flow__server-light access-flow__server-light--2" />
            <span className="access-flow__server-light access-flow__server-light--3" />
          </div>
        </div>
        <span className="access-flow__caption">Серверы компании</span>
      </div>
    </div>
  );
}
