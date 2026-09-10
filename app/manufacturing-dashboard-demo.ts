import { initDashboardDemo, type DemoOptions } from './dashboard-demo-engine';
import { action, chevron, field, heading, icon, option, person, result, toggle } from './dashboard-demo-ui';
import { industryJournal, industryPassword, industryRecords, type IndustryEvent } from './industry-dashboard-ui';

function systemsView() {
  return industryRecords('Технические системы', 'Технологическая сеть · Линия № 1', [
    { id: 'plant-scada', name: 'SCADA · Линия № 1', detail: 'Инженеры АСУ ТП', label: 'Редактор' },
    { id: 'plant-gateway', name: 'Сервисный шлюз', detail: 'Сервисная группа', label: 'По роли' },
    { id: 'plant-station', name: 'Станция инженера', detail: 'Техническое обслуживание', label: 'По роли' },
  ]);
}

function changesView(compared = false) {
  const version = (current: boolean) => `<div class="pw-industry__version"><span class="pw-label">Версия ${current ? '12 · текущая' : '11'}</span>${field('Логин', 'scada_service')}${field('Пароль', '<span class="pw-it__secret">••••••••••••</span>')}<div class="pw-industry__version-author">${person(current ? 'ilya' : 'marina')}<small>${current ? 'Сегодня, 09:42' : 'Вчера, 16:10'}</small></div></div>`;
  return heading('История пароля', 'SCADA · Линия № 1', action('plant-compare', 'Сравнить версии')) +
    `<div class="pw-industry__versions${compared ? ' is-comparing' : ''}">${compared ? version(false) : ''}${version(true)}</div>
    <div class="pw-it__feedback">${compared ? result('Пароль изменил Илья Смирнов · предыдущая версия сохранена') : 'Сохраняются время изменения и автор каждой версии'}</div>`;
}

function rotationView(enabled = false, saved = false) {
  return heading('Политика ротации', 'Сервисный шлюз · Линия № 1') +
    option('plant-rotation-row', 'Напоминать о смене пароля', 'Уведомлять ответственных инженеров', toggle('plant-rotation', enabled)) +
    `<div class="pw-industry__rotation-fields">${field('Период', '<span class="pw-it__select">30 дней' + chevron + '</span>')}${field('Напомнить за', '<span class="pw-it__select">3 дня' + chevron + '</span>')}</div>
    <div class="pw-it__form-actions">${action('plant-save-rotation', saved ? 'Политика сохранена' : 'Сохранить политику', !saved)}</div>
    ${saved ? `<div class="pw-it__notice">${icon('check')}<div><strong>Пароль сервисного шлюза пора обновить</strong><p>До плановой ротации — 3 дня · инженеры АСУ ТП уведомлены</p></div></div>` : ''}`;
}

function alertView(detail = false) {
  return heading('Подозрительная активность', 'Линия № 1 · сегодня') +
    `<div class="pw-industry__alert" data-demo="plant-alert"><span class="pw-industry__alert-icon">${icon('eye')}</span><div><strong>Массовое открытие паролей</strong><p>Саша Орлов · 8 записей за 1 минуту</p></div><span>10:14</span></div>` +
    (detail ? `<div class="pw-industry__alert-details">${person('sasha')}${field('Роль', 'Просмотр')}${field('Сейф', 'Линия № 1')}${field('Событие', 'Открыты 8 записей')}</div><div class="pw-it__feedback">${result('Для проверки доступны журнал и история каждой записи')}</div>` :
      `<div class="pw-industry__recent"><span class="pw-label">Последние действия</span><div><time>10:14</time><span>Открыт пароль SCADA</span>${person('sasha')}</div><div><time>10:05</time><span>Изменена политика ротации</span>${person('marina')}</div><div><time>09:42</time><span>Изменён пароль SCADA</span>${person('ilya')}</div></div>`);
}

function journalView(filtered = false) {
  const events: IndustryEvent[] = [
    { time: '10:14', user: 'sasha', action: 'Открыт пароль', object: 'SCADA · Линия № 1', id: 'plant-open-event' },
    ...(!filtered ? [{ time: '10:05', user: 'marina' as const, action: 'Изменена политика', object: 'Сервисный шлюз' }] : []),
    { time: '09:42', user: 'ilya', action: 'Изменён пароль', object: 'SCADA · Линия № 1' },
    { time: '09:30', user: 'ilya', action: 'Скопирован пароль', object: 'SCADA · Линия № 1' },
  ];
  return industryJournal('Журнал действий', 'Технологическая сеть · Линия № 1', events, filtered ? 'SCADA' : 'Все записи');
}

export function initManufacturingDashboardDemo(embed: HTMLElement, workspace: HTMLElement, options: DemoOptions = {}) {
  return initDashboardDemo(embed, workspace, {
    tabs: [['systems', 'Системы'], ['changes', 'Изменения'], ['rotation', 'Ротация'], ['journal', 'Журнал']],
    totalSteps: 5,
    initial: { tab: 'systems', html: systemsView(), caption: 'Разделяет доступ к техническим системам.' },
    createCues: ({ scene, click, hold, renderView, overlay }) => [
      scene('systems', () => systemsView(), 'Разделяет доступ к техническим системам.', 1), hold(1400),
      click('plant-scada', () => renderView(industryPassword('SCADA · Линия № 1', 'Илья Смирнов · инженер АСУ ТП · редактор', 'scada_service', 'scada.line-1.intra'))), hold(1100),
      click('copy-industry-password', () => renderView(industryPassword('SCADA · Линия № 1', 'Илья Смирнов · инженер АСУ ТП · редактор', 'scada_service', 'scada.line-1.intra', true))), hold(1800),

      scene('changes', () => changesView(), 'Показывает изменения и историю пароля.', 2),
      click('plant-compare', () => renderView(changesView(true))), hold(2500),

      scene('rotation', () => rotationView(), 'Напоминает о ротации по заданной политике.', 3),
      click('plant-rotation', () => renderView(rotationView(true))),
      click('plant-save-rotation', () => renderView(rotationView(true, true))), hold(2400),

      scene('journal', () => alertView(), 'Уведомляет о подозрительной активности.', 4),
      click('plant-alert', () => renderView(alertView(true))), hold(2600),

      scene('journal', () => journalView(), 'Сохраняет действия пользователей в журнале.', 5),
      click('industry-record-filter', () => overlay(`<span class="pw-label">Запись</span><span class="pw-it__menu-item" data-demo="plant-filter-scada">SCADA · Линия № 1</span><span class="pw-it__menu-item">Сервисный шлюз</span><span class="pw-it__menu-item">Станция инженера</span>`)),
      click('plant-filter-scada', () => renderView(journalView(true))), hold(1200),
      click('plant-open-event', () => overlay(`<h4>Открыт пароль SCADA</h4>${person('sasha')}${field('Время', 'Сегодня, 10:14')}${field('Роль', 'Просмотр')}${field('Сейф', 'Линия № 1')}${field('Источник', 'Рабочая станция')}`)), hold(2500),
    ],
  }, options);
}
