'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const rest = 'perspective(240px) rotateY(0deg)';
const turned = 'perspective(240px) rotateY(360deg)';

type SectorIconName = 'factory' | 'network' | 'landmark' | 'shield-user';

export default function SectorIcon({ name }: { name: SectorIconName }) {
  const iconRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const icon = iconRef.current;
    const card = icon?.closest('.figma-sector-card');
    if (!icon || !card) return;

    const motionAllowed = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    let animation: Animation | null = null;
    let settling = false;

    const reset = () => {
      animation?.cancel();
      animation = null;
      settling = false;
    };

    const start = () => {
      if (!motionAllowed.matches || animation) return;
      // Ease into a full turn, then hold briefly before repeating.
      animation = icon.animate(
        [
          { transform: rest, offset: 0, easing: 'cubic-bezier(0.42, 0, 0.58, 1)' },
          { transform: turned, offset: 0.64 },
          { transform: turned, offset: 1 },
        ],
        { duration: 1900, iterations: Infinity },
      );
    };

    const stop = () => {
      if (!animation || settling) return;
      const current = getComputedStyle(icon).transform;
      animation.cancel();
      settling = true;
      animation = icon.animate(
        [{ transform: current }, { transform: rest }],
        { duration: 360, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
      );
      animation.onfinish = () => {
        reset();
        if (card.matches(':hover')) start();
      };
    };

    const updatePreference = () => {
      reset();
      if (card.matches(':hover')) start();
    };

    card.addEventListener('pointerenter', start);
    card.addEventListener('pointerleave', stop);
    card.addEventListener('pointercancel', stop);
    motionAllowed.addEventListener('change', updatePreference);

    return () => {
      reset();
      card.removeEventListener('pointerenter', start);
      card.removeEventListener('pointerleave', stop);
      card.removeEventListener('pointercancel', stop);
      motionAllowed.removeEventListener('change', updatePreference);
    };
  }, []);

  return (
    <Image
      ref={iconRef}
      className="figma-sector-card__icon"
      src={`/assets/sector-icons/${name}.svg`}
      width={24}
      height={24}
      alt=""
      unoptimized
    />
  );
}
