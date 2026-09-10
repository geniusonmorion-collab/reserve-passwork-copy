'use client';

import { useEffect, useRef } from 'react';
import { initLiveDashboard } from './live-dashboard-engine';
import { LIVE_DASHBOARD_MARKUP } from './live-dashboard-markup';
import './dashboard-glass.css';

/** Live desktop demo and a readable, static password pane on small screens.
 * The hero owns the surrounding composition and scroll motion. */
export default function LiveDashboard() {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embed = embedRef.current;
    if (!embed) return;
    const phone = window.matchMedia('(max-width: 809.98px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop: (() => void) | undefined;
    const initialize = () => {
      stop?.();
      stop = initLiveDashboard(embed, { animate: !phone.matches });
    };
    initialize();
    phone.addEventListener('change', initialize);
    reduced.addEventListener('change', initialize);
    return () => {
      phone.removeEventListener('change', initialize);
      reduced.removeEventListener('change', initialize);
      stop?.();
    };
  }, []);

  return (
    <div
      ref={embedRef}
      className="figma-hero__product pw-embed pw-glass"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: LIVE_DASHBOARD_MARKUP }}
    />
  );
}
