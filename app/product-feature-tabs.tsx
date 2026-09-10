'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import AuditDashboard from './audit-dashboard';
import DevopsDashboard from './devops-dashboard';
import IndustryDashboard from './industry-dashboard';
import ForaTabEffects, { ForaBorderFrame } from './fora-tab-effects';
import { startFeatureTabTimer } from './feature-tab-timer';
import './product-feature-tabs.css';
import './dashboard-glass.css';

// Scenario copy: Figma 15:5629. DevOps copy and composition: Figma 572:8121.
const features = [
  {
    id: 'it-teams', label: 'IT-команды',
    lead: 'Полный журнал действий пользователей.',
    description: 'Все действия с паролями фиксируются в журнале, а права доступа настраиваются по ролям.',
    caption: 'Сотрудник уходит из проекта — права снимаются одним действием, без рассылки «всем сменить пароль»',
  },
  {
    id: 'devops', label: 'DevOps',
    lead: 'Отдаёт секрет по API. И через CLI.',
    description: 'Держит окружения в разных сейфах. Выдаёт токен на время сборки. Меняет ключи по расписанию. Помнит каждое обращение.',
    caption: 'Секреты попадают в сборку автоматически — доступ ограничен окружением и временем её выполнения',
  },
  {
    id: 'security', label: 'Безопасность',
    lead: 'Уведомления о подозрительных действиях.',
    description: 'Полный журнал действий пользователей. Отслеживание изменений и доступа к записям.',
    caption: 'От уведомления — к журналу, изменениям записи и правам доступа: всё для разбора события в одном месте',
  },
  {
    id: 'government', label: 'Госорганизации',
    lead: 'Полный журнал действий пользователей.',
    description: 'Все действия с паролями фиксируются в журнале, а права доступа настраиваются по ролям.',
    caption: 'Для ведомственных систем — доступ по ролям и история действий, которая остаётся после отзыва прав',
  },
  {
    id: 'manufacturing', label: 'Производство',
    lead: 'Отслеживание изменений и доступа к записям.',
    description: 'Настройка политики ротации паролей. Уведомления о подозрительных действиях.',
    caption: 'Доступ к техническим системам под контролем — от истории пароля до ротации и проверки подозрительных действий',
  },
] as const satisfies readonly { id: string; label: string; lead: string; description: string; caption: string }[];

const imageSpring = { type: 'spring' as const, duration: 1, bounce: 0 };

function Reveal({ children, delay = 0, bounce = 0, className }: {
  children: ReactNode; delay?: number; bounce?: number; className?: string;
}) {
  const reduced = useReducedMotion();
  return <motion.div className={className}
    initial={reduced ? false : { opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: .5 }}
    transition={{ type: 'spring', duration: 1, bounce, delay: reduced ? 0 : delay }}
  >{children}</motion.div>;
}

function useMobile() {
  const subscribe = useCallback((notify: () => void) => {
    const query = window.matchMedia('(max-width: 809.98px)');
    query.addEventListener('change', notify);
    return () => query.removeEventListener('change', notify);
  }, []);
  return useSyncExternalStore(subscribe, () => window.matchMedia('(max-width: 809.98px)').matches, () => false);
}

