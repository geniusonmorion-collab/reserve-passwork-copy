import { DASHBOARD_ICONS as icons, type PersonKey } from './dashboard-shared';
import { initDashboardDemo, type DemoOptions } from './dashboard-demo-engine';
import { icon, action, chevron, person, heading, field, toggle, option, result } from './dashboard-demo-ui';

function accessView(editor = false, revoked = false) {
  return heading('Права доступа', `Доступы к серверам · ${revoked ? 32 : 33} пользователя`) +
    `<div class="pw-it__access-table"><div class="pw-label pw-it__access-head"><span>Пользователь</span><span>Роль в папке</span><span>Доступ</span></div>
    <div class="pw-it__access-row">${person('marina')}<span>Администратор</span><span class="pw-it__muted">Все права</span></div>
    <div class="pw-it__access-row${revoked ? ' is-revoked' : ''}">${person('ilya')}<span>Редактор</span>${revoked ? '<span>Доступ отозван</span>' : action('revoke', 'Отозвать доступ')}</div>
    <div class="pw-it__access-row">${person('sasha')}<span class="pw-it__select" data-demo="role">${editor ? 'Редактор' : 'Просмотр'}${chevron}</span><span class="pw-it__muted">${editor ? 'Просмотр и изменение' : 'Только просмотр'}</span></div></div>
    <div class="pw-it__feedback">${editor ? result('Роль Саши Орлова обновлена') : 'Роль определяет действия с записями в этой папке'}</div><div class="pw-it__overlay-slot"></div>`;
}

function recordsView(moved = false) {
  return heading('Пароли', moved ? 'Общая папка · Доступы к серверам' : 'Входящие · 3 записи', action('move', 'Переместить')) +
    `<div class="pw-it__records">
      <div class="pw-it__record is-selected" data-demo="record"><span class="pw-it__checkbox">${icon('check')}</span><span class="pw-it__service pw-it__service--sprint">${icons.sprint}</span><span>Sprinthost<small>${moved ? 'Администрирование / Доступы к серверам' : 'Получено от Марины Ковалёвой'}</small></span><span class="pw-it__tag">Admin</span></div>
      <div class="pw-it__record"><span class="pw-it__checkbox"></span><span class="pw-it__service">${icons.astra}</span><span>Astra Linux<small>admin@astra.local</small></span><span class="pw-it__tag">Admin</span></div>
      <div class="pw-it__record"><span class="pw-it__checkbox"></span><span class="pw-it__service pw-it__service--cloud">${icons.cloud}</span><span>Site24x7 Monitoring<small>monitoring@company.ru</small></span></div>
    </div><div class="pw-it__feedback">${moved ? result('Sprinthost перемещён в общую папку') : 'Выбрана 1 запись'}</div><div class="pw-it__overlay-slot"></div>`;
}

function journalView(openedOnly = false) {
  const rows: [string, PersonKey, string, string][] = openedOnly ? [
    ['14:39', 'sasha', 'Открыт пароль', 'Sprinthost'],
    ['14:32', 'marina', 'Открыт пароль', 'Sprinthost'],
    ['14:06', 'ilya', 'Открыт пароль', 'Sprinthost'],
  ] : [
    ['14:38', 'marina', 'Перемещён пароль', 'Sprinthost'],
    ['14:37', 'marina', 'Отозван доступ', 'Илья Смирнов'],
    ['14:36', 'marina', 'Изменена роль', 'Саша Орлов · Редактор'],
    ['14:32', 'marina', 'Открыт пароль', 'Sprinthost'],
    ['14:28', 'ilya', 'Изменён пароль', 'Astra Linux'],
  ];
  return heading('История действий', openedOnly ? 'Sprinthost · доступ к записи' : 'Доступы к серверам · все события') +
    `<div class="pw-it__filters"><span class="pw-it__select">Сегодня${chevron}</span><span class="pw-it__select" data-demo="user-filter">Все пользователи${chevron}</span><span class="pw-it__select" data-demo="event-filter">${openedOnly ? 'Открыт пароль' : 'Все действия'}${chevron}</span></div>
    <div class="pw-it__journal"><div class="pw-label pw-it__journal-head"><span>Время</span><span>Пользователь</span><span>Действие</span><span>Объект</span></div>${rows.map(([time, key, label, object], index) => `<div class="pw-it__journal-row" data-demo="event-${index}"><span>${time}<small>Сегодня</small></span>${person(key)}<span>${label}<small class="pw-it__mobile-object">${object}</small></span><span>${object}</span></div>`).join('')}</div><div class="pw-it__overlay-slot"></div>`;
}

