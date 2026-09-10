'use client';

import { useEffect, useRef } from 'react';
import { DASHBOARD_HEADER_MARKUP, DASHBOARD_SIDEBAR_MARKUP } from './live-dashboard-markup';
import { initDevopsDashboardDemo } from './devops-dashboard-demo';
import type { DemoOptions } from './dashboard-demo-engine';
import './audit-dashboard.css';
import './it-dashboard-demo.css';
import './devops-dashboard.css';

// Keep the actual hero navigation and folder glyph; replace only the vault list.
const sharedStart = DASHBOARD_SIDEBAR_MARKUP.indexOf('<div class="pw-sec"><span class="pw-sec__title">Общие сейфы');
const treeStart = DASHBOARD_SIDEBAR_MARKUP.indexOf('<div class="pw-tree">', sharedStart);
const sharedEnd = DASHBOARD_SIDEBAR_MARKUP.indexOf('<div class="pw-sec"><span class="pw-sec__title">Корпоративные сейфы', treeStart);
const folder = DASHBOARD_SIDEBAR_MARKUP.match(/<span class="pw-tree-row__folder">(.*?)<\/span>/)?.[1].replace(/fill="#[^"]+"/g, 'fill="currentColor"') ?? '';
const sidebar = DASHBOARD_SIDEBAR_MARKUP.slice(0, treeStart) + `<div class="pw-tree pw-devops__vaults">${['Production', 'Staging', 'Development'].map((name, index) => `<div class="pw-tree-row pw-tree-row--l1${index === 0 ? ' pw-tree-row--active' : ''}" data-environment="${name}"><span class="pw-tree-row__folder">${folder}</span><span class="pw-tree-row__text">${name}</span><span class="pw-devops__vault-count">${[12, 8, 6][index]}</span></div>`).join('')}</div>` + DASHBOARD_SIDEBAR_MARKUP.slice(sharedEnd);
const header = DASHBOARD_HEADER_MARKUP.replace('Администрирование', 'DevOps').replace('Доступы к серверам', 'Production').replace('Доступ к папке:', 'Доступ к сейфу:').replace('33 пользователя', '8 пользователей').replace('Добавить пароль', 'Добавить секрет');

export default function DevopsDashboard({ onProgress, onComplete }: DemoOptions) {
  const embed = useRef<HTMLDivElement | null>(null);
  const workspace = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = embed.current;
    if (!element || !workspace.current) return;
    const fit = () => element.style.setProperty('--pw-s', String(element.clientWidth / 1344));
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(element);
    const controller = initDevopsDashboardDemo(element, workspace.current, { onProgress, onComplete });
    return () => { controller.dispose(); resize.disconnect(); };
  }, [onProgress, onComplete]);

  return <div ref={embed} className="pw-embed pw-audit-embed pw-it-embed pw-devops-embed" role="img" aria-label="Пассворк для DevOps: отдельные сейфы Production, Staging и Development, временный токен сборки, получение секрета по API и CLI, ротация ключей и журнал обращений.">
    <div className="pw-stage" aria-hidden="true">
      <div className="pw-app">
        <div className="pw-audit__sidebar" dangerouslySetInnerHTML={{ __html: sidebar }} />
        <div className="pw-main">
          <div className="pw-audit__header" dangerouslySetInnerHTML={{ __html: header }} />
          <div ref={workspace} className="pw-audit__workspace pw-it__workspace" />
        </div>
      </div>
    </div>
  </div>;
}
