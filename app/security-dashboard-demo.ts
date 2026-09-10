import { initDashboardDemo, type DemoOptions } from './dashboard-demo-engine';
import { action, chevron, field, heading, icon, option, person, result, toggle } from './dashboard-demo-ui';
import type { PersonKey } from './dashboard-shared';

function alertsView() {
  return heading('События безопасности', 'Доступы к серверам · сегодня') +
    `<div class="pw-sec-demo__alert" data-demo="suspicious-event"><span class="pw-sec-demo__alert-icon">${icon('eye')}</span><div><strong>Массовое открытие паролей</strong><p>Саша Орлов · 12 записей за 2 минуты</p></div><span class="pw-sec-demo__badge">Требует проверки</span><time>14:32</time></div>
    <div class="pw-sec-demo__events"><div class="pw-label pw-sec-demo__event-head"><span>Время</span><span>Событие</span><span>Пользователь</span></div>
      <div class="pw-sec-demo__event"><time>14:28</time><span>${icon('edit')}Изменена запись<small>Sprinthost</small></span>${person('ilya')}</div>
      <div class="pw-sec-demo__event"><time>14:18</time><span>${icon('share')}Изменены права доступа<small>Доступы к серверам</small></span>${person('marina')}</div>
      <div class="pw-sec-demo__event"><time>13:54</time><span>${icon('copy')}Скопирован пароль<small>Astra Linux</small></span>${person('sasha')}</div>
    </div><div class="pw-it__feedback">Новые события собраны в одном месте</div>`;
}

function alertDetail() {
  return heading('Массовое открытие паролей', 'Сегодня, 14:32 · требует проверки') +
    `<div class="pw-sec-demo__incident"><div class="pw-sec-demo__incident-facts">${person('sasha')}${field('Действие', 'Открыт пароль')}${field('Записи', '12 за 2 минуты')}${field('IP-адрес', '203.0.113.24')}${field('Устройство', 'Chrome · macOS')}</div>
      <div class="pw-sec-demo__activity"><span class="pw-label">Последние открытия</span><div><time>14:32:41</time><span>Sprinthost</span></div><div><time>14:32:36</time><span>Astra Linux</span></div><div><time>14:32:18</time><span>Site24x7</span></div><div><time>14:32:03</time><span>Корпоративная почта</span></div><small>Ещё 8 записей — в журнале</small></div></div>`;
}

function journalView(filtered = false, recordOnly = false) {
  const rows: [string, PersonKey, string, string][] = recordOnly ? [
    ['14:32', 'sasha', 'Открыт пароль', 'Sprinthost'],
    ['14:28', 'ilya', 'Изменена запись', 'Sprinthost'],
    ['14:06', 'marina', 'Открыт пароль', 'Sprinthost'],
    ['13:41', 'ilya', 'Скопирован пароль', 'Sprinthost'],
  ] : filtered ? [
    ['14:32:41', 'sasha', 'Открыт пароль', 'Sprinthost'],
    ['14:32:36', 'sasha', 'Открыт пароль', 'Astra Linux'],
    ['14:32:18', 'sasha', 'Открыт пароль', 'Site24x7'],
    ['14:32:03', 'sasha', 'Открыт пароль', 'Корпоративная почта'],
  ] : [
    ['14:32', 'sasha', 'Открыт пароль', 'Sprinthost'],
    ['14:28', 'ilya', 'Изменена запись', 'Sprinthost'],
    ['14:18', 'marina', 'Изменены права', 'Доступы к серверам'],
    ['13:54', 'sasha', 'Скопирован пароль', 'Astra Linux'],
  ];
  return heading(recordOnly ? 'История доступа к записи' : 'Журнал действий', recordOnly ? 'Sprinthost · все пользователи' : filtered ? 'Саша Орлов · 12 открытий за 2 минуты' : 'Доступы к серверам · все пользователи') +
    `<div class="pw-it__filters"><span class="pw-it__select">Сегодня${chevron}</span><span class="pw-it__select" data-demo="security-user-filter">${filtered ? 'Саша Орлов' : 'Все пользователи'}${chevron}</span></div>
    <div class="pw-it__journal pw-sec-demo__journal"><div class="pw-label pw-it__journal-head"><span>Время</span><span>Пользователь</span><span>Действие</span><span>Объект</span></div>${rows.map(([time, key, event, object], index) => `<div class="pw-it__journal-row" data-demo="security-event-${index}"><span>${time}<small>Сегодня</small></span>${person(key)}<span>${event}<small class="pw-it__mobile-object">${object}</small></span><span>${object}</span></div>`).join('')}</div><div class="pw-it__overlay-slot"></div>`;
}

