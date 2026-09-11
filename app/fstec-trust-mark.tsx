'use client';

import { useEffect, useRef } from 'react';
import './fstec-trust-mark.css';

type Dot = { x: number; y: number; radius: number; opacity: number };

const CLOUD_WIDTH = 535;
const CLOUD_HEIGHT = 554.936;
const FIELD_RADIUS = 94;
const MAX_SHIFT = 5.5;

function attachDotField(root: HTMLElement, card: HTMLElement, canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  const allowed = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  if (!context) return;

  const controller = new AbortController();
  let dots: Dot[] = [];
  let frame = 0;
  let active = false;
  let field = 0;
  let currentX = CLOUD_WIDTH / 2;
  let currentY = CLOUD_HEIGHT / 2;
  let targetX = currentX;
  let targetY = currentY;

  function paint() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(
      canvas.width / CLOUD_WIDTH, 0, 0, canvas.height / CLOUD_HEIGHT, 0, 0,
    );

    for (const dot of dots) {
      const dx = currentX - dot.x;
      const dy = currentY - dot.y;
      const distance = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distance / FIELD_RADIUS);
      const influence = proximity * proximity * (3 - 2 * proximity) * field;
      const directionX = distance > .01 ? dx / distance : 0;
      const directionY = distance > .01 ? dy / distance : 0;
      const x = dot.x + directionX * influence * MAX_SHIFT;
      const y = dot.y + directionY * influence * MAX_SHIFT;
      const radius = dot.radius * (1 + influence * .18);
      const opacity = Math.min(1, dot.opacity * .82 + influence * .3);

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      context.fill();
    }
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * pixelRatio));
    const height = Math.max(1, Math.round(bounds.height * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    paint();
  }

  function animate() {
    currentX += (targetX - currentX) * .16;
    currentY += (targetY - currentY) * .16;
    field += ((active ? 1 : 0) - field) * (active ? .14 : .1);
    paint();

    const moving = Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .08;
    const changing = active ? field < .998 : field > .002;
    if (moving || changing) {
      frame = requestAnimationFrame(animate);
    } else {
      field = active ? 1 : 0;
      paint();
      frame = 0;
    }
  }

  function start() {
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function move(event: PointerEvent) {
    const bounds = canvas.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width * CLOUD_WIDTH;
    targetY = (event.clientY - bounds.top) / bounds.height * CLOUD_HEIGHT;
    if (!active) {
      active = true;
      currentX = targetX;
      currentY = targetY;
    }
    start();
  }

  function leave() {
    active = false;
    start();
  }

  function bind() {
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
  }

  function unbind() {
    card.removeEventListener('pointermove', move);
    card.removeEventListener('pointerleave', leave);
    card.removeEventListener('pointercancel', leave);
    active = false;
  }

  const sync = () => {
    unbind();
    if (allowed.matches && dots.length) bind();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  allowed.addEventListener('change', sync);

  fetch('/assets/figma-54-206-dot-cloud.svg', { signal: controller.signal })
    .then((response) => response.text())
    .then((source) => {
      const document = new DOMParser().parseFromString(source, 'image/svg+xml');
      dots = Array.from(document.querySelectorAll('circle')).map((circle) => ({
        x: Number(circle.getAttribute('cx')),
        y: Number(circle.getAttribute('cy')),
        radius: Number(circle.getAttribute('r')),
        opacity: Number(circle.getAttribute('fill-opacity') ?? 1),
      }));
      root.dataset.ready = 'true';
      resize();
      sync();
    })
    .catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Unable to load FSTEC dot field', error);
      }
    });

  return () => {
    controller.abort();
    observer.disconnect();
    allowed.removeEventListener('change', sync);
    unbind();
    if (frame) cancelAnimationFrame(frame);
  };
}

export default function FstecTrustMark() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const card = root?.closest<HTMLElement>('.figma-security-card');
    if (root && card && canvas) return attachDotField(root, card, canvas);
  }, []);

  return (
    <div ref={rootRef} className="ftm" aria-hidden="true">
      <div className="ftm__cloud">
        <div className="ftm__cloud-fallback" />
        <canvas ref={canvasRef} className="ftm__cloud-canvas" />
      </div>

      <div className="ftm__certificate">
        <strong>4 уровень доверия</strong>
        <div className="ftm__certificate-meta">
          <span>Сертификат № 5063</span>
          <i />
        </div>
      </div>
    </div>
  );
}
