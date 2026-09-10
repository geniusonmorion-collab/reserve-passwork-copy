'use client';

import { useEffect, useRef } from 'react';
import BackgroundStars from './background-stars';
import './aurora-transition.css';

export default function AuroraTransition() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const distance = Math.max(bounds.height - window.innerHeight, 1);
      const progress = reducedMotion.matches
        ? 0
        : Math.min(1, Math.max(0, -bounds.top / distance));
      const eased = progress * progress * (3 - 2 * progress);

      section.style.setProperty('--aurora-exposure', String(1 + eased * 1.8));
      section.style.setProperty('--aurora-wash', String(eased ** 2));
      section.style.setProperty('--aurora-top-shade', String(1 - Math.min(1, progress * 4)));
    };

    const queueUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const updateVisibility = () => {
      section.dataset.active = String(visible && !document.hidden);
      if (visible) queueUpdate();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateVisibility();
    });
    const resizeObserver = new ResizeObserver(queueUpdate);

    observer.observe(section);
    resizeObserver.observe(section);
    update();
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate, { passive: true });
    document.addEventListener('visibilitychange', updateVisibility);
    reducedMotion.addEventListener('change', queueUpdate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', queueUpdate);
      window.removeEventListener('resize', queueUpdate);
      document.removeEventListener('visibilitychange', updateVisibility);
      reducedMotion.removeEventListener('change', queueUpdate);
    };
  }, []);

  return (
    <section className="aurora-transition" ref={sectionRef} aria-hidden="true">
      <div className="aurora-transition__stage">
        <div className="aurora-transition__color">
          <BackgroundStars className="aurora-transition__stars" />
          <div className="aurora-transition__glow" />
          <div className="aurora-transition__rays" />
        </div>
        <div className="aurora-transition__shade" />
        <div className="aurora-transition__wash" />
      </div>
    </section>
  );
}
