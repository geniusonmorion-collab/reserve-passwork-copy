'use client';

import { useEffect, useRef } from 'react';

const keyCopy =
  'ПАССВОРК // ДОСТУПЫ ПОД КОНТРОЛЕМ // ПАРОЛИ И ПРАВА // ';

type KeyMask = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

function buildKeyMask(image: HTMLImageElement): KeyMask | null {
  const size = 384;
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = size;
  sourceCanvas.height = size;

  const sourceContext = sourceCanvas.getContext('2d', {
    willReadFrequently: true,
  });
  if (!sourceContext) return null;

  sourceContext.clearRect(0, 0, size, size);
  sourceContext.drawImage(image, 0, 0, size, size);
  const imageData = sourceContext.getImageData(0, 0, size, size);

  let left = size;
  let top = size;
  let right = 0;
  let bottom = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const red = imageData.data[offset];
      const green = imageData.data[offset + 1];
      const blue = imageData.data[offset + 2];
      const alpha = imageData.data[offset + 3];
      const isKey = alpha > 80 && red > 225 && green > 225 && blue > 225;

      if (!isKey) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (left >= right || top >= bottom) return null;

  return {
    data: imageData.data,
    width: size,
    height: size,
    left,
    top,
    right,
    bottom,
  };
}

function sampleKey(mask: KeyMask, horizontal: number, vertical: number) {
  if (horizontal < 0 || horizontal > 1 || vertical < 0 || vertical > 1) {
    return false;
  }

  const x = Math.round(mask.left + horizontal * (mask.right - mask.left));
  const y = Math.round(mask.top + vertical * (mask.bottom - mask.top));
  const offset = (y * mask.width + x) * 4;

  return (
    mask.data[offset + 3] > 80 &&
    mask.data[offset] > 225 &&
    mask.data[offset + 1] > 225 &&
    mask.data[offset + 2] > 225
  );
}

type PassworkKeyCompositionProps = {
  variant?: 'section' | 'hero';
};

