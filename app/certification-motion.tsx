'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import './certification-motion.css';

/** A decorative certificate, animated only while its panel is on screen. */
export default function CertificationMotion() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const card = scene?.closest('article');
    if (!scene || !card) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let visible = false;
    let frame = 0;
    let x = 0;
    let y = 0;

    const resetTilt = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      scene.style.setProperty('--certificate-tilt-x', '0deg');
      scene.style.setProperty('--certificate-tilt-y', '0deg');
    };
    const sync = () => {
      scene.dataset.active = String(visible && !document.hidden && !motion.matches);
      if (visible) scene.dataset.entered = 'true';
      if (motion.matches || !visible || document.hidden) resetTilt();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.2 });
    const move = (event: PointerEvent) => {
      if (motion.matches || !pointer.matches || !visible || document.hidden) return;
      const bounds = card.getBoundingClientRect();
      x = (event.clientX - bounds.left) / bounds.width - 0.5;
      y = (event.clientY - bounds.top) / bounds.height - 0.5;
      if (!frame) frame = requestAnimationFrame(() => {
        scene.style.setProperty('--certificate-tilt-x', `${-y * 5}deg`);
        scene.style.setProperty('--certificate-tilt-y', `${x * 7}deg`);
        frame = 0;
      });
    };

    observer.observe(card);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', resetTilt);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', resetTilt);
    };
  }, []);

  return (
    <div className="certification-motion" ref={sceneRef} aria-hidden="true">
      <div className="certification-motion__light" />
      <div className="certification-motion__scene">
        <div className="certification-motion__back" />
        <div className="certification-motion__document-wrap">
          <div className="certification-motion__document">
            <div className="certification-motion__header">
              <span className="certification-motion__brand">
                <Image src="/assets/passwork-symbol.svg" width={24} height={24} alt="" unoptimized />
                Пассворк
              </span>
              <span className="certification-motion__number">№ 5063</span>
            </div>
            <div className="certification-motion__body">
              <span className="certification-motion__eyebrow">Сертификат соответствия</span>
              <strong className="certification-motion__title">ФСТЭК России</strong>
              <div className="certification-motion__lines"><i /><i /><i /></div>
              <div className="certification-motion__level"><strong>4</strong><span>уровень<br />доверия</span></div>
            </div>
            <div className="certification-motion__scan" />
          </div>
        </div>
        <div className="certification-motion__medal-wrap">
          <Image
            className="certification-motion__medal"
            src="/assets/fstec-motion/verification-medal.png"
            alt=""
            width={1254}
            height={1254}
            sizes="(max-width: 767px) 140px, 190px"
            unoptimized
          />
        </div>
        <div className="certification-motion__confirmation">
          <Image src="/assets/check-circle-blue.svg" width={22} height={22} alt="" unoptimized />
          <span>Соответствие подтверждено</span>
        </div>
      </div>
    </div>
  );
}
