'use client';

import { useEffect, useRef } from 'react';
import './fstec-trust-mark.css';

function attachDotLight(root: HTMLElement, card: HTMLElement) {
  const cloud = root.querySelector<HTMLElement>('.ftm__cloud');
  const allowed = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  if (!cloud) return;

  let frame = 0;
  let active = false;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  function draw() {
    currentX += (targetX - currentX) * .18;
    currentY += (targetY - currentY) * .18;
    root.style.setProperty('--ftm-x', `${currentX}px`);
    root.style.setProperty('--ftm-y', `${currentY}px`);

    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .2) {
      frame = requestAnimationFrame(draw);
    } else {
      frame = 0;
    }
  }

  function move(event: PointerEvent) {
    const bounds = cloud.getBoundingClientRect();
    targetX = event.clientX - bounds.left;
    targetY = event.clientY - bounds.top;

    if (!active) {
      active = true;
      currentX = targetX;
      currentY = targetY;
      root.dataset.active = 'true';
      root.style.setProperty('--ftm-x', `${currentX}px`);
      root.style.setProperty('--ftm-y', `${currentY}px`);
    }

    if (!frame) frame = requestAnimationFrame(draw);
  }

  function leave() {
    active = false;
    delete root.dataset.active;
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
    leave();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  const sync = () => {
    unbind();
    if (allowed.matches) bind();
  };

  allowed.addEventListener('change', sync);
  if (allowed.matches) bind();

  return () => {
    allowed.removeEventListener('change', sync);
    unbind();
  };
}

export default function FstecTrustMark() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const card = root?.closest<HTMLElement>('.figma-security-card');
    if (root && card) return attachDotLight(root, card);
  }, []);

  return (
    <div ref={rootRef} className="ftm" aria-hidden="true">
      <div className="ftm__cloud">
        <div className="ftm__cloud-base" />
        <div className="ftm__cloud-light" />
        <div className="ftm__cloud-wave" />
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
