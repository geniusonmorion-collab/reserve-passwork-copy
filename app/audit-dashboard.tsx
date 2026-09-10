'use client';

import { useEffect, useRef } from 'react';
import { DASHBOARD_HEADER_MARKUP, DASHBOARD_SIDEBAR_MARKUP } from './live-dashboard-markup';
import { DASHBOARD_ACCESS, DASHBOARD_ICONS, DASHBOARD_PEOPLE, type PersonKey } from './dashboard-shared';
import { initItDashboardDemo } from './it-dashboard-demo';
import { initSecurityDashboardDemo } from './security-dashboard-demo';
import './audit-dashboard.css';
import './it-dashboard-demo.css';
import './security-dashboard.css';

const events: { time: string; person: PersonKey; action: string; object: string; icon: string; detail?: string }[] = [
  { time: '14:32', person: 'marina', action: 'Открыт пароль', object: 'Sprinthost', icon: 'eye' },
  { time: '14:28', person: 'ilya', action: 'Изменён пароль', object: 'Astra Linux', icon: 'edit' },
  { time: '14:18', person: 'marina', action: 'Изменены права', object: 'Доступы к серверам', icon: 'share', detail: 'Саша Орлов · Просмотр' },
  { time: '13:54', person: 'sasha', action: 'Скопирован пароль', object: 'Site24x7 Monitoring', icon: 'copy' },
  { time: '13:41', person: 'ilya', action: 'Создана запись', object: 'Per.py', icon: 'edit' },
  { time: '13:26', person: 'marina', action: 'Отправлен пароль', object: 'Sprinthost', icon: 'share' },
  { time: '13:12', person: 'sasha', action: 'Открыт пароль', object: 'Astra Linux', icon: 'eye' },
];

function ProductIcon({ name }: { name: string }) {
  return <span className="pw-audit__icon" dangerouslySetInnerHTML={{ __html: DASHBOARD_ICONS[name] }} />;
}

export default function AuditDashboard({ animated = false, scenario = 'it-teams', onProgress, onComplete }: {
  animated?: boolean;
  scenario?: 'it-teams' | 'security';
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}) {
  const embed = useRef<HTMLDivElement | null>(null);
  const workspace = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = embed.current;
    if (!element) return;
    const fit = () => element.style.setProperty('--pw-s', String(element.clientWidth / 1344));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animated || !embed.current || !workspace.current) return;
    const initialize = scenario === 'security' ? initSecurityDashboardDemo : initItDashboardDemo;
    const controller = initialize(embed.current, workspace.current, { onProgress, onComplete });
    return () => controller.dispose();
  }, [animated, scenario, onProgress, onComplete]);

  return <div ref={embed} className={`pw-embed pw-audit-embed${animated ? ' pw-it-embed' : ''}${scenario === 'security' ? ' pw-security-embed' : ''}`} role="img" aria-label={scenario === 'security' ? 'Пассворк для безопасности: уведомление о массовом открытии паролей, журнал действий пользователя, сравнение версий записи, права доступа и настройка уведомлений.' : animated ? 'Демонстрация Пассворка: доступ по ролям и его отзыв, общие папки, журнал действий, ротация, 2ФА, SSO, файлы и заметки, обмен ссылкой, история просмотра пароля, браузер и телефон.' : 'Журнал действий Пассворка: время, пользователь, действие с паролем, запись и роль доступа.'}>
    <div className="pw-stage" aria-hidden="true">
      <div className="pw-app">
        <div className="pw-audit__sidebar" dangerouslySetInnerHTML={{ __html: DASHBOARD_SIDEBAR_MARKUP }} />
        <div className="pw-main">
          <div className="pw-audit__header" dangerouslySetInnerHTML={{ __html: DASHBOARD_HEADER_MARKUP }} />
          {animated ? <div ref={workspace} className="pw-audit__workspace pw-it__workspace" /> : <div className="pw-audit__workspace">
            <div className="pw-tabs pw-audit__tabs">
              <span className="pw-tab is-active">История действий</span>
              <span className="pw-tab">Права доступа<span className="pw-audit__tab-count">33</span></span>
            </div>
            <div className="pw-audit__filters">
              <span className="pw-audit__filter">Сегодня<span className="pw-audit__chevron" /></span>
              <span className="pw-audit__filter">Все пользователи<span className="pw-audit__chevron" /></span>
              <span className="pw-audit__filter">Все действия<span className="pw-audit__chevron" /></span>
              <span className="pw-audit__filter-more"><ProductIcon name="more" /></span>
            </div>
            <div className="pw-audit__table">
              <div className="pw-label pw-audit__table-head">
                <span>Дата</span><span>Пользователь</span><span>Действие</span><span className="pw-audit__object">Объект</span><span className="pw-audit__role">Роль</span>
              </div>
              {events.map((event, index) => {
                const person = DASHBOARD_PEOPLE[event.person];
                const role = DASHBOARD_ACCESS.find(([key]) => key === event.person)?.[1];
                return <div className={`pw-audit__row${event.detail ? ' pw-audit__row--access' : ''}`} key={event.time} style={{ animationDelay: `${index * 65}ms` }}>
                  <div className="pw-audit__date"><span>{event.time}</span><small>Сегодня</small></div>
                  <div className="pw-audit__person">
                    <span className="pw-mini" style={{ background: person.color }}>{person.init}</span>
                    <div><span>{person.full}</span><small className="pw-audit__mobile-role">{role}</small></div>
                  </div>
                  <div className="pw-audit__action"><ProductIcon name={event.icon} /><div><span>{event.action}</span>{event.detail && <small>{event.detail}</small>}<small className="pw-audit__mobile-object">{event.object}</small></div></div>
                  <span className="pw-audit__object">{event.object}</span>
                  <span className="pw-audit__role">{role}</span>
                </div>;
              })}
            </div>
            <div className="pw-audit__footer"><span className="pw-audit__desktop-count">Показано 7 из 128 действий</span><span className="pw-audit__mobile-count">Показано 4 из 128 действий</span><span>1–7</span></div>
          </div>}
        </div>
      </div>
    </div>
  </div>;
}
