'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const rest = 'perspective(160px) rotateY(0deg)';
const turned = 'perspective(160px) rotateY(360deg)';

export default function SectorIcon() {
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
      // A quick three-dimensional turn followed by a quiet hold, as in the video.
      animation = icon.animate(
        [
          { transform: rest, offset: 0, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' },
          { transform: turned, offset: 0.56 },
          { transform: turned, offset: 1 },
        ],
        { duration: 1600, iterations: Infinity },
      );
    };

    const stop = () => {
      if (!animation || settling) return;
      const current = getComputedStyle(icon).transform;
      animation.cancel();
      settling = true;
      animation = icon.animate(
        [{ transform: current }, { transform: rest }],
        { duration: 260, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
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
      src="/assets/figma-517-10784/sector-mark.svg"
      width={20}
      height={25}
      alt=""
      unoptimized
    />
  );
}
