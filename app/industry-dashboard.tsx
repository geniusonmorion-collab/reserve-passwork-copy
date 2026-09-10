'use client';

import { useEffect, useRef } from 'react';
import { DASHBOARD_HEADER_MARKUP, DASHBOARD_SIDEBAR_MARKUP } from './live-dashboard-markup';
import { initGovernmentDashboardDemo } from './government-dashboard-demo';
import { initManufacturingDashboardDemo } from './manufacturing-dashboard-demo';
import type { DemoOptions } from './dashboard-demo-engine';
import './audit-dashboard.css';
import './it-dashboard-demo.css';
import './industry-dashboard.css';

type Industry = 'government' | 'manufacturing';

const industries = {
  government: {
    vault: 'Госорганизация', group: 'Ведомственные системы', folder: 'Документооборот',
    other: 'Служебные сервисы',
    label: 'Пассворк для госорганизаций: роли сотрудников, пароли ведомственных систем, журнал действий и отзыв доступа с сохранением истории.',
    init: initGovernmentDashboardDemo,
  },
  manufacturing: {
    vault: 'Производство', group: 'Технологическая сеть', folder: 'Линия № 1',
    other: 'Офисные сервисы',
    label: 'Пассворк для производства: доступ к техническим системам, история пароля SCADA, политика ротации, уведомления о подозрительной активности и журнал действий.',
    init: initManufacturingDashboardDemo,
  },
} as const;

// Reuse the hero shell, including its folder icons, controls and avatars.
function sidebarFor(industry: Industry) {
  const { vault, group, folder, other } = industries[industry];
  return DASHBOARD_SIDEBAR_MARKUP
    .replace('Администрирование', vault)
    .replace('Авторизация и 2FA', group)
    .replace('Доступы к серверам', folder)
    .replace('Тестовые сервера', 'Тестовые системы')
    .replace('>Реклама<', `>${other}<`);
}

function headerFor(industry: Industry) {
  const { vault, folder } = industries[industry];
  return DASHBOARD_HEADER_MARKUP.replace('Администрирование', vault).replace('Доступы к серверам', folder);
}

export default function IndustryDashboard({ scenario, onProgress, onComplete }: DemoOptions & { scenario: Industry }) {
  const embed = useRef<HTMLDivElement | null>(null);
  const workspace = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = embed.current;
    if (!element || !workspace.current) return;
    const fit = () => element.style.setProperty('--pw-s', String(element.clientWidth / 1344));
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(element);
    const controller = industries[scenario].init(element, workspace.current, { onProgress, onComplete });
    return () => { controller.dispose(); resize.disconnect(); };
  }, [scenario, onProgress, onComplete]);

  return <div ref={embed} className="pw-embed pw-audit-embed pw-it-embed pw-industry-embed" role="img" aria-label={industries[scenario].label}>
    <div className="pw-stage" aria-hidden="true">
      <div className="pw-app">
        <div className="pw-audit__sidebar" dangerouslySetInnerHTML={{ __html: sidebarFor(scenario) }} />
        <div className="pw-main">
          <div className="pw-audit__header" dangerouslySetInnerHTML={{ __html: headerFor(scenario) }} />
          <div ref={workspace} className="pw-audit__workspace pw-it__workspace" />
        </div>
      </div>
    </div>
  </div>;
}
