'use client';

import { useEffect, useRef } from 'react';
import { initLiveDashboard } from './live-dashboard-engine';
import { LIVE_DASHBOARD_MARKUP } from './live-dashboard-markup';

/**
 * Живой дашборд в hero: вместо статичного product-screen.png — воссозданный
 * интерфейс, который сам проходит один безличный сценарий (поиск → запись →
 * пароль → копирование → журнал) и подолгу «дышит» в покое. Занимает тот же
 * бокс, что и картинка (класс figma-hero__product), внутри масштабируется
 * под ширину контейнера. При скролле мокап вместе с тенью чуть приподнимается —
 * лёгкий параллакс через переменную --pw-parallax на .figma-hero__visual.
 */
export default function LiveDashboard() {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embed = embedRef.current;
    if (!embed) return;
    const stop = initLiveDashboard(embed);

    const visual = embed.parentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!visual || reduced) return stop;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = visual.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, 1 - rect.top / window.innerHeight));
        visual.style.setProperty('--pw-parallax', `${(-24 * progress).toFixed(1)}px`);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      visual.style.removeProperty('--pw-parallax');
      stop();
    };
  }, []);

  return (
    <div
      ref={embedRef}
      className="figma-hero__product pw-embed"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: LIVE_DASHBOARD_MARKUP }}
    />
  );
}
