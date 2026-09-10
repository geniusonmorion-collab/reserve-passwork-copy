'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './passwork-intro.css';

const paragraphs = [
  'Пассворк — корпоративный менеджер паролей для ИТ-команд, DevOps и специалистов по безопасности. Пароли, доступы и действия сотрудников — в едином защищённом пространстве.',
  'Разработан в России и входит в реестр отечественного ПО. Решение подходит для бизнеса, государственных организаций и критической инфраструктуры.',
] as const;

type IntroState = 'Idle' | '1' | '2' | 'Primary';
const triggerStates = ['1', '2', 'Idle'] as const;

// Match the supplied Fora port: layout offsets ignore visual transforms.
function documentOffsetTop(element: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current && current !== document.documentElement) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

export default function PassworkIntro() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const triggers = useRef<HTMLDivElement>(null);
  const [automatic, setAutomatic] = useState<IntroState>('Idle');
  const active = reduced ? 'Primary' : automatic;

  useEffect(() => {
    if (reduced) return;

    let frame = 0;
    let disposed = false;
    const update = () => {
      frame = 0;
      if (disposed || !triggers.current) return;

      let state: IntroState = 'Idle';
      Array.from(triggers.current.children).forEach((element, index) => {
        const threshold = documentOffsetTop(element as HTMLElement) - 1 - window.innerHeight * 0.5;
        if (window.scrollY >= threshold) state = triggerStates[index];
      });
      setAutomatic(state);
    };
    const schedule = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(schedule);
    if (section.current) observer.observe(section.current);
    observer.observe(document.documentElement);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.fonts.ready.then(schedule);
    schedule();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [reduced]);

  return (
    <section id="company" ref={section} className="pw-intro" data-state={active} aria-label="О Пассворке">
      <div className="pw-intro__container">
        <div className="pw-intro__column">
          <div className="pw-intro__text-frame">
            <div className="pw-intro__triggers" ref={triggers} aria-hidden="true">
              {triggerStates.map(state => <div key={state} data-trigger={state} />)}
            </div>
            <div className="pw-intro__paragraphs">
              {paragraphs.map((text, index) => (
                <motion.p
                  key={text}
                  className="pw-intro__paragraph"
                  initial={false}
                  animate={{ opacity: active === 'Primary' || active === String(index + 1) ? 1 : 0.25 }}
                  transition={reduced ? { duration: 0 } : { type: 'spring', duration: 0.4, bounce: 0 }}
                >
                  {text}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
