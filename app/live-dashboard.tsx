'use client';

import { useEffect, useRef } from 'react';
import { initLiveDashboard } from './live-dashboard-engine';
import { LIVE_DASHBOARD_MARKUP } from './live-dashboard-markup';

/**
 * Живой дашборд в hero: вместо статичного product-screen.png — воссозданный
 * интерфейс, в котором три курсора коллег одновременно кликают, переключают
 * записи и вкладки, раскрывают дерево. Занимает тот же бокс, что и картинка
 * (класс figma-hero__product), внутри масштабируется под ширину контейнера.
 */
export default function LiveDashboard() {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embed = embedRef.current;
    if (!embed) return;
    return initLiveDashboard(embed);
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
