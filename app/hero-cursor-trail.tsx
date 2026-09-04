'use client';

import { useEffect, useRef } from 'react';

const CELL_WIDTH = 10;
const CELL_HEIGHT = 13;
const FONT_SIZE = 9;
const FRAME_INTERVAL = 1000 / 30;
const CHARSET = ['○', '>', '_', ' '] as const;

const HOVER_RADIUS = 28;
const FORCE_SCALE = 0.5;
const DENSITY_STRENGTH = 0.9;
const DIFFUSION = 1.5;
const DIFFUSION_ITERATIONS = 5;
const PRESSURE_ITERATIONS = 10;
const DENSITY_DISSIPATION = 0.1;
const VELOCITY_DISSIPATION = 0.1;
const ACTIVE_FLOOR = 0.008;

type PointerSample = {
  x: number;
  y: number;
  time: number;
};

type SafeArea = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type HeroCursorTrailProps = {
  variant?: 'hero' | 'stage' | 'closing';
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function glyphForDensity(density: number) {
  const contrasted = clamp((density - 0.5) * 2 + 0.5, 0, 1);
  const glyphIndex = Math.min(
    CHARSET.length - 1,
    Math.floor((1 - Math.sqrt(contrasted)) * CHARSET.length),
  );

  return CHARSET[glyphIndex];
}

export default function HeroCursorTrail({
  variant = 'hero',
}: HeroCursorTrailProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const pointerRoot = wrapper.parentElement ?? wrapper;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const noHover = window.matchMedia('(any-hover: none)');
    const mobile = window.matchMedia('(max-width: 720px)');

    let animationFrame = 0;
    let lastFrame = 0;
    let lastPointer: PointerSample | null = null;
    let pendingPointer: PointerSample | null = null;
    let cachedBounds: DOMRect | null = null;
    let safeAreas: SafeArea[] = [];
    let cssWidth = 0;
    let cssHeight = 0;
    let deviceScale = 1;
    let columns = 0;
    let rows = 0;
    let density = new Float32Array(0);
    let densityNext = new Float32Array(0);
    let densitySource = new Float32Array(0);
    let velocityX = new Float32Array(0);
    let velocityY = new Float32Array(0);
    let velocityXNext = new Float32Array(0);
    let velocityYNext = new Float32Array(0);
    let velocityXSource = new Float32Array(0);
    let velocityYSource = new Float32Array(0);
    let divergence = new Float32Array(0);
    let pressure = new Float32Array(0);
    let pressureNext = new Float32Array(0);
    let inView = true;
    let disposed = false;

    const isEnabled = () =>
      !disposed &&
      inView &&
      !document.hidden &&
      !reducedMotion.matches &&
      !noHover.matches &&
      !mobile.matches;

    const clearCanvas = () => {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    };

    const clearSimulation = () => {
      density.fill(0);
      densityNext.fill(0);
      densitySource.fill(0);
      velocityX.fill(0);
      velocityY.fill(0);
      velocityXNext.fill(0);
      velocityYNext.fill(0);
      velocityXSource.fill(0);
      velocityYSource.fill(0);
      divergence.fill(0);
      pressure.fill(0);
      pressureNext.fill(0);
      lastPointer = null;
      pendingPointer = null;
      lastFrame = 0;
      clearCanvas();
    };

    const allocateSimulation = (size: number) => {
      density = new Float32Array(size);
      densityNext = new Float32Array(size);
      densitySource = new Float32Array(size);
      velocityX = new Float32Array(size);
      velocityY = new Float32Array(size);
      velocityXNext = new Float32Array(size);
      velocityYNext = new Float32Array(size);
      velocityXSource = new Float32Array(size);
      velocityYSource = new Float32Array(size);
      divergence = new Float32Array(size);
      pressure = new Float32Array(size);
      pressureNext = new Float32Array(size);
    };

    const resize = () => {
      cachedBounds = wrapper.getBoundingClientRect();
      const bounds = cachedBounds;
      if (!bounds.width || !bounds.height) return;

      const safeAreaRoot =
        variant === 'hero' ? document : wrapper.parentElement;
      const safeAreaSelector =
        variant === 'stage'
          ? '.terminal-demo'
          : variant === 'closing'
            ? '.closing-section__copy h2, .closing-section__copy p, .closing-button'
            : '.brand, .site-nav, .header-cta, .hero-copy h1, .hero-copy p, .hero-actions, .dashboard';

      safeAreas = Array.from(
        safeAreaRoot?.querySelectorAll(safeAreaSelector) ?? [],
      ).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left - bounds.left,
          right: rect.right - bounds.left,
          top: rect.top - bounds.top,
          bottom: rect.bottom - bounds.top,
        };
      });

      cssWidth = bounds.width;
      cssHeight = bounds.height;
      const desiredScale = Math.min(window.devicePixelRatio || 1, 2);
      const pixelBudgetScale = Math.sqrt(
        12_000_000 / (cssWidth * cssHeight),
      );
      deviceScale = Math.max(
        0.75,
        Math.min(desiredScale, pixelBudgetScale),
      );

      const nextWidth = Math.max(1, Math.round(cssWidth * deviceScale));
      const nextHeight = Math.max(1, Math.round(cssHeight * deviceScale));
      const nextColumns = Math.ceil(cssWidth / CELL_WIDTH) + 1;
      const nextRows = Math.ceil(cssHeight / CELL_HEIGHT) + 1;

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      if (columns !== nextColumns || rows !== nextRows) {
        columns = nextColumns;
        rows = nextRows;
        allocateSimulation(columns * rows);
      }

      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    };

    const verticalOpacity = (y: number) => {
      if (variant !== 'hero') return 1;
      if (y <= 480) return 1;
      return clamp((1200 - y) / 720, 0, 1);
    };

    const safeAreaOpacity = (x: number, y: number) => {
      let opacity = 1;

      for (const area of safeAreas) {
        const horizontalDistance = Math.max(
          area.left - x,
          0,
          x - area.right,
        );
        const verticalDistance = Math.max(area.top - y, 0, y - area.bottom);
        const distance = Math.hypot(horizontalDistance, verticalDistance);
        opacity = Math.min(
          opacity,
          clamp(distance / (variant === 'stage' ? 32 : 60), 0, 1),
        );
        if (opacity === 0) break;
      }

      return opacity;
    };

    const sample = (field: Float32Array, x: number, y: number) => {
      const left = clamp(Math.floor(x), 0, columns - 1);
      const top = clamp(Math.floor(y), 0, rows - 1);
      const right = Math.min(columns - 1, left + 1);
      const bottom = Math.min(rows - 1, top + 1);
      const horizontalMix = clamp(x - left, 0, 1);
      const verticalMix = clamp(y - top, 0, 1);
      const topValue =
        field[top * columns + left] * (1 - horizontalMix) +
        field[top * columns + right] * horizontalMix;
      const bottomValue =
        field[bottom * columns + left] * (1 - horizontalMix) +
        field[bottom * columns + right] * horizontalMix;

      return topValue * (1 - verticalMix) + bottomValue * verticalMix;
    };

    const diffuseField = (
      field: Float32Array,
      source: Float32Array,
      deltaSeconds: number,
    ) => {
      source.set(field);
      // The reference simulation runs on a much denser fluid texture than the
      // glyph grid. Scale diffusion to preserve the same visual spread here.
      const amount = DIFFUSION * deltaSeconds * 0.15;
      const divisor = 1 + amount * 4;

      for (let iteration = 0; iteration < DIFFUSION_ITERATIONS; iteration += 1) {
        for (let row = 1; row < rows - 1; row += 1) {
          for (let column = 1; column < columns - 1; column += 1) {
            const index = row * columns + column;
            field[index] =
              (source[index] +
                amount *
                  (field[index - 1] +
                    field[index + 1] +
                    field[index - columns] +
                    field[index + columns])) /
              divisor;
          }
        }
      }
    };

    const projectVelocity = () => {
      divergence.fill(0);
      pressure.fill(0);
      pressureNext.fill(0);

      for (let row = 1; row < rows - 1; row += 1) {
        for (let column = 1; column < columns - 1; column += 1) {
          const index = row * columns + column;
          divergence[index] =
            -0.5 *
            (velocityX[index + 1] -
              velocityX[index - 1] +
              velocityY[index + columns] -
              velocityY[index - columns]);
        }
      }

      for (let iteration = 0; iteration < PRESSURE_ITERATIONS; iteration += 1) {
        for (let row = 1; row < rows - 1; row += 1) {
          for (let column = 1; column < columns - 1; column += 1) {
            const index = row * columns + column;
            pressureNext[index] =
              (divergence[index] +
                pressure[index - 1] +
                pressure[index + 1] +
                pressure[index - columns] +
                pressure[index + columns]) /
              4;
          }
        }

        const swap = pressure;
        pressure = pressureNext;
        pressureNext = swap;
        pressureNext.fill(0);
      }

      for (let row = 1; row < rows - 1; row += 1) {
        for (let column = 1; column < columns - 1; column += 1) {
          const index = row * columns + column;
          velocityX[index] -=
            0.5 * (pressure[index + 1] - pressure[index - 1]);
          velocityY[index] -=
            0.5 * (pressure[index + columns] - pressure[index - columns]);
        }
      }
    };

    const advectVelocity = (deltaSeconds: number) => {
      const dissipation = Math.exp(-VELOCITY_DISSIPATION * deltaSeconds);

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const sourceX = column - velocityX[index] * deltaSeconds;
          const sourceY = row - velocityY[index] * deltaSeconds;
          velocityXNext[index] =
            sample(velocityX, sourceX, sourceY) * dissipation;
          velocityYNext[index] =
            sample(velocityY, sourceX, sourceY) * dissipation;
        }
      }

      let swap = velocityX;
      velocityX = velocityXNext;
      velocityXNext = swap;
      swap = velocityY;
      velocityY = velocityYNext;
      velocityYNext = swap;
    };

    const advectDensity = (deltaSeconds: number) => {
      const dissipation = Math.exp(-DENSITY_DISSIPATION * deltaSeconds);

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const sourceX = column - velocityX[index] * deltaSeconds;
          const sourceY = row - velocityY[index] * deltaSeconds;
          densityNext[index] =
            sample(density, sourceX, sourceY) * dissipation;
        }
      }

      const swap = density;
      density = densityNext;
      densityNext = swap;
    };

    const stepSimulation = (deltaSeconds: number) => {
      diffuseField(velocityX, velocityXSource, deltaSeconds);
      diffuseField(velocityY, velocityYSource, deltaSeconds);
      projectVelocity();
      advectVelocity(deltaSeconds);
      projectVelocity();
      diffuseField(density, densitySource, deltaSeconds);
      advectDensity(deltaSeconds);
    };

    const splat = (
      x: number,
      y: number,
      forceX: number,
      forceY: number,
    ) => {
      const minimumColumn = Math.max(
        0,
        Math.floor((x - HOVER_RADIUS) / CELL_WIDTH),
      );
      const maximumColumn = Math.min(
        columns - 1,
        Math.ceil((x + HOVER_RADIUS) / CELL_WIDTH),
      );
      const minimumRow = Math.max(
        0,
        Math.floor((y - HOVER_RADIUS) / CELL_HEIGHT),
      );
      const maximumRow = Math.min(
        rows - 1,
        Math.ceil((y + HOVER_RADIUS) / CELL_HEIGHT),
      );
      const radiusSquared = HOVER_RADIUS * HOVER_RADIUS;
      const sigmaSquared = Math.pow(HOVER_RADIUS * 0.45, 2);

      for (let row = minimumRow; row <= maximumRow; row += 1) {
        const cellY = (row + 0.5) * CELL_HEIGHT;

        for (let column = minimumColumn; column <= maximumColumn; column += 1) {
          const cellX = (column + 0.5) * CELL_WIDTH;
          const deltaX = cellX - x;
          const deltaY = cellY - y;
          const distanceSquared = deltaX * deltaX + deltaY * deltaY;
          if (distanceSquared > radiusSquared) continue;

          const influence = Math.exp(
            -distanceSquared / (2 * sigmaSquared),
          );
          const index = row * columns + column;
          density[index] = Math.min(
            1,
            density[index] + DENSITY_STRENGTH * influence,
          );
          velocityX[index] = clamp(
            velocityX[index] + forceX * influence,
            -80,
            80,
          );
          velocityY[index] = clamp(
            velocityY[index] + forceY * influence,
            -80,
            80,
          );
        }
      }
    };

    const schedule = () => {
      if (animationFrame || !isEnabled()) return;
      animationFrame = requestAnimationFrame(draw);
    };

    const processPendingPointer = () => {
      const pointer = pendingPointer;
      pendingPointer = null;
      if (!pointer) return;

      if (!lastPointer || pointer.time - lastPointer.time > 160) {
        splat(pointer.x, pointer.y, 0, 0);
        lastPointer = pointer;
        return;
      }

      const deltaX = pointer.x - lastPointer.x;
      const deltaY = pointer.y - lastPointer.y;
      const elapsedSeconds = Math.max(
        (pointer.time - lastPointer.time) / 1000,
        1 / 120,
      );

      if (Math.hypot(deltaX, deltaY) < 0.75) {
        lastPointer = pointer;
        return;
      }

      splat(
        pointer.x,
        pointer.y,
        (deltaX / CELL_WIDTH / elapsedSeconds) * FORCE_SCALE,
        (deltaY / CELL_HEIGHT / elapsedSeconds) * FORCE_SCALE,
      );
      lastPointer = pointer;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      if (!isEnabled()) return;

      const bounds = wrapper.getBoundingClientRect();
      cachedBounds = bounds;
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) {
        lastPointer = null;
        pendingPointer = null;
        return;
      }

      pendingPointer = { x, y, time: performance.now() };
      schedule();
    };

    const handlePointerLeave = () => {
      lastPointer = null;
      pendingPointer = null;
    };

    const render = () => {
      clearCanvas();
      context.save();
      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = '#fff';
      context.font = `400 ${FONT_SIZE}px "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", ui-monospace, monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.shadowBlur = 0;

      let maximumDensity = 0;
      let maximumVelocity = 0;

      for (let row = 0; row < rows; row += 1) {
        const y = (row + 0.5) * CELL_HEIGHT;

        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const cellDensity = density[index];
          maximumDensity = Math.max(maximumDensity, cellDensity);
          maximumVelocity = Math.max(
            maximumVelocity,
            Math.abs(velocityX[index]),
            Math.abs(velocityY[index]),
          );

          const glyph = glyphForDensity(cellDensity);
          if (glyph === ' ') continue;

          const x = (column + 0.5) * CELL_WIDTH;
          const opacity = 0.8 * verticalOpacity(y) * safeAreaOpacity(x, y);
          if (opacity <= 0.01) continue;

          context.globalAlpha = opacity;
          context.fillText(glyph, x, y);
        }
      }

      context.restore();
      return maximumDensity > ACTIVE_FLOOR || maximumVelocity > ACTIVE_FLOOR;
    };

    function draw(now: number) {
      animationFrame = 0;
      if (!isEnabled()) return;

      if (lastFrame && now - lastFrame < FRAME_INTERVAL - 1) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      const deltaMilliseconds = lastFrame
        ? Math.min(now - lastFrame, 66)
        : FRAME_INTERVAL;
      lastFrame = now;
      processPendingPointer();
      stepSimulation(deltaMilliseconds / 1000);
      const isActive = render();

      if (isActive || pendingPointer) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        lastFrame = 0;
      }
    }

    const handleVisibility = () => {
      if (!document.hidden) return;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      clearSimulation();
    };

    const handlePreferenceChange = () => {
      clearSimulation();
      resize();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      clearSimulation();
    });
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        if (!inView) clearSimulation();
      },
      { rootMargin: '100px 0px' },
    );

    resize();
    resizeObserver.observe(wrapper);
    intersectionObserver.observe(wrapper);
    pointerRoot.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    pointerRoot.addEventListener('pointerleave', handlePointerLeave, {
      passive: true,
    });
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', handlePreferenceChange);
    noHover.addEventListener('change', handlePreferenceChange);
    mobile.addEventListener('change', handlePreferenceChange);

    return () => {
      disposed = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      pointerRoot.removeEventListener('pointermove', handlePointerMove);
      pointerRoot.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener('change', handlePreferenceChange);
      noHover.removeEventListener('change', handlePreferenceChange);
      mobile.removeEventListener('change', handlePreferenceChange);
      clearCanvas();
    };
  }, [variant]);

  return (
    <div
      ref={wrapperRef}
      className={`hero-cursor-trail hero-cursor-trail--${variant}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="hero-cursor-trail__canvas" />
    </div>
  );
}