function rotationView(enabled = false, saved = false) {
  return heading('Политика ротации', 'Доступы к серверам') +
    option('rotation-row', 'Напоминать о смене паролей', 'Пользователи получат уведомление до окончания срока', toggle('rotation', enabled)) +
    field('Период ротации', '<span class="pw-it__select">30 дней' + chevron + '</span>') +
    field('Напомнить за', '<span class="pw-it__select">3 дня' + chevron + '</span>') +
    `<div class="pw-it__form-actions">${action('save-rotation', 'Сохранить', true)}</div>` +
    (saved ? `<div class="pw-it__notice">${icon('check')}<div><strong>Пора обновить пароль Sprinthost</strong><p>До плановой ротации осталось 3 дня</p></div></div>` : '');
}

function securityView(twoFactor = false, saved = false) {
  return heading('Безопасность', 'Политики для пользователей компании') +
    option('two-factor-row', 'Двухфакторная аутентификация', 'Запрашивать одноразовый код при входе', toggle('two-factor', twoFactor)) +
    field('Применить к', '<span class="pw-it__select">Все пользователи' + chevron + '</span>') +
    field('Способ подтверждения', 'Приложение-аутентификатор') +
    `<div class="pw-it__form-actions">${action('save-security', 'Сохранить', true)}</div>` +
    (saved ? `<div class="pw-it__notice">${icon('check')}<div><strong>2ФА обязательна для всех пользователей</strong><p>Следующий вход — с подтверждением кодом</p></div></div>` : '');
}

function ssoView(connected = false) {
  return heading('Единый вход', 'Аутентификация пользователей через SSO') +
    `<div class="pw-it__sso"><div>${field('Протокол', 'SAML 2.0')}${field('Провайдер', 'Корпоративный SSO')}${field('Статус', 'Подключён')}</div>
    <div class="pw-it__login"><span class="pw-it__login-title">Вход в Пассворк</span><span class="pw-it__muted">Рабочая учётная запись</span>${connected ? result('Вход выполнен') : action('sso-login', 'Войти через SSO', true)}<small>${connected ? 'Марина Ковалёва · company.ru' : 'Используйте корпоративный аккаунт'}</small></div></div>`;
}

function passwordView(tab: 'data' | 'files' | 'notes' = 'data', attached = false) {
  const tabs = `<div class="pw-tabs pw-it__record-tabs"><span class="pw-tab${tab === 'data' ? ' is-active' : ''}" data-demo="data">Данные пароля</span><span class="pw-tab${tab === 'files' ? ' is-active' : ''}" data-demo="files">Файлы</span><span class="pw-tab${tab === 'notes' ? ' is-active' : ''}" data-demo="notes">Заметки</span><span class="pw-tab" data-demo="record-history">История действий</span></div>`;
  const content = tab === 'files' ? `<div class="pw-it__attachment">${icon('copy')}<div><strong>Инструкция по подключению.pdf</strong><small>PDF · 248 КБ</small></div>${result('Сохранён')}</div><div class="pw-it__feedback">Файлы доступны пользователям с правами на эту запись</div>` : tab === 'notes' ? `<div class="pw-it__note"><span class="pw-label">Заметка к записи</span><p>Рабочий сервер команды.</p><p>Для подключения используйте корпоративный VPN.<br />Ответственная — Марина Ковалёва.</p><span class="pw-it__muted">Изменено сегодня, 14:40</span></div>` :
    field('Логин', 'admin@company.ru', icon('copy')) + field('Пароль', '<span class="pw-it__secret">••••••••••••••••</span>', icon('eye') + icon('copy')) + field('URL-адрес', '<span class="pw-it__link">sprinthost.ru</span>', icon('copy')) + field('TOTP', '<span class="pw-it__secret">866 441</span>', icon('copy')) + (attached ? field('Файлы', 'Инструкция по подключению.pdf') : '');
  return heading('Sprinthost', 'Общая папка · Доступы к серверам', action('share', icon('share') + 'Поделиться')) + tabs + content + '<div class="pw-it__overlay-slot"></div>';
}

