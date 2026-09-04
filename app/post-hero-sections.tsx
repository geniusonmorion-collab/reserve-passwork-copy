/* eslint-disable @next/next/no-img-element */

'use client';

import { useEffect, useRef } from 'react';

const clientLogos = [
  {
    name: 'ВкусВилл',
    src: '/assets/client-logos/vkusvill.png',
    className: 'is-vkusvill',
  },
  {
    name: 'Открытая мобильная платформа',
    src: '/assets/client-logos/open-mobile-platform.svg',
    className: 'is-open-mobile-platform',
  },
  {
    name: 'ПИК',
    src: '/assets/client-logos/pik.svg',
    className: 'is-pik',
  },
  {
    name: 'Группа Черкизово',
    src: '/assets/client-logos/cherkizovo.svg',
    className: 'is-cherkizovo',
  },
  {
    name: 'ВТБ',
    src: '/assets/client-logos/vtb.svg',
    className: 'is-vtb',
  },
  {
    name: 'Иви',
    src: '/assets/client-logos/ivi.svg',
    className: 'is-ivi',
  },
  {
    name: 'Okko',
    src: '/assets/client-logos/okko.png',
    className: 'is-okko',
  },
  {
    name: 'Департамент информационных технологий города Москвы',
    src: '/assets/client-logos/dit-moscow.svg',
    className: 'is-dit-moscow',
  },
  {
    name: 'HeadHunter',
    src: '/assets/client-logos/hh.png',
    className: 'is-hh',
  },
  {
    name: 'СберЗдоровье',
    src: '/assets/client-logos/sber-health.png',
    className: 'is-sber-health',
  },
] as const;

const passworkFeatures = [
  {
    title: 'В реестре отечественного ПО',
    icon: '/assets/icon-government.svg',
  },
  {
    title: '4-й уровень доверия ФСТЭК',
    icon: '/assets/icon-security-a.svg',
  },
  {
    title: '100% контроль данных',
    icon: '/assets/icon-settings-a.svg',
  },
  {
    title: 'ГОСТ-шифрование',
    icon: '/assets/icon-manufacturing-a.svg',
  },
  {
    title: 'Локальное развёртывание',
    icon: '/assets/icon-devops.svg',
  },
] as const;

const scrambleCharacters = '0123456789!#%&*+-/<=>?[]{}';
const scramblePalettes = [
  { color: '#fff', background: '#298dff' },
  { color: '#000103', background: '#abb2b9' },
  { color: '#fefefe', background: '#000' },
] as const;

function FeatureTitle({ title }: { title: string }) {
  return (
    <h3 className="passwork-is__feature-title" aria-label={title}>
      <span className="passwork-is__feature-characters" aria-hidden="true">
        {[...title].map((character, index) => {
          const renderedCharacter = character === ' ' ? '\u00a0' : character;

          return (
            <span
              className="passwork-is__feature-character"
              data-final-character={renderedCharacter}
              key={`${character}-${index}`}
            >
              <span className="passwork-is__feature-character-base">
                {renderedCharacter}
              </span>
              <span className="passwork-is__feature-character-glyph">
                {renderedCharacter}
              </span>
            </span>
          );
        })}
      </span>
    </h3>
  );
}

