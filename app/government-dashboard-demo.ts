import { initDashboardDemo, type DemoOptions } from './dashboard-demo-engine';
import { action, chevron, field, heading, person, result } from './dashboard-demo-ui';
import { industryJournal, industryPassword, industryRecords, type IndustryEvent } from './industry-dashboard-ui';

type AccessState = 'pending' | 'granted' | 'revoked';

function rolesView(state: AccessState = 'pending') {
  const granted = state === 'granted';
  return heading('Роли и доступ', 'Документооборот · права на запись') +
    `<div class="pw-industry__roles"><div class="pw-label pw-industry__role-head"><span>Пользователь</span><span>Подразделение</span><span>Роль</span></div>
      <div class="pw-industry__role-row">${person('marina')}<span>ИТ-отдел</span><span>Администратор</span></div>
      <div class="pw-industry__role-row">${person('ilya')}<span>ИТ-отдел</span><span>Редактор</span></div>
      <div class="pw-industry__role-row${state === 'revoked' ? ' is-revoked' : ''}">${person('sasha')}<span>Делопроизводство</span><span class="pw-it__select" data-demo="gov-role">${granted ? 'Просмотр' : 'Нет доступа'}${chevron}</span></div>
    </div><div class="pw-industry__role-summary">${state === 'pending' ? '<span class="pw-it__muted">Назначьте роль для работы с системой</span>' : granted ? result('Саша Орлов может открывать и копировать пароль') : result('Доступ Саши Орлова снят · история сохранена')}${granted ? action('gov-revoke', 'Снять доступ') : ''}</div><div class="pw-it__overlay-slot"></div>`;
}

function recordsView() {
  return industryRecords('Ведомственные системы', 'Общий сейф · Госорганизация', [
    { id: 'gov-document', name: 'Документооборот', detail: 'Система электронного документооборота', label: 'Просмотр' },
    { id: 'gov-portal', name: 'Внутренний портал', detail: 'Сервисы сотрудников', label: 'По роли' },
    { id: 'gov-mail', name: 'Почтовый сервер', detail: 'Служебная почта', label: 'По роли' },
  ]);
}

function journalView(filtered = false, revoked = false) {
  const events: IndustryEvent[] = [
    ...(revoked ? [{ time: '14:30', user: 'marina' as const, action: 'Снят доступ', object: 'Саша Орлов · ЭДО', id: 'gov-revoked-event' }] : []),
    { time: '14:21', user: 'sasha', action: 'Скопирован пароль', object: 'Документооборот', id: 'gov-copy-event' },
    { time: '14:20', user: 'sasha', action: 'Открыт пароль', object: 'Документооборот' },
    { time: '14:18', user: 'marina', action: 'Выдан доступ', object: 'Саша Орлов · Просмотр' },
    ...(!filtered && !revoked ? [{ time: '14:05', user: 'ilya' as const, action: 'Изменена запись', object: 'Внутренний портал' }] : []),
  ];
  return industryJournal('Журнал действий', revoked ? 'Документооборот · история выдачи и снятия доступа' : 'Ведомственные системы · все действия с паролями', events, filtered || revoked ? 'Документооборот' : 'Все записи');
}

export function initGovernmentDashboardDemo(embed: HTMLElement, workspace: HTMLElement, options: DemoOptions = {}) {
  return initDashboardDemo(embed, workspace, {
    tabs: [['roles', 'Роли'], ['records', 'Пароли'], ['journal', 'Журнал']],
    totalSteps: 4,
    initial: { tab: 'roles', html: rolesView(), caption: 'Настраивает доступ по ролям.' },
    createCues: ({ scene, click, hold, renderView, overlay }) => [
      scene('roles', () => rolesView(), 'Настраивает доступ по ролям.', 1), hold(1200),
      click('gov-role', () => overlay(`<h4>Роль Саши Орлова</h4><span class="pw-it__menu-item" data-demo="gov-reader">Просмотр<small>Открывать и копировать пароль</small></span><span class="pw-it__menu-item">Редактор<small>Просматривать и изменять запись</small></span><span class="pw-it__menu-item">Администратор<small>Управлять записью и правами</small></span>`)),
      click('gov-reader', () => renderView(rolesView('granted'))), hold(2000),

      scene('records', () => recordsView(), 'Хранит пароли ведомственных систем.', 2),
      click('gov-document', () => renderView(industryPassword('Документооборот', 'Саша Орлов · роль «Просмотр»', 'edo_operator', 'edo.intra'))), hold(1200),
      click('copy-industry-password', () => renderView(industryPassword('Документооборот', 'Саша Орлов · роль «Просмотр»', 'edo_operator', 'edo.intra', true))), hold(1800),

      scene('journal', () => journalView(), 'Фиксирует все действия с паролями.', 3),
      click('industry-record-filter', () => overlay(`<span class="pw-label">Запись</span><span class="pw-it__menu-item" data-demo="gov-filter-document">Документооборот</span><span class="pw-it__menu-item">Внутренний портал</span><span class="pw-it__menu-item">Почтовый сервер</span>`)),
      click('gov-filter-document', () => renderView(journalView(true))), hold(1300),
      click('gov-copy-event', () => overlay(`<h4>Скопирован пароль</h4>${person('sasha')}${field('Запись', 'Документооборот')}${field('Время', 'Сегодня, 14:21')}${field('Роль', 'Просмотр')}${field('IP-адрес', '10.20.0.14')}`)), hold(2400),

      scene('roles', () => rolesView('granted'), 'Снимает доступ и сохраняет историю.', 4),
      click('gov-revoke', () => overlay(`<h4>Снять доступ?</h4><p>Саша Орлов больше не сможет открывать пароль системы документооборота.</p>${action('gov-confirm-revoke', 'Снять доступ', true)}`)),
      click('gov-confirm-revoke', () => renderView(rolesView('revoked'))), hold(1600),
      click('tab-journal', () => {
        workspace.querySelectorAll('.pw-it__tabs .pw-tab').forEach((tab) => tab.classList.toggle('is-active', tab.getAttribute('data-demo') === 'tab-journal'));
        renderView(journalView(true, true));
      }), hold(2600),
    ],
  }, options);
}
