'use client';

import { useEffect, useRef } from 'react';

type BlueNoiseLayerProps = {
  className?: string;
};

export default function BlueNoiseLayer({ className = '' }: BlueNoiseLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let frames: ImageData[] = [];
    let frameIndex = 0;
    let lastPaint = 0;

    const rebuild = () => {
      const bounds = canvas.getBoundingClientRect();
      const widthScale = Math.min(0.7, 1024 / Math.max(bounds.width, 1));
      const width = Math.max(1, Math.round(bounds.width * widthScale));
      const height = Math.max(1, Math.round(bounds.height * widthScale));

      canvas.width = width;
      canvas.height = height;
      frames = [];
      let seed = 0x5f3759df;

      for (let currentFrame = 0; currentFrame < 4; currentFrame += 1) {
        const image = context.createImageData(width, height);

        for (let index = 0; index < image.data.length; index += 4) {
          seed ^= seed << 13;
          seed ^= seed >>> 17;
          seed ^= seed << 5;
          image.data[index + 3] = (seed & 1) === 0 ? 0 : 255;
        }

        frames.push(image);
      }

      frameIndex = 0;
      if (frames[0]) context.putImageData(frames[0], 0, 0);
    };

    const animate = (time: number) => {
      if (
        !motionPreference.matches &&
        frames.length > 0 &&
        time - lastPaint >= 72
      ) {
        frameIndex = (frameIndex + 1) % frames.length;
        context.putImageData(frames[frameIndex], 0, 0);
        lastPaint = time;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(rebuild);
    resizeObserver.observe(canvas);
    rebuild();
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      className={`blue-noise-layer ${className}`.trim()}
      ref={canvasRef}
      aria-hidden="true"
    />
  );
}
