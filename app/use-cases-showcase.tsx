/* eslint-disable @next/next/no-img-element */

'use client';

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import SolutionCta from './solution-cta';

const useCases = [
  {
    key: 'mts-bank',
    cover: '/assets/use-cases/mts-bank.png',
    coverAlt: 'МТС Банк',
    title: 'Безопасность паролей в масштабе банка',
  },
  {
    key: 'vkusvill',
    cover: '/assets/use-cases/vkusvill.png',
    coverAlt: 'ВкусВилл',
    title: 'Безопасная работа с секретами',
  },
  {
    key: 'nexign',
    cover: '/assets/use-cases/nexign.png',
    coverAlt: 'Nexign',
    title: 'Импортозамещение без потери удобства',
  },
  {
    key: 'cherkizovo',
    cover: '/assets/use-cases/cherkizovo.png',
    coverAlt: 'Черкизово',
    title: 'Контроль доступа в распределённой системе',
  },
] as const;

const useCaseCta = 'Читать кейс';

export default function UseCasesShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return;

    const updateProgress = () => {
      frameRef.current = 0;
      const trackWidth = viewport.scrollWidth;
      const progress = trackWidth
        ? (viewport.scrollLeft + viewport.clientWidth) / trackWidth
        : 1;

      section.style.setProperty(
        '--use-cases-progress',
        Math.min(1, Math.max(0, progress)).toFixed(5),
      );
    };

    const queueProgressUpdate = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(updateProgress);
    };

    const resizeObserver = new ResizeObserver(queueProgressUpdate);
    resizeObserver.observe(viewport);
    viewport.addEventListener('scroll', queueProgressUpdate, { passive: true });
    updateProgress();

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', queueProgressUpdate);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    drag.active = false;
    event.currentTarget.classList.remove('is-dragging');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if ((event.target as HTMLElement).closest('a')) return;

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('is-dragging');
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.currentTarget.scrollLeft =
      drag.startScrollLeft - (event.clientX - drag.startX);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const viewport = event.currentTarget;
    const card = viewport.querySelector<HTMLElement>('.use-cases-showcase__card');
    if (!card) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    viewport.scrollBy({
      left: (card.offsetWidth + 12) * (event.key === 'ArrowRight' ? 1 : -1),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      id="use-cases"
      className="use-cases-showcase"
      aria-labelledby="use-cases-showcase-title"
    >
      <div className="use-cases-showcase__inner">
        <span className="use-cases-showcase__label">
          КЕЙСЫ
        </span>

        <div className="use-cases-showcase__heading-rule" aria-hidden="true" />

        <div className="use-cases-showcase__text-container">
          <h2
            className="use-cases-showcase__title"
            id="use-cases-showcase-title"
          >
            <span>Все доступы компании —</span>
            <span>в одном защищённом контуре</span>
          </h2>
        </div>

        <div className="use-cases-showcase__spacer" aria-hidden="true" />

        <div className="use-cases-showcase__progress" aria-hidden="true">
          <span />
        </div>

        <p className="sr-only" id="use-cases-carousel-instructions">
          Горизонтальная лента из четырёх карточек. Используйте стрелки влево и
          вправо, прокрутку трекпада или перетаскивание.
        </p>

        <div
          ref={viewportRef}
          className="use-cases-showcase__viewport"
          role="region"
          aria-label="Сценарии использования Пассворка"
          aria-describedby="use-cases-carousel-instructions"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onPointerLeave={finishDrag}
        >
          <div className="use-cases-showcase__track">
            {useCases.map((useCase, index) => (
              <article
                className="use-cases-showcase__card"
                aria-labelledby={`use-case-${useCase.key}-title`}
                key={useCase.key}
              >
                <div className="use-cases-showcase__visual">
                  <img
                    src={useCase.cover}
                    alt={useCase.coverAlt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>

                <div className="use-cases-showcase__card-content">
                  <span className="sr-only">
                    Карточка {index + 1} из {useCases.length}.{' '}
                  </span>
                  <h3 id={`use-case-${useCase.key}-title`}>{useCase.title}</h3>
                  <a
                    className="use-cases-showcase__cta solution-cta-trigger"
                    href="#demo"
                  >
                    <SolutionCta label={useCaseCta} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
