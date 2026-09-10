import { action, chevron, field, heading, icon, person, result } from './dashboard-demo-ui';
import type { PersonKey } from './dashboard-shared';

export type IndustryEvent = { time: string; user: PersonKey; action: string; object: string; id?: string };

export function industryRecords(title: string, subtitle: string, records: { id: string; name: string; detail: string; label: string }[]) {
  return heading(title, subtitle) + `<div class="pw-industry__records"><div class="pw-label pw-industry__record-head"><span>Название</span><span>Назначение</span><span>Доступ</span></div>${records.map((record) => `<div class="pw-industry__record" data-demo="${record.id}"><span>${icon('copy')}<strong>${record.name}</strong></span><span>${record.detail}</span><span class="pw-industry__tag">${record.label}</span></div>`).join('')}</div><div class="pw-it__feedback">Пароли хранятся в общем сейфе с разграничением прав</div>`;
}

export function industryPassword(name: string, subtitle: string, login: string, address: string, copied = false) {
  return heading(name, subtitle) + `<div class="pw-tabs pw-it__record-tabs"><span class="pw-tab is-active">Данные пароля</span><span class="pw-tab">История действий</span><span class="pw-tab">Редакции</span></div>` +
    field('Логин', login, icon('copy')) + field('Пароль', '<span class="pw-it__secret">••••••••••••••••</span>', action('copy-industry-password', icon('copy') + 'Копировать')) + field('URL-адрес', `<span class="pw-it__link">${address}</span>`) +
    `<div class="pw-it__feedback">${copied ? result('Пароль скопирован · действие записано в журнал') : 'Действия с записью фиксируются в журнале'}</div>`;
}

export function industryJournal(title: string, subtitle: string, rows: IndustryEvent[], filterLabel = 'Все записи') {
  return heading(title, subtitle) + `<div class="pw-it__filters"><span class="pw-it__select">Сегодня${chevron}</span><span class="pw-it__select" data-demo="industry-record-filter">${filterLabel}${chevron}</span></div><div class="pw-it__journal pw-industry__journal"><div class="pw-label pw-it__journal-head"><span>Время</span><span>Пользователь</span><span>Действие</span><span>Объект</span></div>${rows.map((row) => `<div class="pw-it__journal-row"${row.id ? ` data-demo="${row.id}"` : ''}><span>${row.time}<small>Сегодня</small></span>${person(row.user)}<span>${row.action}<small class="pw-it__mobile-object">${row.object}</small></span><span>${row.object}</span></div>`).join('')}</div><div class="pw-it__overlay-slot"></div>`;
}
