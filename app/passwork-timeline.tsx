/* eslint-disable @next/next/no-img-element */

'use client';

import { useEffect, useRef } from 'react';

const timelineItems = [
  {
    number: '01',
    title: 'Управление корпоративными доступами',
    label: 'Пассворк',
    icon: '/assets/passwork-symbol.svg',
    threshold: 0.02,
  },
  {
    number: '02',
    title: 'Защищённое хранение паролей',
    label: 'Хранилище',
    icon: '/assets/icon-security-a.svg',
    threshold: 0.16,
  },
  {
    number: '03',
    title: 'Права строго по ролям',
    label: 'Роли и папки',
    icon: '/assets/icon-government.svg',
    threshold: 0.32,
  },
  {
    number: '04',
    title: 'Полный журнал действий',
    label: 'Аудит',
    icon: '/assets/icon-settings-a.svg',
    threshold: 0.51,
  },
  {
    number: '05',
    title: 'Политики и ротация паролей',
    label: 'Политики',
    icon: '/assets/icon-manufacturing-a.svg',
    threshold: 0.7,
  },
  {
    number: '06',
    title: 'Локальное развёртывание',
    label: 'On-premise',
    icon: '/assets/icon-devops.svg',
    threshold: 0.85,
  },
] as const;

const shuffleCharacters = '0123456789!#%&*+-/<=>?[]{}';

type TimelineItem = (typeof timelineItems)[number];

function TimelineCard({ item }: { item: TimelineItem }) {
  return (
    <article
      className="passwork-timeline__card"
      data-timeline-number={item.number}
      data-threshold={item.threshold}
    >
      <div className="passwork-timeline__card-row passwork-timeline__card-row--top">
        <span className="passwork-timeline__number">{item.number}</span>
        <h3 aria-label={item.title}>
          <span
            className="passwork-timeline__card-title"
            data-final-title={item.title}
            aria-hidden="true"
          >
            {item.title}
          </span>
        </h3>
      </div>

      <div className="passwork-timeline__card-visual" aria-hidden="true">
        <div className="passwork-timeline__visual-inner">
          <span className="passwork-timeline__visual-ring" />
          <span className="passwork-timeline__visual-grid" />
          <img src={item.icon} alt="" />
          <span className="passwork-timeline__visual-caption">
            {item.number} / PASSWORK
          </span>
        </div>
      </div>

      <div className="passwork-timeline__card-row passwork-timeline__card-row--bottom">
        <span className="passwork-timeline__connector" aria-hidden="true" />
        <span className="passwork-timeline__product-icon" aria-hidden="true">
          <img src={item.icon} alt="" />
        </span>
        <span className="passwork-timeline__product-name">{item.label}</span>
      </div>
    </article>
  );
}

