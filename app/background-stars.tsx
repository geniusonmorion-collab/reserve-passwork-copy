'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { STAR_CELL, STAR_SPRITE_SIZE, starHash, starField, starBrightness, starGlyph } from './background-star-field';
import { subscribeToTheme } from './theme-preference';

type Star = { x: number; y: number; column: number; row: number; seed: number };

/** The reference's sparse, drifting star field, behind the host interface. */
export default function BackgroundStars({ occlusionRef, occlusionSelector = '.pw-glass', className = 'pw-hero__stars', active = true, starSize = STAR_SPRITE_SIZE }: {
  occlusionRef?: RefObject<HTMLDivElement | null>;
  occlusionSelector?: string;
  className?: string;
  active?: boolean;
  starSize?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sprite = document.createElement('canvas');
    const brush = sprite.getContext('2d');
    if (!brush) return;

    let width = 0;
    let height = 0;
    let scale = 1;
    let frame = 0;
    let lastPaint = 0;
    let visible = false;
    let disposed = false;
    let geometryDirty = true;
    let stars: Star[] = [];
    const started = performance.now();

    function measure() {
      geometryDirty = false;
      // Use layout dimensions: sticky cards scale the whole illustration during
      // scrolling, and that transform must not resize or shift the star grid.
      const nextWidth = canvas!.clientWidth;
      const nextHeight = canvas!.clientHeight;
      const nextScale = Math.min(window.devicePixelRatio || 1, 2);
      if (width === nextWidth && height === nextHeight && scale === nextScale) return;
      width = nextWidth;
      height = nextHeight;
      scale = nextScale;
      canvas!.width = Math.max(1, Math.round(width * scale));
      canvas!.height = Math.max(1, Math.round(height * scale));
      context!.setTransform(scale, 0, 0, scale, 0, 0);

      rasterizeSprite();

      stars = [];
      const cell = STAR_CELL;
      for (let row = 0; row * cell < height; row++) {
        for (let column = 0; column * cell < width; column++) {
          const seed = starHash(column * 1.37 + 5.1, row * 1.37 + 2.3);
          const x = (column + 0.5) * cell;
          // GLSL's fragment grid starts at the bottom of the canvas.
          const y = height - (row + 0.5) * cell;
          stars.push({ x, y, column, row, seed });
        }
      }
    }

    function rasterizeSprite() {
      // Recolour the same glyph, without restarting the field's clock or positions.
      const token = getComputedStyle(canvas!).getPropertyValue('--star-rgb').trim();
      const parsed = token.split(/\s+/).map(Number);
      const rgb = parsed.length === 3 && parsed.every(value => Number.isFinite(value) && value >= 0 && value <= 255)
        ? parsed : [199, 224, 255];
      sprite.width = Math.ceil(starSize * scale);
      sprite.height = sprite.width;
      const pixels = brush!.createImageData(sprite.width, sprite.height);
      for (let y = 0; y < sprite.height; y++) {
        for (let x = 0; x < sprite.width; x++) {
          const alpha = starGlyph(
            ((x + 0.5) / sprite.width - 0.5) * STAR_SPRITE_SIZE / STAR_CELL,
            ((y + 0.5) / sprite.height - 0.5) * STAR_SPRITE_SIZE / STAR_CELL,
          );
          const i = (y * sprite.width + x) * 4;
          pixels.data[i] = rgb[0];
          pixels.data[i + 1] = rgb[1];
          pixels.data[i + 2] = rgb[2];
          pixels.data[i + 3] = Math.round(alpha * 255);
        }
      }
      brush!.putImageData(pixels, 0, 0);
    }

    function paint(time: number) {
      if (geometryDirty) measure();
      context!.clearRect(0, 0, width, height);
      const clock = reduced.matches ? 0 : (time - started) / 1000;
      // Keep the reference's broad two-sided composition while its light bands
      // gently drift; cell shimmer continues independently at the original rate.
      const fieldTime = 12 + Math.sin(clock * 0.18) * 0.75;
      const canvasBounds = canvas!.getBoundingClientRect();
      const localX = canvasBounds.width ? width / canvasBounds.width : 1;
      const localY = canvasBounds.height ? height / canvasBounds.height : 1;
      const panelElement = occlusionRef?.current?.querySelector<HTMLElement>(occlusionSelector);
      const panelBounds = panelElement?.getBoundingClientRect();
      const panel = panelBounds ? {
        x: (panelBounds.left - canvasBounds.left) * localX,
        y: (panelBounds.top - canvasBounds.top) * localY,
        width: panelBounds.width * localX,
        height: panelBounds.height * localY,
        radius: parseFloat(getComputedStyle(panelElement!).borderTopLeftRadius) || 0,
      } : null;

      for (const star of stars) {
        // Skip only glyphs wholly inside the panel's safe interior. The exact
        // mask below still handles rounded corners and partially covered stars.
        const inset = (panel?.radius ?? 0) + starSize / 2;
        if (panel && star.x > panel.x + inset && star.x < panel.x + panel.width - inset
          && star.y > panel.y + inset && star.y < panel.y + panel.height - inset) continue;
        // Use the reference's full-width coordinates. Its moving light creates
        // the sparse areas naturally, without mirrored strips or a centre cutout.
        const field = starField(star.x / width, star.y / height, fieldTime, width / 900);
        const alpha = starBrightness(field, star.seed, star.column, star.row, clock);
        if (alpha < 0.005) continue;
        context!.globalAlpha = alpha;
        context!.drawImage(sprite, star.x - starSize / 2, star.y - starSize / 2, starSize, starSize);
      }
      context!.globalAlpha = 1;

      // Occlude pixels only beneath the actual glass surface. No exterior fade
      // or center-based glyph culling: stars reach the edge without an empty band.
      if (panel) {
        context!.save();
        context!.globalCompositeOperation = 'destination-out';
        context!.fillStyle = '#000';
        context!.beginPath();
        context!.roundRect(panel.x, panel.y, panel.width, panel.height, panel.radius);
        context!.fill();
        context!.restore();
      }
    }

    function tick(time: number) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      if (time - lastPaint >= 1000 / 30 || geometryDirty) {
        paint(time);
        lastPaint = time;
      }
      if (!reduced.matches) frame = requestAnimationFrame(tick);
    }

    function wake() {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !document.hidden) {
        paint(performance.now());
        if (!reduced.matches) frame = requestAnimationFrame(tick);
      }
    }

    const onLayout = () => { geometryDirty = true; wake(); };
    const unsubscribeTheme = subscribeToTheme(() => { rasterizeSprite(); wake(); });
    const resizeObserver = new ResizeObserver(onLayout);
    resizeObserver.observe(canvas);
    if (occlusionRef?.current) resizeObserver.observe(occlusionRef.current);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      geometryDirty = true;
      wake();
    });
    intersectionObserver.observe(canvas);
    window.addEventListener('resize', onLayout);
    document.addEventListener('visibilitychange', wake);
    reduced.addEventListener('change', wake);
    document.fonts.ready.then(() => { if (!disposed) onLayout(); });

    return () => {
      disposed = true;
      unsubscribeTheme();
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('resize', onLayout);
      document.removeEventListener('visibilitychange', wake);
      reduced.removeEventListener('change', wake);
    };
  }, [occlusionRef, occlusionSelector, active, starSize]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
