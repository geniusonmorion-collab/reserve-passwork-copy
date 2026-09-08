'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import './certification-motion.css';

const CHECK_TIMES = [1.85, 2.5, 3.15, 3.8];
const CYCLE_SECONDS = 9;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** An illustrative compliance flow, not an interactive or live certificate check. */
export default function CertificationMotion() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stages = Array.from(root.querySelectorAll<HTMLElement>('[data-flow-stage]'));
    const gates = Array.from(root.querySelectorAll<HTMLElement>('[data-flow-gate]'));
    const signals = Array.from(root.querySelectorAll<HTMLElement>('[data-flow-signal]'));
    const result = root.querySelector<HTMLElement>('[data-flow-result]');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;

    const setState = (element: HTMLElement, state: string) => {
      if (element.dataset.state !== state) element.dataset.state = state;
    };
    const signal = (index: number, time: number, start: number, end: number) => {
      const element = signals[index];
      element.style.setProperty('--signal-progress', `${clamp((time - start) / (end - start)) * 100}%`);
      setState(element, time >= start && time <= end ? 'moving' : 'hidden');
    };
    const paint = (time: number, staticView = false) => {
      const complete = staticView || time >= 5.45;
      setState(stages[0], staticView || time >= 0.35 ? 'done' : 'waiting');
      setState(stages[1], complete ? 'done' : time >= 1.65 ? 'checking' : 'waiting');
      setState(stages[2], complete ? 'done' : 'waiting');
      gates.forEach((gate, index) => {
        const start = CHECK_TIMES[index];
        setState(gate, staticView || time >= start + 0.4 ? 'done' : time >= start ? 'checking' : 'waiting');
      });
      if (result) setState(result, complete ? 'done' : 'waiting');
      signal(0, time, 0.8, 1.75);
      signal(1, time, 1.85, 4.2);
      signal(2, time, 4.45, 5.4);
      root.style.setProperty('--flow-opacity', String(staticView ? 1 : time >= 8.25 ? 1 - clamp((time - 8.25) / 0.75) * 0.3 : 0.7 + clamp(time / 0.35) * 0.3));
      if (staticView) signals.forEach(element => setState(element, 'hidden'));
    };
    const animate = (now: number) => {
      if (previous) elapsed += Math.min((now - previous) / 1000, 0.05);
      previous = now;
      paint(elapsed % CYCLE_SECONDS);
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (motion.matches) paint(CYCLE_SECONDS - 1, true);
      else if (visible && !document.hidden) frame = requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.2 });

    observer.observe(root);
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div className="certification-motion" ref={rootRef} aria-hidden="true">
      <div className="certification-flow__stage" data-flow-stage>
        <div className="certification-flow__visual">
          <div className="certification-flow__product">
            <div className="certification-flow__product-header">
              <Image src="/assets/passwork-symbol.svg" width={26} height={26} alt="" unoptimized />
              <span>Пассворк</span>
            </div>
            <div className="certification-flow__password"><i /><span>••••••••••</span></div>
            <div className="certification-flow__password"><i /><span>••••••••</span></div>
            <div className="certification-flow__password"><i /><span>•••••••••</span></div>
          </div>
        </div>
        <span className="certification-flow__caption">Корпоративные пароли</span>
      </div>

      <div className="certification-flow__connector"><span data-flow-signal /></div>

      <div className="certification-flow__stage" data-flow-stage>
        <div className="certification-flow__visual">
          <div className="certification-flow__checks">
            <div className="certification-flow__check-line"><span data-flow-signal /></div>
            {CHECK_TIMES.map((_, index) => (
              <div className="certification-flow__gate" data-flow-gate key={index}>
                <span className="certification-flow__gate-number">0{index + 1}</span>
                <span className="certification-flow__gate-scan" />
                <span className="certification-flow__gate-check">
                  <Image src="/assets/check-circle-blue.svg" width={20} height={20} alt="" unoptimized />
                </span>
              </div>
            ))}
          </div>
        </div>
        <span className="certification-flow__caption">Проверка соответствия</span>
      </div>

      <div className="certification-flow__connector"><span data-flow-signal /></div>

      <div className="certification-flow__stage" data-flow-stage>
        <div className="certification-flow__visual">
          <div className="certification-flow__result" data-flow-result>
            <span className="certification-flow__result-title">ФСТЭК России</span>
            <strong>4</strong>
            <span className="certification-flow__result-level">уровень доверия</span>
            <span className="certification-flow__result-check">
              <Image src="/assets/check-circle-blue.svg" width={30} height={30} alt="" unoptimized />
            </span>
          </div>
        </div>
        <span className="certification-flow__caption">Соответствие подтверждено</span>
      </div>
    </div>
  );
}
