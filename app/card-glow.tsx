'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { attachBorderGlow } from './fora-tab-effects';
import './card-glow.css';

export default function CardGlow({
  className = '',
  radius = 'var(--passwork-card-radius, 7px)',
  baseColor = '#000',
  surface = 'rgba(0,0,0,.85)',
  borderOnly = false,
  interiorGlow = 0,
}: {
  className?: string;
  radius?: number | string;
  baseColor?: string;
  surface?: string;
  borderOnly?: boolean;
  /** Amount of the edge's light retained inside a card that owns its surface. */
  interiorGlow?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (frame.current && light.current) {
      return attachBorderGlow(frame.current, light.current, 490, .25);
    }
  }, []);

  return (
    <div
      ref={frame}
      className={`fora-card-glow${borderOnly ? ' fora-card-glow--border-only' : ''} ${className}`}
      aria-hidden="true"
      style={{
        '--fora-glow-radius': typeof radius === 'number' ? `${radius}px` : radius,
        '--fora-glow-interior-alpha': Math.max(0, Math.min(1, interiorGlow)),
        background: borderOnly ? 'transparent' : `var(--card-glow-base, ${baseColor})`,
      } as CSSProperties}
    >
      <div ref={light} className="fora-card-glow__light" />
      {!borderOnly && <div className="fora-card-glow__fill" style={{ background: `var(--card-glow-surface, ${surface})` }} />}
    </div>
  );
}
