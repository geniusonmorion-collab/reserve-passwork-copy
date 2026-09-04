'use client';

import { useEffect, useRef } from 'react';
import BlueNoiseLayer from './blue-noise-layer';

const footerColumns = [
  [
    {
      title: 'Компания',
      links: [
        { label: 'О Пассворке', href: 'https://passwork.ru/' },
        { label: 'Новости', href: 'https://passwork.ru/blog/' },
        { label: 'Дорожная карта', href: 'https://passwork.ru/blog/release-notes/' },
        { label: 'Релизы', href: 'https://passwork.ru/blog/release-notes/' },
        { label: 'Блог', href: 'https://passwork.ru/blog/' },
      ],
    },
  ],
  [
    {
      title: 'Продукт',
      links: [
        { label: 'Функциональность', href: '#use-cases' },
        { label: 'Интеграции', href: 'https://passwork.ru/docs/secret-management/integrations/' },
        { label: 'Решения', href: '#prices' },
        { label: 'Обновления', href: 'https://passwork.ru/blog/release-notes/' },
      ],
    },
    {
      title: 'Поддержка',
      links: [
        { label: 'Техническая документация', href: 'https://passwork.ru/docs/' },
        { label: 'Руководство пользователя', href: 'https://passwork.ru/manuals/' },
        { label: 'Центр поддержки', href: 'https://passwork.ru/help/' },
      ],
    },
  ],
  [
    {
      title: 'Расширения',
      links: [
        { label: 'Google Chrome', href: 'https://passwork.ru/browser-chrome' },
        { label: 'Apple Safari', href: 'https://passwork.ru/browser-safari' },
        { label: 'Mozilla Firefox', href: 'https://passwork.ru/browser-firefox' },
        { label: 'Microsoft Edge', href: 'https://passwork.ru/browser-edge' },
        { label: 'Yandex Browser', href: 'https://passwork.ru/browser-chrome' },
      ],
    },
    {
      title: 'Приложения',
      links: [
        { label: 'RuStore', href: 'https://www.rustore.ru/catalog/app/com.passwork.passwork_sh' },
        { label: 'App Store', href: 'https://apps.apple.com/us/app/passwork-self-hosted/id1589706401' },
        { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.passwork.passwork_sh' },
      ],
    },
  ],
  [
    {
      title: 'Инструменты',
      links: [
        { label: 'Генератор паролей', href: 'https://passwork.ru/manuals/browser-extension/passwords/password-generator/' },
        { label: 'Генератор парольных фраз', href: 'https://passwork.ru/manuals/' },
        { label: 'Генератор логинов', href: 'https://passwork.ru/manuals/' },
        { label: 'Проверка надёжности', href: 'https://passwork.ru/manuals/' },
      ],
    },
    {
      title: 'Документы',
      links: [
        { label: 'Политика конфиденциальности', href: 'https://passwork.ru/Политика_конфиденциальность.pdf' },
        { label: 'Лицензионное соглашение', href: 'https://passwork.ru/Лицензионное_соглашение.pdf' },
        { label: 'Оферта', href: 'https://passwork.ru/Оферта.pdf' },
      ],
    },
  ],
] as const;

const scrambleGlyphs =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+=?<>/{}[]';

export default function SignalFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const scrambleLinks = Array.from(
      footer.querySelectorAll<HTMLAnchorElement>('[data-signal-scramble]'),
    );
    const revealGroups = Array.from(
      footer.querySelectorAll<HTMLElement>('.signal-footer__group'),
    );
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scrambleTimers = new Map<HTMLAnchorElement, number>();
    const revealTimers = new Set<number>();
    let revealObserver: IntersectionObserver | null = null;
    let revealStarted = false;
    let reducedMotion = motionPreference.matches;

    const getCharacters = (link: HTMLAnchorElement) =>
      Array.from(link.querySelectorAll<HTMLElement>('[data-signal-char]'));

    const revealCharacters = revealGroups.flatMap((group) =>
      Array.from(
        group.querySelectorAll<HTMLAnchorElement>('[data-signal-scramble]'),
      )
        .flatMap(getCharacters)
        .filter((character) => character.dataset.signalChar?.trim()),
    );

    const finishReveal = () => {
      revealObserver?.disconnect();
      revealObserver = null;
      revealTimers.forEach((timer) => window.clearTimeout(timer));
      revealTimers.clear();
      revealCharacters.forEach((character) => {
        character.style.removeProperty('opacity');
      });
      revealStarted = true;
    };

    const playReveal = () => {
      if (revealStarted) return;
      revealStarted = true;

      revealGroups.forEach((group, groupIndex) => {
        const links = Array.from(
          group.querySelectorAll<HTMLAnchorElement>('[data-signal-scramble]'),
        );

        links.forEach((link, itemIndex) => {
          const characters = getCharacters(link).filter((character) =>
            character.dataset.signalChar?.trim(),
          );

          characters.forEach((character, characterIndex) => {
            const delay =
              groupIndex * 100 + itemIndex * 50 + characterIndex * 40;
            const reveal = () => character.style.removeProperty('opacity');

            if (delay === 0) {
              reveal();
              return;
            }

            const timer = window.setTimeout(() => {
              revealTimers.delete(timer);
              reveal();
            }, delay);
            revealTimers.add(timer);
          });
        });
      });
    };

    const resetScramble = (link: HTMLAnchorElement) => {
      const timer = scrambleTimers.get(link);
      if (timer) window.clearTimeout(timer);
      scrambleTimers.delete(link);
      link.removeAttribute('data-scrambling');

      getCharacters(link).forEach((character) => {
        character.textContent = character.dataset.signalChar ?? '';
        character.classList.remove('is-scrambling');
        character.style.removeProperty('--scramble-color');
        character.style.removeProperty('--scramble-opacity');
      });
    };

    const playScramble = (link: HTMLAnchorElement) => {
      resetScramble(link);
      if (reducedMotion) return;

      const characters = getCharacters(link);
      const animatedIndexes = characters
        .map((character, index) =>
          character.dataset.signalChar?.trim() ? index : -1,
        )
        .filter((index) => index >= 0);

      for (let index = animatedIndexes.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [animatedIndexes[index], animatedIndexes[swapIndex]] = [
          animatedIndexes[swapIndex],
          animatedIndexes[index],
        ];
      }

      const startedAt = window.performance.now();
      const duration = 280;
      const frameDuration = 38;
      link.setAttribute('data-scrambling', 'true');

      const renderFrame = () => {
        const progress = Math.min(
          1,
          (window.performance.now() - startedAt) / duration,
        );
        const resolvedCount = Math.floor(progress * animatedIndexes.length);
        const resolvedIndexes = new Set(animatedIndexes.slice(0, resolvedCount));

        characters.forEach((character, index) => {
          const originalCharacter = character.dataset.signalChar ?? '';
          if (
            !originalCharacter.trim() ||
            resolvedIndexes.has(index) ||
            progress === 1
          ) {
            character.textContent = originalCharacter;
            character.classList.remove('is-scrambling');
            character.style.removeProperty('--scramble-color');
            character.style.removeProperty('--scramble-opacity');
            return;
          }

          character.textContent =
            scrambleGlyphs[Math.floor(Math.random() * scrambleGlyphs.length)] ??
            originalCharacter;
          character.classList.add('is-scrambling');
          character.style.setProperty(
            '--scramble-color',
            Math.random() > 0.5 ? '#ffffff' : '#b9d7ff',
          );
          character.style.setProperty(
            '--scramble-opacity',
            (0.35 + Math.random() * 0.65).toFixed(2),
          );
        });

        if (progress < 1) {
          const timer = window.setTimeout(renderFrame, frameDuration);
          scrambleTimers.set(link, timer);
          return;
        }

        scrambleTimers.delete(link);
        link.removeAttribute('data-scrambling');
      };

      renderFrame();
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        scrambleLinks.forEach(resetScramble);
        finishReveal();
      }
    };

    const linkHandlers = scrambleLinks.map((link) => {
      const handleEnter = () => playScramble(link);
      const handleLeave = () => resetScramble(link);
      link.addEventListener('mouseenter', handleEnter);
      link.addEventListener('mouseleave', handleLeave);
      link.addEventListener('focus', handleEnter);
      link.addEventListener('blur', handleLeave);
      return { link, handleEnter, handleLeave };
    });

    if (
      !reducedMotion &&
      revealGroups[0] &&
      'IntersectionObserver' in window
    ) {
      revealCharacters.forEach((character) => {
        character.style.opacity = '0';
      });

      if (revealGroups[0].getBoundingClientRect().top < window.innerHeight) {
        playReveal();
      } else {
        revealObserver = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            revealObserver?.disconnect();
            revealObserver = null;
            playReveal();
          },
          { threshold: 0 },
        );
        revealObserver.observe(revealGroups[0]);
      }
    }

    motionPreference.addEventListener('change', handleMotionPreference);

    return () => {
      finishReveal();
      motionPreference.removeEventListener('change', handleMotionPreference);
      linkHandlers.forEach(({ link, handleEnter, handleLeave }) => {
        link.removeEventListener('mouseenter', handleEnter);
        link.removeEventListener('mouseleave', handleLeave);
        link.removeEventListener('focus', handleEnter);
        link.removeEventListener('blur', handleLeave);
        resetScramble(link);
      });
    };
  }, []);

  return (
    <footer className="signal-footer" ref={footerRef}>
      <BlueNoiseLayer />
      <div className="signal-footer__inner">
        <div className="signal-footer__rule" aria-hidden="true" />

        <div className="signal-footer__brand-row">
          <a className="signal-footer__brand" href="#top" aria-label="Пассворк — наверх">
            <img src="/assets/passwork-symbol.svg" alt="" width="30" height="30" />
            <img src="/assets/passwork-wordmark.svg" alt="Пассворк" width="99" height="21" />
          </a>
          <span>Управление корпоративными паролями и доступами</span>
        </div>

        <nav className="signal-footer__navigation" aria-label="Навигация в подвале">
          {footerColumns.map((column, columnIndex) => (
            <div className="signal-footer__column" key={columnIndex}>
              {column.map((group) => (
                <section
                  className="signal-footer__group"
                  id={
                    group.title === 'Компания'
                      ? 'company'
                      : group.title === 'Поддержка'
                        ? 'support'
                        : undefined
                  }
                  key={group.title}
                >
                  <h2>{group.title}/</h2>
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          aria-label={link.label}
                          data-signal-scramble
                        >
                          <span className="signal-footer__branch" aria-hidden="true" />
                          <span className="signal-footer__link-text" aria-hidden="true">
                            {Array.from(link.label).map((character, characterIndex) => (
                              <span
                                className="signal-footer__char"
                                data-signal-char={character}
                                key={`${link.label}-${characterIndex}`}
                              >
                                {character === ' ' ? '\u00a0' : character}
                              </span>
                            ))}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ))}
        </nav>

        <div className="signal-footer__meta">
          <div className="signal-footer__socials" aria-label="Пассворк в соцсетях">
            <a href="https://vk.com/passwork" aria-label="ВКонтакте">vk</a>
            <a href="https://tenchat.ru/passwork" aria-label="TenChat">T</a>
            <a href="https://t.me/passwork_ru" aria-label="Telegram">↗</a>
          </div>
          <p>© 2014–2026 ООО «Пассворк». Все права защищены</p>
        </div>
      </div>

    </footer>
  );
}