export default function ProductFeatureTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerCycle, setTimerCycle] = useState(0);
  const [demoCycles, setDemoCycles] = useState(() => features.map(() => 0));
  const carousel = useRef<HTMLDivElement | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobile = useMobile();
  const reduced = useReducedMotion();
  const activeFeature = features[activeIndex];
  const advanceTab = useCallback(() => {
    setActiveIndex((current) => (current + 1) % features.length);
  }, []);
  const repeatDemo = useMemo(() => features.map((_, index) => () => {
    setDemoCycles((cycles) => cycles.map((cycle, i) => i === index ? cycle + 1 : cycle));
  }), []);
  const resetCarousel = useCallback(() => {
    setActiveIndex(0);
    setTimerCycle((cycle) => cycle + 1);
  }, []);

  useEffect(() => {
    if (carousel.current) return startFeatureTabTimer(carousel.current, advanceTab, resetCarousel);
  }, [activeIndex, timerCycle, advanceTab, resetCarousel]);

  function selectTab(index: number) {
    if (index === activeIndex) setDemoCycles((cycles) => cycles.map((cycle, i) => i === index ? cycle + 1 : cycle));
    setActiveIndex(index);
    setTimerCycle((cycle) => cycle + 1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % features.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + features.length) % features.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = features.length - 1;
    else return;
    event.preventDefault();
    selectTab(nextIndex);
    tabs.current[nextIndex]?.focus();
  }

  function advanceGallery() {
    if (!mobile && activeIndex !== 0) selectTab((activeIndex + 1) % features.length);
  }

  return <section className="product-features figma-shell" id="features" aria-labelledby="product-features-title">
    <div className="product-features__heading">
      <Reveal delay={.1}><h2 id="product-features-title">Сценарии<span>использования</span></h2></Reveal>
      <Reveal delay={.2} className="product-features__description"><p>Пассворк решает задачи разных команд<br />—&nbsp;от&nbsp;IT&#8209;отдела до специалистов по информационной безопасности.</p></Reveal>
    </div>
    <div ref={carousel} className="product-features__carousel">
    <div className="product-features__tabs" role="tablist" aria-label="Сценарии использования Пассворка">
      <ForaBorderFrame />
      {features.map((feature, index) => <Reveal key={feature.id} className="product-features__tab-reveal" delay={index * .1} bounce={.2}><button
        type="button"
        ref={(element) => { tabs.current[index] = element; }}
        id={`feature-tab-${feature.id}`}
        role="tab"
        aria-selected={activeIndex === index}
        aria-controls={`feature-panel-${feature.id}`}
        tabIndex={activeIndex === index ? 0 : -1}
        onClick={() => selectTab(index)}
        onKeyDown={(event) => handleKeyDown(event, index)}
      >
        <ForaTabEffects active={activeIndex === index} cycle={timerCycle} />
        <span className="product-features__tab-label">{feature.label}</span>
      </button></Reveal>)}
    </div>
    <div className="product-features__panels" data-can-advance={!mobile && activeIndex !== 0}>
      <ForaBorderFrame />
    {/* The live dashboards replace the supplied PNG layers. Keep them mounted
        and pause inactive demos while Framer blends their opacity. */}
    {features.map((feature, index) => <motion.div className="product-features__panel" key={feature.id}
      id={`feature-panel-${feature.id}`} role="tabpanel"
      aria-labelledby={mobile ? undefined : `feature-tab-${feature.id}`}
      aria-label={mobile ? feature.label : undefined}
      aria-hidden={index !== activeIndex} inert={index !== activeIndex}
      data-active={index === activeIndex} tabIndex={index === activeIndex ? 0 : -1}
      initial={false}
      animate={index === activeIndex ? { opacity: 1, visibility: 'visible' } : { opacity: 0, transitionEnd: { visibility: 'hidden' } }}
      transition={reduced ? { duration: 0 } : imageSpring}
      style={{ pointerEvents: index === activeIndex ? 'auto' : 'none' }}
      onClick={advanceGallery}
      onKeyDown={(event) => {
        if (!mobile && activeIndex !== 0 && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          advanceGallery();
        }
      }}
    >
        <div className="product-features__stage">
          <p className="product-features__scenario-copy">
            <span>{feature.lead}</span>{' '}{feature.description}
          </p>
          <div className="product-features__window product-features__window--audit pw-glass">
            {feature.id === 'it-teams'
              ? <AuditDashboard key={demoCycles[index]} animated onComplete={repeatDemo[index]} />
              : feature.id === 'devops'
                ? <DevopsDashboard key={demoCycles[index]} onComplete={repeatDemo[index]} />
                : feature.id === 'security'
                  ? <AuditDashboard key={demoCycles[index]} animated scenario="security" onComplete={repeatDemo[index]} />
                  : <IndustryDashboard key={demoCycles[index]} scenario={feature.id} onComplete={repeatDemo[index]} />}
          </div>
        </div>
    </motion.div>)}
    </div>
    <footer className="product-features__footer">
      <ForaBorderFrame />
      <button type="button" className="product-features__arrow" aria-label="Предыдущий сценарий" onClick={() => selectTab((activeIndex - 1 + features.length) % features.length)}>←</button>
      <p className="product-features__caption">{mobile ? activeFeature.label : activeFeature.caption}</p>
      <button type="button" className="product-features__arrow" aria-label="Следующий сценарий" onClick={() => selectTab((activeIndex + 1) % features.length)}>→</button>
    </footer>
    </div>
  </section>;
}