export default function PassworkTimeline() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const track = root.querySelector<HTMLElement>('.passwork-timeline__track');
    const marker = root.querySelector<HTMLElement>('.passwork-timeline__current');
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(
        '.passwork-timeline__desktop .passwork-timeline__card',
      ),
    );
    if (!track || !marker || cards.length === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 769px)');
    const titleTimers = new Set<number>();
    let animationFrame = 0;
    let settleTimer = 0;
    let previousScrollY = window.scrollY;
    let previousTime = performance.now();

    const restoreTitle = (card: HTMLElement) => {
      const title = card.querySelector<HTMLElement>('[data-final-title]');
      if (!title) return;
      title.textContent = title.dataset.finalTitle ?? '';
    };

    const shuffleTitle = (card: HTMLElement) => {
      if (card.dataset.shuffling === 'true') return;
      const title = card.querySelector<HTMLElement>('[data-final-title]');
      const finalTitle = title?.dataset.finalTitle ?? '';
      if (!title || !finalTitle) return;

      card.dataset.shuffling = 'true';
      const frames = 5;

      for (let frame = 0; frame < frames; frame += 1) {
        const timer = window.setTimeout(() => {
          if (!card.classList.contains('is-open') || reducedMotion.matches) {
            restoreTitle(card);
            card.dataset.shuffling = 'false';
            titleTimers.delete(timer);
            return;
          }

          const revealPoint = Math.floor((finalTitle.length * frame) / frames);
          title.textContent = [...finalTitle]
            .map((character, index) => {
              if (character === ' ' || index <= revealPoint) return character;
              return shuffleCharacters[
                Math.floor(Math.random() * shuffleCharacters.length)
              ];
            })
            .join('');
          titleTimers.delete(timer);
        }, frame * 58);
        titleTimers.add(timer);
      }

      const restoreTimer = window.setTimeout(() => {
        restoreTitle(card);
        card.dataset.shuffling = 'false';
        titleTimers.delete(restoreTimer);
      }, frames * 58 + 40);
      titleTimers.add(restoreTimer);
    };

    const setTrail = (top: number, bottom: number) => {
      marker.style.setProperty('--timeline-trail-top', `${top}%`);
      marker.style.setProperty('--timeline-trail-bottom', `${bottom}%`);
    };

    const setStaticState = () => {
      root.classList.add('is-entered', 'is-static');
      root.style.setProperty('--timeline-progress', '1');
      cards.forEach((card) => {
        card.classList.add('is-open');
        card.dataset.shuffling = 'false';
        restoreTitle(card);
      });
      setTrail(0, 0);
    };

    const update = () => {
      animationFrame = 0;

      if (reducedMotion.matches) {
        setStaticState();
        return;
      }

      root.classList.remove('is-static');
      const viewportHeight = Math.max(window.innerHeight, 1);
      const rootBounds = root.getBoundingClientRect();
      const shouldReveal =
        rootBounds.top <= viewportHeight * 1.08 && rootBounds.bottom > 0;
      root.classList.toggle('is-entered', shouldReveal);

      if (!desktop.matches) {
        root.style.setProperty('--timeline-progress', '0');
        cards.forEach((card) => card.classList.remove('is-open'));
        setTrail(0, 0);
        return;
      }

      const trackBounds = track.getBoundingClientRect();
      const markerHeight = marker.getBoundingClientRect().height;
      const progress = Math.min(
        Math.max(
          (viewportHeight * 0.5 - (trackBounds.top + markerHeight * 0.5)) /
            Math.max(trackBounds.height - markerHeight * 0.5, 1),
          0,
        ),
        1,
      );
      root.style.setProperty('--timeline-progress', progress.toFixed(5));

      cards.forEach((card) => {
        const threshold = Number(card.dataset.threshold ?? 1);
        const shouldOpen = progress >= threshold;
        const wasOpen = card.classList.contains('is-open');
        card.classList.toggle('is-open', shouldOpen);
        if (shouldOpen && !wasOpen) shuffleTitle(card);
        if (!shouldOpen && wasOpen) {
          card.dataset.shuffling = 'false';
          restoreTitle(card);
        }
      });

      const now = performance.now();
      const deltaTime = Math.max(now - previousTime, 16);
      const deltaScroll = window.scrollY - previousScrollY;
      const velocity = (deltaScroll / deltaTime) * 16.667;
      const edgeFactor = Math.min(
        progress / 0.15,
        (1 - progress) / 0.15,
        1,
      );
      const pulse = Math.min(Math.abs(velocity) * 2, 50) * Math.max(edgeFactor, 0);

      if (Math.abs(velocity) > 0.1) {
        setTrail(velocity > 0 ? pulse : 0, velocity < 0 ? pulse : 0);
      }

      previousScrollY = window.scrollY;
      previousTime = now;

      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => setTrail(0, 0), 100);
    };

    const queueUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate, { passive: true });
    reducedMotion.addEventListener('change', queueUpdate);
    desktop.addEventListener('change', queueUpdate);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (settleTimer) window.clearTimeout(settleTimer);
      titleTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('scroll', queueUpdate);
      window.removeEventListener('resize', queueUpdate);
      reducedMotion.removeEventListener('change', queueUpdate);
      desktop.removeEventListener('change', queueUpdate);
    };
  }, []);

  const leftItems = timelineItems.filter((_, index) => index % 2 === 1);
  const rightItems = timelineItems.filter((_, index) => index % 2 === 0);

  return (
    <section
      className="passwork-timeline"
      aria-labelledby="passwork-timeline-title"
      ref={rootRef}
    >
      <div className="passwork-timeline__inner">
        <div className="passwork-timeline__heading">
          <h2 id="passwork-timeline-title">
            <span>Основа корпоративной</span>
            <span>безопасности</span>
          </h2>
        </div>

        <div className="passwork-timeline__desktop">
          <div className="passwork-timeline__track">
            <div className="passwork-timeline__column passwork-timeline__column--left">
              {leftItems.map((item) => (
                <TimelineCard item={item} key={item.number} />
              ))}
            </div>

            <div className="passwork-timeline__progress" aria-hidden="true">
              <span className="passwork-timeline__current">
                <span className="passwork-timeline__current-line" />
                <span className="passwork-timeline__trail passwork-timeline__trail--top" />
                <span className="passwork-timeline__cube" />
                <span className="passwork-timeline__trail passwork-timeline__trail--bottom" />
              </span>
            </div>

            <div className="passwork-timeline__column passwork-timeline__column--right">
              {rightItems.map((item) => (
                <TimelineCard item={item} key={item.number} />
              ))}
            </div>
          </div>
        </div>

        <div className="passwork-timeline__mobile">
          {timelineItems.map((item) => (
            <TimelineCard item={item} key={item.number} />
          ))}
        </div>
      </div>
    </section>
  );
}
