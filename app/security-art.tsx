'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { attachSecurityArtMotion } from './security-art-motion';

export type SecurityArtKind = 'fstec' | 'gost' | 'infrastructure' | 'data';

/* Line scenes with independent spring motion, driven by cursor proximity. */
function Shield({ check = false }: { check?: boolean }) {
  return (
    <g className="sp-shield">
      <path d="M0-29 23-19v20C23 18 0 32 0 32S-23 18-23 1v-20Z" />
      {check ? <path d="m-10 0 7 7 14-15" /> : <path d="M0-8v17m-7-9H7" />}
    </g>
  );
}

function TrustScene() {
  return (
    <>
      <path className="sp-guide" d="M88 117v82m224-82v82M200 176v82" />
      {[3, 2, 1, 0].map((layer) => (
        <g key={layer} transform={`translate(0 ${layer * 22})`}>
          <g className="sp-trust-layer" style={{ '--layer': layer } as CSSProperties}>
            <g className="sp-layer-face" data-sp-layer={layer}>
              <path className="sp-side" d="m88 117 112 56 112-56v13l-112 56-112-56Z" />
              <path className="sp-surface" d="m200 61 112 56-112 56-112-56Z" />
              <path className="sp-edge" d="m88 130 112 56 112-56m-112 43v13" />
              {layer === 0 && (
                <g transform="matrix(1 .5 -1 .5 200 117)">
                  <Shield check />
                </g>
              )}
            </g>
          </g>
        </g>
      ))}
    </>
  );
}

/* The bright dots form a lock, so the still frame also explains encryption. */
function CipherScene() {
  return (
    <>
      <rect className="sp-guide" x="55" y="35" width="290" height="210" rx="14" />
      {Array.from({ length: 17 }, (_, col) => (
        <g className="sp-cipher-column" data-sp-column={col} key={col}>
        {Array.from({ length: 11 }, (_, row) => {
          const shackle =
            (row === 1 && col >= 7 && col <= 9) ||
            (row === 2 && (col === 6 || col === 10)) ||
            ((row === 3 || row === 4) && (col === 5 || col === 11));
          const body = row >= 5 && row <= 9 && col >= 4 && col <= 12;
          const keyhole = col === 8 && (row === 6 || row === 7);
          const lit = (shackle || body) && !keyhole;
          return (
            <circle
              className={`sp-cipher-dot${lit ? ' is-lit' : ''}`}
              cx={88 + col * 14}
              cy={64 + row * 14}
              r={2}
              key={`${row}-${col}`}
              style={{ '--phase': `${col * 65 + row * 35}ms` } as CSSProperties}
            />
          );
        })}
        </g>
      ))}
      <path className="sp-cipher-scan" d="M76 45v183" />
      <path className="sp-tick" d="M55 58v-9q0-14 14-14h9m244 0h9q14 0 14 14v9M55 222v9q0 14 14 14h9m244 0h9q14 0 14-14v-9" />
    </>
  );
}

function InfrastructureScene() {
  return (
    <>
      <path className="sp-guide sp-perimeter" d="m200 25 154 77v76l-154 77-154-77v-76Z" />
      <path className="sp-guide" d="m46 102 154 77 154-77M200 179v76" />
      {[2, 1, 0].map((layer) => (
        <g key={layer} transform={`translate(0 ${layer * 33})`}>
          <g className="sp-server" style={{ '--layer': layer } as CSSProperties}>
            <g className="sp-layer-face" data-sp-layer={layer}>
              <path className="sp-side" d="m104 112 96 48 96-48v22l-96 48-96-48Z" />
              <path className="sp-surface" d="m200 64 96 48-96 48-96-48Z" />
              <path className="sp-edge" d="m104 134 96 48 96-48m-96 26v22" />
              {[0, 1, 2].map((led) => (
                <circle
                  className="sp-server-led"
                  key={led}
                  cx={116 + led * 8}
                  cy={129 + led * 4}
                  r="1.4"
                  style={{ '--phase': `${layer * 550 + led * 160}ms` } as CSSProperties}
                />
              ))}
              {[0, 1, 2, 3, 4].map((vent) => (
                <path className="sp-vent" key={vent} d={`m${253 + vent * 6} ${144 - vent * 3}v7`} />
              ))}
              {layer === 0 && <path className="sp-vent" d="m180 111 20-10 20 10-20 10Zm20 10v9" />}
            </g>
          </g>
        </g>
      ))}
    </>
  );
}

function DataScene() {
  return (
    <g data-sp-channel="0">
      <rect className="sp-data-frame" x="38" y="82" width="324" height="176" rx="28" />
      <path className="sp-data-records" d="M104 166H296M104 198H260M104 230H278" />
      <path className="sp-data-shackle" d="M174 74V50a26 26 0 0 1 52 0v24" />
      <rect className="sp-data-lock" x="150" y="62" width="100" height="80" rx="18" />
      <circle className="sp-data-keyhole" cx="200" cy="93" r="7" />
      <path className="sp-data-keyhole-stem" d="M200 98v13" />
    </g>
  );
}

const scenes: Record<SecurityArtKind, () => ReactNode> = {
  fstec: TrustScene,
  gost: CipherScene,
  infrastructure: InfrastructureScene,
  data: DataScene,
};

export default function SecurityArt({ kind }: { kind: SecurityArtKind }) {
  const artRef = useRef<HTMLDivElement>(null);
  const Scene = scenes[kind];

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    return attachSecurityArtMotion(art);
  }, [kind]);

  return (
    <div className={`security-art security-art--${kind}`} ref={artRef} aria-hidden="true" data-motion="paused">
      <svg viewBox="0 0 400 280" fill="none" focusable="false">
        <Scene />
      </svg>
    </div>
  );
}
