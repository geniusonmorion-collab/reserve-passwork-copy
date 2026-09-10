'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useThemeMotion } from './theme-motion';
import './passwork-intro.css';

const paragraph = 'Пассворк — корпоративный менеджер паролей для ИТ-команд, DevOps и специалистов по безопасности. Он помогает хранить пароли, управлять доступом и отслеживать действия сотрудников внутри инфраструктуры компании. Разработан в России и входит в реестр отечественного ПО.';

const words = paragraph.split(' ');
const fadeWordCount = 4;
const readingRange = words.length - 1 + fadeWordCount;
const smoothFade = (progress: number) => progress * progress * (3 - 2 * progress);

function ReadingWord({ word, index, progress, restOpacity, reduced }: {
  word: string;
  index: number;
  progress: MotionValue<number>;
  restOpacity: number;
  reduced: boolean;
}) {
  // Overlap neighbouring words and ease both ends of each brightness transition.
  const opacity = useTransform(progress,
    [index / readingRange, (index + fadeWordCount) / readingRange],
    [restOpacity, 1],
    { ease: smoothFade },
  );

  return <motion.span className="pw-intro__word" style={{ opacity: reduced ? 1 : opacity }}>
    {word}
  </motion.span>;
}

export default function PassworkIntro() {
  const reduced = useReducedMotion();
  const colors = useThemeMotion();
  const text = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: text,
    offset: ['start 0.75', 'end 0.45'],
  });
  // One damped progress value absorbs wheel steps without bouncing or changing order.
  const readingProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.7,
    restDelta: 0.0001,
    restSpeed: 0.001,
  });

  return (
    <section id="company" className="pw-intro" aria-label="О Пассворке">
      <div className="pw-intro__container">
        <div className="pw-intro__column">
          <div className="pw-intro__text-frame">
            <div className="pw-intro__paragraphs">
              <p ref={text} className="pw-intro__paragraph">
                {words.map((word, index) => <ReadingWord
                  key={index}
                  word={index < words.length - 1 ? `${word} ` : word}
                  index={index}
                  progress={readingProgress}
                  restOpacity={colors.introRestOpacity}
                  reduced={Boolean(reduced)}
                />)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
