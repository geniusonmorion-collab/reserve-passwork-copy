'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import LiveDashboard from './live-dashboard';
import BackgroundStars from './background-stars';
import CardGlow from './card-glow';
import { useThemeMotion } from './theme-motion';
import './passwork-hero.css';

const spring = (delay = 0, duration = 1) => ({
  type: 'spring' as const, bounce: 0, duration, delay,
});

/** Centered Passwork hero with a soft blue atmosphere and a live glass dashboard. */
export default function PassworkHero() {
  const colors = useThemeMotion();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const distant = useTransform(scrollY, y => reduced ? 0 : Math.min(y, 1400) * .3);
  const middle = useTransform(scrollY, y => reduced ? 0 : Math.min(y, 1400) * .12);
  const foreground = useTransform(scrollY, y => reduced ? 0 : Math.min(y, 1400) * -.06);
  const dashboard = useTransform(scrollY, y => reduced ? 0 : y * .2);

  return <>
    <section id="hero" className="pw-hero" aria-labelledby="hero-title">
      <span id="header-scroll-marker" className="fh-scroll-marker" aria-hidden="true" />
      <motion.div className="pw-hero__sky" aria-hidden="true"
        initial={reduced ? false : { opacity: .001 }} animate={{ opacity: 1 }}
        transition={reduced ? { duration: 0 } : spring(0, .5)} />
      <BackgroundStars occlusionRef={dashboardRef} />
      <motion.div className="pw-hero__depth pw-hero__depth--distant" style={{ y: distant }} aria-hidden="true"
        initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}
        transition={reduced ? { duration: 0 } : spring(.1, 1.2)} />
      <motion.div className="pw-hero__depth pw-hero__depth--middle" style={{ y: middle }} aria-hidden="true"
        initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}
        transition={reduced ? { duration: 0 } : spring(.2, 1.2)} />

      <div className="pw-hero__content">
        <div className="pw-hero__lockup">
          <div className="pw-hero__copy">
            <div className="pw-hero__origin">
              {/* Original vector mark from https://bfs.su/en. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/made-in-russia.svg" alt="Сделано в России" width={160} height={48} />
            </div>
            <div className="pw-hero__text">
              <h1 id="hero-title">
                <span className="pw-hero__title-line">Пассворк — основа вашей</span>{' '}
                <span className="pw-hero__title-line">информационной безопасности</span>
              </h1>
              <p className="pw-hero__description">
                Управление корпоративными паролями, доступами и&nbsp;действиями — в одном защищённом контуре
              </p>
            </div>
          </div>
          <div className="pw-hero__actions">
            <motion.a className="pw-hero__button pw-hero__button--primary" href="https://passwork.ru/help/"
              initial={false} animate={{ backgroundColor: colors.primary }}
              whileHover={{ backgroundColor: colors.primaryHover }}
              transition={reduced ? { duration: 0 } : { type: 'spring', duration: .4, bounce: .2 }}>
              Запросить демо
            </motion.a>
            <motion.a className="pw-hero__button pw-hero__button--secondary" href="https://passwork.ru/help/"
              initial={false} animate={{ backgroundColor: colors.secondary }}
              whileHover={{ backgroundColor: colors.secondaryHover }}
              transition={reduced ? { duration: 0 } : { type: 'spring', duration: .4, bounce: .2 }}>
              Обсудить внедрение
            </motion.a>
          </div>
        </div>

        <div className="pw-hero__dashboard-frame">
          <motion.div ref={dashboardRef} className="pw-hero__dashboard-motion" style={{ y: dashboard }}>
            <div className="pw-hero__dashboard-surface">
              <LiveDashboard />
              <CardGlow className="pw-hero__dashboard-glow" borderOnly />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div className="pw-hero__depth pw-hero__depth--foreground" style={{ y: foreground }} aria-hidden="true"
        initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}
        transition={reduced ? { duration: 0 } : spring(.3, 1.2)} />
      <div className="pw-hero__fade" aria-hidden="true" />
    </section>
  </>;
}
