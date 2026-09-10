'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { attachBorderGlow } from './fora-tab-effects';
import './card-glow.css';

export default function CardGlow({
  className = '',
  radius = 'var(--passwork-card-radius, 7px)',
  baseColor = '#000',
  surface = 'rgba(0,0,0,.85)',
}: {
  className?: string;
  radius?: number | string;
  baseColor?: string;
  surface?: string;
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
      className={`fora-card-glow ${className}`}
      aria-hidden="true"
      style={{
        '--fora-glow-radius': typeof radius === 'number' ? `${radius}px` : radius,
        background: baseColor,
      } as CSSProperties}
    >
      <div ref={light} className="fora-card-glow__light" />
      <div className="fora-card-glow__fill" style={{ background: surface }} />
    </div>
  );
}
