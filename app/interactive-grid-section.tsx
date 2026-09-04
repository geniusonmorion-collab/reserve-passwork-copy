/* eslint-disable @next/next/no-img-element */

'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

const launchRows = [
  {
    title: 'Начните работу',
    description:
      'Разверните Пассворк в своей инфраструктуре и соберите корпоративные пароли в одном защищённом пространстве.',
    cta: 'Запустить Пассворк',
    href: '#try-free',
    icon: '/assets/icon-security-a.svg',
  },
  {
    title: 'Соберите команду',
    description:
      'Настройте роли, права и общие папки так, чтобы каждый сотрудник видел только нужные ему доступы.',
    cta: 'Посмотреть возможности',
    href: '#use-cases',
    icon: '/assets/icon-government.svg',
  },
  {
    title: 'Подключите сервисы',
    description:
      'Интегрируйте браузеры, каталоги, приложения и DevOps-инструменты в единый защищённый контур.',
    cta: 'Открыть интеграции',
    href: 'https://passwork.ru/docs/secret-management/integrations/',
    icon: '/assets/icon-devops.svg',
  },
  {
    title: 'Усильте контроль',
    description:
      'Включите аудит действий, политики безопасности и своевременную ротацию корпоративных паролей.',
    cta: 'Изучить безопасность',
    href: 'https://passwork.ru/docs/',
    icon: '/assets/icon-manufacturing-a.svg',
  },
] as const;

export default function InteractiveGridSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const transitionNoiseRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rows = Array.from(
      section.querySelectorAll<HTMLElement>('.launch-grid__row'),
    );
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    section.classList.add('is-ready');

    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      rows.forEach((row) => row.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.16 },
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = transitionNoiseRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scrollFrame = 0;
    let noiseFrame = 0;
    let noiseFrames: ImageData[] = [];
    let noiseIndex = 0;
    let lastNoisePaint = 0;
    let minHeight = 240;
    let maxHeight = 520;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const updateTransition = () => {
      scrollFrame = 0;
      const bounds = section.getBoundingClientRect();
      const sectionBottom = bounds.bottom + window.scrollY;
      const start = sectionBottom - minHeight - window.innerHeight;
      const end = sectionBottom;
      const progress = clamp(
        (window.scrollY - start) / Math.max(end - start, 1),
      );
      const easedProgress = 1 - (1 - progress) ** 2;
      const height = minHeight + (maxHeight - minHeight) * easedProgress;

      section.style.setProperty(
        '--launch-transition-progress',
        easedProgress.toFixed(5),
      );
      section.style.setProperty('--launch-transition-height', `${height.toFixed(2)}px`);
    };

    const queueTransition = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateTransition);
    };

    const buildNoiseFrames = () => {
      const bounds = section.getBoundingClientRect();
      const sectionWidth = Math.max(1, bounds.width);
      section.style.removeProperty('--launch-transition-height');
      minHeight = canvas.parentElement?.getBoundingClientRect().height ?? 240;
      section.style.setProperty(
        '--launch-transition-height',
        'var(--launch-transition-max-height)',
      );
      maxHeight = canvas.parentElement?.getBoundingClientRect().height || 520;
      section.style.removeProperty('--launch-transition-height');

      const textureScale = Math.min(0.7, 1024 / sectionWidth);
      const width = Math.max(1, Math.round(sectionWidth * textureScale));
      const height = Math.max(1, Math.round(maxHeight * textureScale));

      canvas.width = width;
      canvas.height = height;
      noiseFrames = [];
      let seed = 0x5f3759df;

      for (let frameIndex = 0; frameIndex < 4; frameIndex += 1) {
        const image = context.createImageData(width, height);

        for (let index = 0; index < image.data.length; index += 4) {
          seed ^= seed << 13;
          seed ^= seed >>> 17;
          seed ^= seed << 5;
          image.data[index + 3] = (seed & 1) === 0 ? 0 : 255;
        }

        noiseFrames.push(image);
      }

      noiseIndex = 0;
      context.putImageData(noiseFrames[0], 0, 0);
      updateTransition();
    };

    const animateNoise = (time: number) => {
      if (
        !motionPreference.matches &&
        noiseFrames.length > 0 &&
        time - lastNoisePaint >= 72
      ) {
        noiseIndex = (noiseIndex + 1) % noiseFrames.length;
        context.putImageData(noiseFrames[noiseIndex], 0, 0);
        lastNoisePaint = time;
      }

      noiseFrame = window.requestAnimationFrame(animateNoise);
    };

    const handleResize = () => buildNoiseFrames();
    const handleMotionPreference = () => {
      if (motionPreference.matches && noiseFrames[0]) {
        noiseIndex = 0;
        context.putImageData(noiseFrames[0], 0, 0);
      }
    };

    buildNoiseFrames();
    noiseFrame = window.requestAnimationFrame(animateNoise);
    window.addEventListener('scroll', queueTransition, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    motionPreference.addEventListener('change', handleMotionPreference);

    return () => {
      window.removeEventListener('scroll', queueTransition);
      window.removeEventListener('resize', handleResize);
      motionPreference.removeEventListener('change', handleMotionPreference);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (noiseFrame) window.cancelAnimationFrame(noiseFrame);
    };
  }, []);

  return (
    <section
      id="resources"
      className="launch-grid"
      aria-labelledby="launch-grid-title"
      ref={sectionRef}
    >
      <h2 className="sr-only" id="launch-grid-title">
        Как начать работу с Пассворком
      </h2>

      <div className="launch-grid__inner">
        {launchRows.map((row, index) => (
          <article
            className="launch-grid__row"
            key={row.title}
            style={{ '--launch-delay': `${index * 55}ms` } as CSSProperties}
          >
            <span className="launch-grid__rule" aria-hidden="true" />
            <span className="launch-grid__hover-bg" aria-hidden="true" />

            <div className="launch-grid__title-block">
              <span className="launch-grid__object" aria-hidden="true">
                <span className="launch-grid__object-scan" />
                <img src={row.icon} alt="" width="48" height="48" />
              </span>
              <h3>{row.title}</h3>
            </div>

            <div className="launch-grid__details">
              <p>{row.description}</p>
              <a className="launch-grid__cta" href={row.href}>
                <svg
                  className="launch-grid__cta-arrow"
                  viewBox="0 0 13 11"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12.7432 4.11621V6.68066L7.20996 10.7549V8.89355L10.9619 6.12891L0.000976562 6.12988L0 4.62988L10.917 4.62891L7.20996 1.87012V0L12.7432 4.11621Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12.7432 4.11621V6.68066L7.20996 10.7549V8.89355L10.9619 6.12891L0.000976562 6.12988L0 4.62988L10.917 4.62891L7.20996 1.87012V0L12.7432 4.11621Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{row.cta}</span>
              </a>
            </div>
          </article>
        ))}
        <span
          className="launch-grid__rule launch-grid__rule--last"
          aria-hidden="true"
        />
      </div>

      <div className="launch-grid__color-transition" aria-hidden="true">
        <canvas
          className="launch-grid__transition-noise"
          ref={transitionNoiseRef}
        />
      </div>
    </section>
  );
}