export default function PassworkKeyComposition({
  variant = 'section',
}: PassworkKeyCompositionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const image = new Image();
    image.decoding = 'async';
    image.src = '/assets/passwork-symbol.svg';

    let keyMask: KeyMask | null = null;
    let animationFrame = 0;
    let resizeFrame = 0;
    let width = 1;
    let height = 1;
    let deviceScale = 1;
    let disposed = false;

    const resize = () => {
      resizeFrame = 0;
      const bounds = root.getBoundingClientRect();
      width = Math.max(variant === 'hero' ? bounds.width : window.innerWidth, 1);
      height = Math.max(
        variant === 'hero' ? bounds.height : window.innerHeight,
        1,
      );
      deviceScale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * deviceScale);
      canvas.height = Math.round(height * deviceScale);
      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
      queueDraw();
    };

    const draw = () => {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);

      if (!keyMask) return;

      const bounds = root.getBoundingClientRect();
      const stickyHeight =
        canvas.parentElement?.getBoundingClientRect().height ?? height;
      const scrollDistance = Math.max(
        bounds.height - stickyHeight * 2,
        1,
      );
      const rawProgress =
        variant === 'hero' ? 0 : clamp(-bounds.top / scrollDistance);
      const progress = reducedMotion.matches
        ? variant === 'hero'
          ? 0
          : 1
        : easeOutCubic(rawProgress);
      const visible = bounds.bottom > 0 && bounds.top < height;

      if (variant !== 'hero' && !visible) return;

      const mobile = width <= 768;
      const fontSize = mobile
        ? clamp(width * 0.024, 9, 12)
        : clamp(width * 0.00825, 11, 16);
      const columnStep = fontSize * 0.68;
      const rowStep = fontSize * 1.46;
      const settledSize = variant === 'hero'
        ? mobile
          ? Math.min(width * 1.12, height * 0.76)
          : Math.min(width * 0.62, height * 0.92)
        : mobile
          ? Math.min(width * 1.02, height * 0.78)
          : Math.min(width * 0.62, height);
      const scale = reducedMotion.matches
        ? 1
        : variant === 'hero'
          ? 1.04 - progress * 0.04
          : 1.18 - progress * 0.18;
      const keySize = settledSize * scale;
      const centerX = width * 0.5;
      const centerY = variant === 'hero'
        ? height * (mobile ? 0.56 : 0.58) - progress * height * 0.035
        : mobile
          ? height * 0.59
          : height * (0.82 - progress * 0.12);
      const shiftY = reducedMotion.matches
        ? 0
        : mobile
          ? height * (0.04 - progress * 0.04)
          : 0;
      const left = centerX - keySize * 0.5;
      const top = centerY - keySize * 0.5 + shiftY;
      const columns = Math.ceil(keySize / columnStep);
      const rows = Math.ceil(keySize / rowStep);
      const sequence = Math.floor(rawProgress * 5);
      const baseAlpha = variant === 'hero'
        ? 0.3 - progress * 0.06
        : 0.22 + progress * 0.16;
      let characterIndex = 0;

      context.save();
      context.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      for (let row = 0; row <= rows; row += 1) {
        const y = top + row * rowStep;
        const vertical = (y - top) / keySize;

        for (let column = 0; column <= columns; column += 1) {
          const x = left + column * columnStep;
          const horizontal = (x - left) / keySize;
          const inside =
            sampleKey(keyMask, horizontal, vertical) ||
            sampleKey(
              keyMask,
              horizontal + columnStep * 0.2 / keySize,
              vertical,
            );

          if (!inside) continue;

          const character = keyCopy[characterIndex % keyCopy.length];
          const hash = (row * 31 + column * 17 + row * column * 3) % 97;
          const blueCharacter =
            (hash + sequence * 11) % 43 === 0 ||
            (hash + sequence * 5) % 71 === 0;
          const revealLine = clamp(
            (progress * 1.25 - vertical * 0.38 + 0.12) * 2,
          );
          const alpha = baseAlpha * (0.58 + revealLine * 0.42);

          context.fillStyle = blueCharacter
            ? variant === 'hero'
              ? `rgb(41 141 255 / ${0.62 - progress * 0.08})`
              : `rgb(41 141 255 / ${0.56 + progress * 0.3})`
            : `rgb(108 117 132 / ${alpha})`;
          context.fillText(character, x, y);
          characterIndex += 1;
        }
      }

      context.restore();
    };

    function queueDraw() {
      if (animationFrame || disposed) return;
      animationFrame = window.requestAnimationFrame(draw);
    }

    const queueResize = () => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(resize);
    };

    const handleImageReady = () => {
      if (disposed) return;
      keyMask = buildKeyMask(image);
      queueResize();
    };

    image.addEventListener('load', handleImageReady);
    if (image.complete && image.naturalWidth > 0) handleImageReady();

    resize();
    if (variant !== 'hero') {
      window.addEventListener('scroll', queueDraw, { passive: true });
    }
    window.addEventListener('resize', queueResize, { passive: true });
    reducedMotion.addEventListener('change', queueResize);

    return () => {
      disposed = true;
      image.removeEventListener('load', handleImageReady);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      if (variant !== 'hero') {
        window.removeEventListener('scroll', queueDraw);
      }
      window.removeEventListener('resize', queueResize);
      reducedMotion.removeEventListener('change', queueResize);
    };
  }, [variant]);

  if (variant === 'hero') {
    return (
      <div className="hero-key-pattern" aria-hidden="true" ref={rootRef}>
        <canvas ref={canvasRef} />
      </div>
    );
  }

  return (
    <section
      id="key-composition"
      className="passwork-key-composition"
      aria-labelledby="passwork-key-composition-title"
      ref={rootRef}
    >
      <h2 className="sr-only" id="passwork-key-composition-title">
        Пассворк — доступы под контролем
      </h2>
      <div className="passwork-key-composition__sticky" aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>
    </section>
  );
}