function changesView(selected = false, compared = false) {
  const revision = (version: number) => `<div class="pw-sec-demo__revision"><span class="pw-label">Версия ${version}${version === 8 ? ' · текущая' : ''}</span>${field('Логин', version === 8 ? 'admin@company.ru' : 'user@company.ru')}${field('Пароль', '<span class="pw-it__secret">••••••••••••</span>')}${field('URL', 'sprinthost.ru')}</div>`;
  return heading('Изменения записи', 'Sprinthost · изменил Илья Смирнов, сегодня в 14:28', action('compare-versions', 'Сравнить версии')) +
    `<div class="pw-sec-demo__versions"><div class="pw-sec-demo__version-list"><span class="pw-sec-demo__version${!selected ? ' is-active' : ''}"><strong>Версия 8</strong><small>Сегодня, 14:28</small></span><span class="pw-sec-demo__version${selected ? ' is-active' : ''}" data-demo="previous-version"><strong>Версия 7</strong><small>Вчера, 11:20</small></span></div><div class="pw-sec-demo__comparison${compared ? ' is-comparing' : ''}">${compared ? revision(7) + revision(8) : revision(selected ? 7 : 8)}</div></div>
    <div class="pw-it__feedback">${compared ? result('Изменены логин и пароль · значения паролей скрыты') : 'В истории сохранены автор, время и предыдущие версии записи'}</div>`;
}

function accessView() {
  return heading('Доступ к записи', 'Sprinthost · общий сейф «Администрирование»', action('record-access-history', 'История просмотров')) +
    `<div class="pw-sec-demo__access"><div class="pw-label pw-sec-demo__access-head"><span>Пользователь</span><span>Роль</span><span>Источник доступа</span></div>
      <div class="pw-sec-demo__access-row">${person('marina')}<span>Администратор</span><span>Права на сейф</span></div>
      <div class="pw-sec-demo__access-row">${person('ilya')}<span>Редактор</span><span>Назначено лично</span></div>
      <div class="pw-sec-demo__access-row" data-demo="review-sasha">${person('sasha')}<span>Просмотр</span><span>Права на папку</span></div>
    </div><div class="pw-it__feedback">Права на запись учитывают доступ к сейфу и папке</div><div class="pw-it__overlay-slot"></div>`;
}

function notificationView(enabled = false, saved = false) {
  return heading('Правила уведомлений', 'Доступы к серверам · администраторы сейфа') +
    option('mass-access-rule', 'Массовое открытие паролей', '10 и более записей за 2 минуты', toggle('mass-access-enabled', true)) +
    option('permission-change-rule', 'Изменение прав доступа', 'Выдача, изменение роли или отзыв доступа', toggle('notify-permissions', enabled)) +
    `<div class="pw-sec-demo__delivery">${icon('share')}<span>Получатели</span><strong>Администраторы сейфа</strong></div><div class="pw-it__form-actions">${action('save-security-rules', saved ? 'Правила сохранены' : 'Сохранить правила', !saved)}</div>
    ${saved ? `<div class="pw-it__feedback">${result('Уведомления о подозрительных действиях и изменении прав включены')}</div>` : ''}`;
}

export function initSecurityDashboardDemo(embed: HTMLElement, workspace: HTMLElement, options: DemoOptions = {}) {
  return initDashboardDemo(embed, workspace, {
    tabs: [['events', 'События'], ['journal', 'Журнал'], ['changes', 'Изменения'], ['rules', 'Правила']],
    totalSteps: 5,
    initial: { tab: 'events', html: alertsView(), caption: 'Уведомляет о подозрительных действиях.' },
    createCues: ({ scene, click, hold, renderView, overlay }) => [
      scene('events', () => alertsView(), 'Уведомляет о подозрительных действиях.', 1), hold(1400),
      click('suspicious-event', () => renderView(alertDetail())), hold(2600),

      scene('journal', () => journalView(), 'Показывает полный журнал действий пользователя.', 2),
      click('security-user-filter', () => overlay(`<span class="pw-label">Пользователь</span><span class="pw-it__menu-item">${person('marina')}</span><span class="pw-it__menu-item">${person('ilya')}</span><span class="pw-it__menu-item" data-demo="filter-sasha">${person('sasha')}</span>`)),
      click('filter-sasha', () => renderView(journalView(true))), hold(2000),
      click('security-event-0', () => overlay(`<h4>Открыт пароль Sprinthost</h4>${person('sasha')}${field('Время', '14:32:41')}${field('IP-адрес', '203.0.113.24')}${field('Устройство', 'Chrome · macOS')}${field('Роль', 'Просмотр')}`)), hold(2200),

      scene('changes', () => changesView(), 'Сохраняет историю изменений записи.', 3),
      click('previous-version', () => renderView(changesView(true))), hold(1200),
      click('compare-versions', () => renderView(changesView(true, true))), hold(2800),

      scene('journal', () => accessView(), 'Показывает, у кого есть доступ и кто открывал пароль.', 4),
      click('review-sasha', () => overlay(`<h4>Права на Sprinthost</h4>${person('sasha')}${field('Роль', 'Просмотр')}${field('Источник', 'Доступы к серверам')}<p>Можно открывать и копировать пароль.<br />Редактирование и передача доступа недоступны.</p>`)), hold(2000),
      { duration: 300, start: () => renderView(accessView()) },
      click('record-access-history', () => renderView(journalView(false, true))), hold(2300),

      scene('rules', () => notificationView(), 'Помогает следить за подозрительной активностью и правами.', 5),
      click('notify-permissions', () => renderView(notificationView(true))),
      click('save-security-rules', () => renderView(notificationView(true, true))), hold(2600),
    ],
  }, options);
}