function devicesView(open = false) {
  return heading('Пассворк всегда под рукой', 'Общие сейфы в браузере и мобильном приложении') +
    `<div class="pw-it__devices"><div class="pw-it__browser"><div class="pw-label pw-it__device-bar">Расширение для браузера</div><div class="pw-it__device-content"><strong>Sprinthost</strong><span class="pw-it__muted">sprinthost.ru</span>${field('Логин', 'admin@company.ru')}${field('Пароль', '<span class="pw-it__secret">••••••••••••</span>')}${action('autofill', 'Заполнить', true)}<div class="pw-it__autofill-result"></div></div></div>
    <div class="pw-it__phone"><div class="pw-it__device-bar">Пассворк<span>9:41</span></div><div class="pw-it__device-content">${open ? `<strong>Sprinthost</strong><span class="pw-it__muted">Доступы к серверам</span>${field('Логин', 'admin@company.ru')}${field('Пароль', '<span class="pw-it__secret">••••••••••</span>')}${result('Синхронизировано')}` : `<strong>Общие сейфы</strong><span class="pw-it__muted">Доступы к серверам</span><span class="pw-it__phone-record" data-demo="phone-record">${icons.sprint}<span>Sprinthost</span>${chevron}</span><span class="pw-it__phone-record">${icons.astra}<span>Astra Linux</span>${chevron}</span><span class="pw-it__phone-record">${icons.cloud}<span>Site24x7</span>${chevron}</span>`}</div></div></div>`;
}