export default function PostHeroSections({
  transitionOnly = false,
}: {
  transitionOnly?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transitionOnly) return;

    const root = rootRef.current;
    if (!root) return;

    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>('[data-post-hero-reveal]'),
    );
    const featureRows = Array.from(
      root.querySelectorAll<HTMLElement>('.passwork-is__feature-row'),
    );
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timers = new Set<number>();
    let observer: IntersectionObserver | null = null;

    const restoreRow = (row: HTMLElement) => {
      row.classList.add('is-visible');
      row
        .querySelectorAll<HTMLElement>('[data-final-character]')
        .forEach((character) => {
          const glyph = character.querySelector<HTMLElement>(
            '.passwork-is__feature-character-glyph',
          );
          if (!glyph) return;
          glyph.textContent = character.dataset.finalCharacter ?? '';
          glyph.style.removeProperty('color');
          glyph.style.removeProperty('background-color');
        });
    };

    const restoreAll = () => {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      featureRows.forEach(restoreRow);
    };

    const playScramble = (row: HTMLElement) => {
      if (row.dataset.scramblePlayed === 'true') return;
      row.dataset.scramblePlayed = 'true';
      row.classList.add('is-visible');

      const characters = Array.from(
        row.querySelectorAll<HTMLElement>('[data-final-character]'),
      );

      characters.forEach((character, index) => {
        const glyph = character.querySelector<HTMLElement>(
          '.passwork-is__feature-character-glyph',
        );
        const finalCharacter = character.dataset.finalCharacter ?? '';
        if (!glyph || finalCharacter === '\u00a0') return;

        for (let frame = 0; frame < 3; frame += 1) {
          const timer = window.setTimeout(() => {
            const palette =
              scramblePalettes[
                Math.floor(Math.random() * scramblePalettes.length)
              ];
            glyph.textContent =
              scrambleCharacters[
                Math.floor(Math.random() * scrambleCharacters.length)
              ];
            glyph.style.color = palette.color;
            glyph.style.backgroundColor = palette.background;
            timers.delete(timer);
          }, index * 31 + frame * 31);
          timers.add(timer);
        }

        const restoreTimer = window.setTimeout(() => {
          glyph.textContent = finalCharacter;
          glyph.style.removeProperty('color');
          glyph.style.removeProperty('background-color');
          timers.delete(restoreTimer);
        }, index * 31 + 94);
        timers.add(restoreTimer);
      });
    };

    root.classList.add('is-ready');

    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      restoreAll();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const target = entry.target as HTMLElement;

            if (target.classList.contains('passwork-is__feature-row')) {
              playScramble(target);
            } else {
              target.classList.add('is-visible');
            }

            observer?.unobserve(target);
          });
        },
        { rootMargin: '0px 0px -20% 0px', threshold: 0.08 },
      );

      revealItems.forEach((item) => observer?.observe(item));
      featureRows.forEach((row) => observer?.observe(row));
    }

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer?.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      restoreAll();
    };

    motionPreference.addEventListener('change', handleMotionChange);
    return () => {
      observer?.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      motionPreference.removeEventListener('change', handleMotionChange);
    };
  }, [transitionOnly]);

  useEffect(() => {
    const root = rootRef.current;
    const transition = root?.querySelector<HTMLElement>('.stack-transition');
    if (!transition) return;

    const canvas = transition.querySelector<HTMLCanvasElement>(
      '.stack-transition__canvas',
    );
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const firstFrame = 10;
    const holdFrame = 62;
    const lastFrame = 75;
    const frameRate = 45;
    const frameImages = Array.from(
      { length: lastFrame - firstFrame + 1 },
      (_, index) => {
        const image = new Image();
        image.decoding = 'async';
        image.src = `/assets/stack-sequence/frame_${String(
          firstFrame + index,
        ).padStart(4, '0')}.webp`;
        return image;
      },
    );

    type TransitionPhase =
      | 'hidden'
      | 'prelude'
      | 'active'
      | 'leaving'
      | 'past'
      | 'static';

    let phase: TransitionPhase = 'hidden';
    let phaseStartedAt = performance.now();
    let requestedFrame = firstFrame;
    let paintedFrame = -1;
    let scrollFrame = 0;
    let sequenceFrame = 0;
    let entranceFrame = 0;
    let entranceUnlockTimer = 0;
    let entranceCompletionTimer = 0;
    let entranceLocked = false;
    let previousDocumentOverflow = '';
    let disposed = false;

    const unlockEntrance = () => {
      if (!entranceLocked) return;
      entranceLocked = false;
      if (entranceUnlockTimer) {
        window.clearTimeout(entranceUnlockTimer);
        entranceUnlockTimer = 0;
      }
      if (entranceCompletionTimer) {
        window.clearTimeout(entranceCompletionTimer);
        entranceCompletionTimer = 0;
      }
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.documentElement.classList.remove('is-stack-transition-locked');
    };

    const lockEntrance = () => {
      if (entranceLocked) return;
      entranceLocked = true;
      previousDocumentOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('is-stack-transition-locked');
      entranceUnlockTimer = window.setTimeout(() => {
        entranceUnlockTimer = 0;
        finishEntrance();
      }, 2800);
    };

    const paintFrame = (frameNumber: number) => {
      requestedFrame = Math.min(Math.max(frameNumber, firstFrame), lastFrame);
      const requestedIndex = requestedFrame - firstFrame;
      let image = frameImages[requestedIndex];
      let resolvedIndex = requestedIndex;

      if (!image.complete || image.naturalWidth === 0) {
        const fallbackIndex = frameImages.findIndex(
          (candidate) => candidate.complete && candidate.naturalWidth > 0,
        );
        if (fallbackIndex === -1) return;
        image = frameImages[fallbackIndex];
        resolvedIndex = fallbackIndex;
      }

      if (paintedFrame === resolvedIndex) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      paintedFrame = resolvedIndex;
      canvas.dataset.ready = 'true';
    };

    function finishEntrance() {
      if (!entranceLocked || disposed) return;
      if (entranceCompletionTimer) {
        window.clearTimeout(entranceCompletionTimer);
        entranceCompletionTimer = 0;
      }
      paintFrame(lastFrame);
      setPhase('leaving');
      unlockEntrance();
    }

    frameImages.forEach((image, index) => {
      image.addEventListener('load', () => {
        if (disposed) return;
        if (index === requestedFrame - firstFrame || paintedFrame === -1) {
          paintedFrame = -1;
          paintFrame(requestedFrame);
        }
      });
    });

    const queueSequence = () => {
      if (sequenceFrame) return;
      sequenceFrame = window.requestAnimationFrame(playSequence);
    };

    function playSequence(now: number) {
      sequenceFrame = 0;
      const elapsed = Math.max(now - phaseStartedAt, 0);

      if (phase === 'prelude') {
        const range = holdFrame - firstFrame - 12;
        const cycle = range * 2;
        const step = Math.floor((elapsed * frameRate) / 1000) % cycle;
        const pingPongStep = step <= range ? step : cycle - step;
        paintFrame(firstFrame + pingPongStep);
        queueSequence();
        return;
      }

      if (phase === 'active') {
        const frame = Math.min(
          lastFrame,
          firstFrame + Math.floor((elapsed * frameRate) / 1000),
        );
        paintFrame(frame);
        if (frame < lastFrame) {
          queueSequence();
        } else if (entranceLocked && !entranceCompletionTimer) {
          entranceCompletionTimer = window.setTimeout(() => {
            entranceCompletionTimer = 0;
            finishEntrance();
          }, 600);
        }
        return;
      }

      if (phase === 'leaving') {
        paintFrame(lastFrame);
        return;
      }

      paintFrame(phase === 'past' ? lastFrame : holdFrame);
    }

    const applyPhaseClasses = (nextPhase: TransitionPhase) => {
      transition.classList.toggle('is-near', nextPhase !== 'hidden');
      transition.classList.toggle('is-playing', nextPhase === 'active');
      transition.classList.toggle('is-leaving', nextPhase === 'leaving');
      transition.classList.toggle('is-past', nextPhase === 'past');
      transition.classList.toggle('is-static', nextPhase === 'static');
    };

    function setPhase(nextPhase: TransitionPhase) {
      if (phase === nextPhase) return;

      const previousPhase = phase;
      phase = nextPhase;
      phaseStartedAt = performance.now();

      transition.classList.toggle(
        'is-entering',
        nextPhase === 'active' &&
          (previousPhase === 'hidden' || previousPhase === 'prelude'),
      );

      if (
        nextPhase === 'active' &&
        (previousPhase === 'hidden' || previousPhase === 'prelude')
      ) {
        const viewportHeight = Math.max(window.innerHeight, 1);
        const timeline = document.querySelector<HTMLElement>('.passwork-timeline');
        const transitionTop =
          transition.getBoundingClientRect().top + window.scrollY;
        const timelineTop = timeline
          ? timeline.getBoundingClientRect().top + window.scrollY
          : transitionTop - viewportHeight;
        const entryScrollPosition = Math.max(Math.ceil(timelineTop + 100), 0);
        lockEntrance();
        window.scrollTo({ top: entryScrollPosition, behavior: 'auto' });
      }

      if (
        nextPhase === 'hidden' ||
        nextPhase === 'past' ||
        nextPhase === 'static'
      ) {
        unlockEntrance();
      }

      if (entranceFrame) {
        window.cancelAnimationFrame(entranceFrame);
        entranceFrame = 0;
      }

      if (nextPhase === 'active' && previousPhase === 'hidden') {
        applyPhaseClasses('prelude');
        entranceFrame = window.requestAnimationFrame(() => {
          entranceFrame = 0;
          if (phase === 'active') applyPhaseClasses('active');
        });
      } else {
        applyPhaseClasses(nextPhase);
      }

      if (nextPhase === 'hidden') paintFrame(firstFrame);
      if (nextPhase === 'past') paintFrame(lastFrame);
      if (nextPhase === 'static') paintFrame(holdFrame);

      queueSequence();
    }

    const updateTransition = () => {
      scrollFrame = 0;

      if (motionPreference.matches) {
        setPhase('static');
        return;
      }

      if (entranceLocked) {
        setPhase('active');
        return;
      }

      const viewportHeight = Math.max(window.innerHeight, 1);
      const bounds = transition.getBoundingClientRect();

      if (bounds.bottom <= -viewportHeight) {
        setPhase('past');
      } else if (bounds.top > viewportHeight * 1.25) {
        setPhase('hidden');
      } else if (bounds.top > viewportHeight) {
        setPhase('prelude');
      } else if (bounds.bottom <= 0) {
        setPhase('leaving');
      } else {
        setPhase('active');
      }
    };

    const queueTransitionUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateTransition);
    };

    updateTransition();
    window.addEventListener('scroll', queueTransitionUpdate, { passive: true });
    window.addEventListener('resize', queueTransitionUpdate, { passive: true });
    motionPreference.addEventListener('change', queueTransitionUpdate);

    return () => {
      disposed = true;
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (sequenceFrame) window.cancelAnimationFrame(sequenceFrame);
      if (entranceFrame) window.cancelAnimationFrame(entranceFrame);
      unlockEntrance();
      window.removeEventListener('scroll', queueTransitionUpdate);
      window.removeEventListener('resize', queueTransitionUpdate);
      motionPreference.removeEventListener('change', queueTransitionUpdate);
    };
  }, []);

  return (
    <div className="post-hero-sections" ref={rootRef}>
      {transitionOnly ? null : (
        <>
          <section
        id="trusted-by"
        className="trusted-brands"
        aria-labelledby="trusted-brands-title"
      >
        <h2
          className="trusted-brands__heading"
          id="trusted-brands-title"
          data-post-hero-reveal
        >
          Ведущие компании выбирают Пассворк
        </h2>

        <ul
          className="trusted-brands__grid"
          aria-label="Компании, которые используют Пассворк"
          data-post-hero-reveal
          role="list"
        >
          {clientLogos.map((logo) => (
            <li
              className={`trusted-brands__item ${logo.className}`}
              key={logo.name}
            >
              <img src={logo.src} alt={logo.name} />
            </li>
          ))}
        </ul>
          </section>

          <section className="access-manifesto" aria-labelledby="access-manifesto-title">
        <div className="access-manifesto__inner">
          <span className="access-manifesto__label">
            Российское решение для корпоративной безопасности
          </span>
          <h2 id="access-manifesto-title">
            Пассворк разработан в России и входит в реестр отечественного ПО. Он
            заменяет зарубежные менеджеры паролей без изменения процессов. Все данные
            остаются внутри компании — без телеметрии, внешних API и зависимости от
            облачных сервисов.
          </h2>
        </div>
          </section>

          <section className="passwork-is" aria-labelledby="passwork-is-title">
        <h2 className="sr-only" id="passwork-is-title">
          Что обеспечивает Пассворк
        </h2>

        <div className="passwork-is__intro">
          <span className="passwork-is__arrow" aria-hidden="true">
            [ → ]
          </span>
          <span className="passwork-is__label">Пассворк — это</span>
        </div>

        <div className="passwork-is__panel">
          <div className="passwork-is__features">
            {passworkFeatures.map((feature, index) => (
              <article className="passwork-is__feature-row" key={feature.title}>
                <div className="passwork-is__feature-content">
                  {index > 0 ? (
                    <span className="passwork-is__rule" aria-hidden="true" />
                  ) : null}
                  <FeatureTitle title={feature.title} />
                  <span className="passwork-is__icon" aria-hidden="true">
                    <span className="passwork-is__icon-scan" />
                    <img src={feature.icon} alt="" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
          </section>
        </>
      )}

      <section
        className="stack-transition"
        aria-labelledby="stack-transition-title"
      >
        <div className="stack-transition__stage">
          <canvas
            className="stack-transition__canvas"
            width="1440"
            height="900"
            aria-hidden="true"
          />
          <h2 id="stack-transition-title" className="stack-transition__title">
            <span>Основа корпоративной</span>
            <span>безопасности</span>
          </h2>
          <span className="stack-transition__marker" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