export function initItDashboardDemo(embed: HTMLElement, workspace: HTMLElement, options: DemoOptions = {}) {
  return initDashboardDemo(embed, workspace, {
    tabs: [['records', 'Пароли'], ['access', 'Права доступа'], ['history', 'История действий'], ['settings', 'Настройки']],
    totalSteps: 12,
    initial: { tab: 'history', html: journalView(), caption: 'Полный журнал действий пользователей.' },
    createCues: ({ scene, click, hold, renderView, overlay, q }) => [
    scene('access', () => accessView(), 'Выдаёт доступы по ролям.', 1), hold(1100),
    click('role', () => overlay(`<span class="pw-label">Роль Саши Орлова</span><span class="pw-it__menu-item">Просмотр<small>Открывать и копировать пароли</small></span><span class="pw-it__menu-item" data-demo="editor">Редактор<small>Просматривать и изменять записи</small></span><span class="pw-it__menu-item">Администратор<small>Управлять записями и доступом</small></span>`)),
    click('editor', () => renderView(accessView(true))), hold(),

    scene('access', () => accessView(true), 'Забирает их при уходе.', 2),
    click('revoke', () => overlay(`<h4>Отозвать доступ?</h4><p>Илья Смирнов потеряет доступ к паролям в папке «Доступы к серверам».</p>${action('confirm-revoke', 'Отозвать доступ', true)}`)),
    click('confirm-revoke', () => {
      renderView(accessView(true, true));
      const count = embed.querySelector('.pw-people__text span');
      if (count) count.textContent = '32 пользователя';
      const avatar = embed.querySelector<HTMLElement>('.pw-avatars .pw-avatar:nth-child(2)');
      if (avatar) avatar.style.opacity = '.35';
    }), hold(),

    scene('records', () => recordsView(), 'Складывает пароли в общие папки.', 3),
    click('move', () => overlay(`<h4>Переместить пароль</h4><span class="pw-label">Общие сейфы</span><span class="pw-it__menu-item">Администрирование</span><span class="pw-it__menu-item" data-demo="shared-folder">Доступы к серверам${chevron}</span>`)),
    click('shared-folder', () => overlay(`<h4>Доступы к серверам</h4><p>Общая папка · 32 пользователя<br />Запись унаследует права этой папки.</p>${action('confirm-move', 'Переместить сюда', true)}`)),
    click('confirm-move', () => renderView(recordsView(true))), hold(),

    scene('history', () => journalView(), 'Пишет журнал действий.', 4),
    click('event-0', () => {
      q('event-0')?.classList.add('is-selected');
      overlay(`<h4>Перемещён пароль</h4>${person('marina')}<p>Сегодня, 14:38</p>${field('Запись', 'Sprinthost')}${field('Из папки', 'Входящие')}${field('В папку', 'Доступы к серверам')}`);
    }), hold(2200),

    scene('settings', () => rotationView(), 'Напоминает о ротации.', 5),
    click('rotation', () => renderView(rotationView(true))),
    click('save-rotation', () => renderView(rotationView(true, true))), hold(2200),

    scene('settings', () => securityView(), 'Требует 2ФА.', 6),
    click('two-factor', () => renderView(securityView(true))),
    click('save-security', () => renderView(securityView(true, true))), hold(),

    scene('settings', () => ssoView(), 'Пускает через SSO.', 7), hold(900),
    click('sso-login', () => renderView(ssoView(true))), hold(2200),

    scene('records', () => passwordView('data', true), 'Хранит файлы и заметки.', 8),
    click('files', () => renderView(passwordView('files'))), hold(1300),
    click('notes', () => renderView(passwordView('notes'))), hold(2200),

    scene('records', () => passwordView(), 'Делится доступом по ссылке.', 9),
    click('share', () => overlay(`<h4>Поделиться паролем</h4>${field('Права', 'Только просмотр')}${field('Срок действия', '7 дней')}${action('create-link', 'Создать ссылку', true)}`)),
    click('create-link', () => overlay(`<h4>Ссылка на Sprinthost</h4><p>Только просмотр · действует 7 дней</p><div class="pw-it__link-field">passwork.company.ru/s/••••••</div>${action('copy-link', icon('copy') + 'Скопировать ссылку', true)}<div class="pw-it__feedback" data-demo="link-result"></div>`)),
    click('copy-link', () => { q('link-result')!.innerHTML = result('Ссылка скопирована'); }), hold(),

    scene('records', () => passwordView(), 'Показывает, кто открывал пароль.', 10),
    click('record-history', () => renderView(journalView())),
    click('event-filter', () => overlay(`<span class="pw-label">Действие</span><span class="pw-it__menu-item" data-demo="opened">${icon('eye')}Открыт пароль</span><span class="pw-it__menu-item">${icon('edit')}Изменён пароль</span><span class="pw-it__menu-item">${icon('copy')}Скопирован пароль</span>`)),
    click('opened', () => renderView(journalView(true))), hold(2200),

    scene('records', () => devicesView(), 'Работает в браузере и на телефоне.', 11),
    click('autofill', () => { workspace.querySelector('.pw-it__autofill-result')!.innerHTML = result('Данные заполнены'); }), hold(900),
    click('phone-record', () => renderView(devicesView(true))), hold(2600),

    scene('history', () => journalView(), 'И многое другое.', 12), hold(2400),
  ],
  }, options);
}
