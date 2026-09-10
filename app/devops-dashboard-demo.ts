import { initDashboardDemo, type DemoOptions } from './dashboard-demo-engine';
import { action, chevron, field, heading, icon, option, result, toggle } from './dashboard-demo-ui';

type Environment = 'Production' | 'Staging' | 'Development';
type TokenState = 'empty' | 'active' | 'revoked';

function environmentsView(environment: Environment = 'Production') {
  const counts = { Production: 12, Staging: 8, Development: 6 };
  return heading('Секреты окружения', `${environment} · ${counts[environment]} записей`) +
    `<div class="pw-devops__environments">${(['Production', 'Staging', 'Development'] as const).map((name) => `<span class="pw-it__button${name === environment ? ' is-active' : ''}" data-demo="env-${name}">${name}</span>`).join('')}</div>
    <div class="pw-devops__secrets"><div class="pw-label pw-devops__secret-head"><span>Название</span><span>Значение</span><span>Обновлён</span></div>
    ${['DATABASE_URL', 'REGISTRY_TOKEN', 'DEPLOY_KEY'].map((name, i) => `<div class="pw-devops__secret-row"><span>${icon('copy')}<span>${name}<small>${environment.toLowerCase()} / ${i === 0 ? 'database' : i === 1 ? 'registry' : 'deployment'}</small></span></span><span class="pw-it__secret">••••••••••••••••</span><span>${i === 1 ? 'Сегодня, 03:00' : 'Вчера, 18:24'}</span></div>`).join('')}</div>
    <div class="pw-it__feedback">${result('Каждое окружение — отдельный сейф со своими правами')}</div>`;
}

function tokenView(state: TokenState = 'empty') {
  return heading('Токен для сборки', 'CI/CD · deploy-production · #248') +
    `<div class="pw-devops__token-layout"><div>${field('Сейф и запись', 'Production / DEPLOY_KEY')}${field('Права', 'Только чтение')}${field('Срок действия', '<span class="pw-it__select">15 минут' + chevron + '</span>')}
      <div class="pw-it__form-actions">${state === 'empty' ? action('create-token', 'Выдать токен', true) : result(state === 'active' ? 'Токен выдан сборке #248' : 'Доступ к секрету закрыт')}</div></div>
      <div class="pw-devops__token-card${state === 'revoked' ? ' is-revoked' : ''}"><span class="pw-label">Сервисный доступ</span><strong>deploy-production</strong>
        <span class="pw-devops__token-state">${state === 'empty' ? 'Токен ещё не выдан' : state === 'active' ? 'Активен' : 'Отозван'}</span>
        <code>${state === 'empty' ? '—' : '•••• •••• •••• ••••'}</code><span class="pw-it__muted">${state === 'revoked' ? 'Сборка #248 завершена' : 'Только Production / DEPLOY_KEY'}</span>
        <div class="pw-devops__token-validity">${state === 'active' ? 'Выдан в 14:00 · до 14:15' : state === 'revoked' ? 'Доступ отозван в 14:06' : 'Доступ ограничен временем сборки'}</div>
      </div></div>`;
}

function integrationView(mode: 'api' | 'cli' = 'api', complete = false) {
  const output = mode === 'api'
    ? `<span class="pw-devops__code-status">200 OK</span><pre>{\n  "name": "DEPLOY_KEY",\n  "vault": "Production",\n  "value": "••••••••••••••••"\n}</pre>`
    : `<pre><span class="pw-devops__code-status">[passwork]</span> Секрет DEPLOY_KEY получен\n<span class="pw-devops__code-status">[deploy]</span> Подключение к Production\n<span class="pw-devops__code-status">[deploy]</span> Сборка #248 выполнена</pre>`;
  return heading('Получение секрета', 'Production / DEPLOY_KEY · только чтение') +
    `<div class="pw-devops__integration-tabs"><span class="pw-it__button${mode === 'api' ? ' is-active' : ''}" data-demo="mode-api">API</span><span class="pw-it__button${mode === 'cli' ? ' is-active' : ''}" data-demo="mode-cli">CLI</span><span class="pw-it__muted">Токен сборки #248</span></div>
    <div class="pw-devops__console"><div class="pw-devops__console-head"><span>${mode === 'api' ? 'API · запрос секрета' : 'CLI · deploy.sh'}</span><span>${complete ? 'Выполнено' : 'Готово к запуску'}</span></div>
      <div class="pw-devops__console-body">${mode === 'api'
        ? '<div class="pw-devops__request"><span class="pw-devops__method">GET</span><span>Production / DEPLOY_KEY</span></div><div class="pw-devops__auth">Authorization: Bearer ••••••••••••</div>'
        : '<div class="pw-devops__command"><span>$</span><code data-demo="cli-command">./deploy.sh --env production</code></div>'}
        <div class="pw-devops__output">${complete ? output : '<span class="pw-it__muted">Ожидание выполнения…</span>'}</div>
      </div></div><div class="pw-devops__console-actions">${action(mode === 'api' ? 'run-api' : 'run-cli', mode === 'api' ? 'Отправить запрос' : 'Выполнить', true)}${complete ? result(mode === 'api' ? 'Секрет получен по API' : 'Секрет передан в сборку через CLI') : ''}</div>`;
}

function rotationView(enabled = false, saved = false) {
  return heading('Ротация ключей', 'Production / REGISTRY_TOKEN') +
    option('rotation-setting', 'Менять ключ по расписанию', 'Новая версия заменит ключ в сейфе', toggle('devops-rotation', enabled)) +
    `<div class="pw-devops__rotation-fields">${field('Период', '<span class="pw-it__select">Каждые 30 дней' + chevron + '</span>')}${field('Время', '<span class="pw-it__select">03:00 · МСК' + chevron + '</span>')}</div>
    <div class="pw-it__form-actions">${action('save-schedule', saved ? 'Расписание сохранено' : 'Сохранить расписание', !saved)}</div>
    <div class="pw-devops__rotation-history"><span class="pw-label">Последняя ротация</span><div><span class="pw-devops__version">v13</span><span class="pw-it__muted">→</span><span class="pw-devops__version is-current">v14</span><span>Сегодня, 03:00</span>${result('Ключ обновлён')}</div></div>
    ${saved ? `<div class="pw-it__feedback">${result('Расписание включено · следующая ротация через 30 дней')}</div>` : ''}`;
}

function journalView() {
  const rows = [
    ['14:06', 'Сборка #248', 'Токен отозван', 'deploy-production'],
    ['14:05', 'CI runner · CLI', 'Получен секрет', 'DEPLOY_KEY'],
    ['14:04', 'CI runner · API', 'Получен секрет', 'DEPLOY_KEY'],
    ['14:00', 'Марина Ковалёва', 'Выдан токен', 'deploy-production'],
    ['03:00', 'По расписанию', 'Ключ обновлён', 'REGISTRY_TOKEN'],
  ];
  return heading('Журнал обращений', 'Production · все обращения к секретам') +
    `<div class="pw-it__filters"><span class="pw-it__select">Сегодня${chevron}</span><span class="pw-it__select">Все события${chevron}</span></div>
    <div class="pw-it__journal pw-devops__journal"><div class="pw-label pw-it__journal-head"><span>Время</span><span>Источник</span><span>Действие</span><span>Объект</span></div>
    ${rows.map(([time, source, event, object], index) => `<div class="pw-it__journal-row"${index === 2 ? ' data-demo="api-event"' : ''}><span>${time}<small>Сегодня</small></span><span>${source}</span><span>${event}<small class="pw-it__mobile-object">${object}</small></span><span>${object}</span></div>`).join('')}</div><div class="pw-it__overlay-slot"></div>`;
}

export function initDevopsDashboardDemo(embed: HTMLElement, workspace: HTMLElement, options: DemoOptions = {}) {
  const setEnvironment = (environment: Environment) => {
    const crumb = embed.querySelector('.pw-crumbs b');
    if (crumb) crumb.textContent = environment;
    embed.querySelectorAll<HTMLElement>('[data-environment]').forEach((row) => {
      row.classList.toggle('pw-tree-row--active', row.dataset.environment === environment);
    });
  };

  return initDashboardDemo(embed, workspace, {
    tabs: [['secrets', 'Секреты'], ['integrations', 'API и CLI'], ['tokens', 'Токены'], ['history', 'Журнал']],
    totalSteps: 6,
    initial: { tab: 'secrets', html: environmentsView(), caption: 'Держит окружения в разных сейфах.' },
    createCues: ({ scene, click, hold, renderView, overlay, q }) => [
      scene('secrets', () => environmentsView(), 'Держит окружения в разных сейфах.', 1), hold(1000),
      click('env-Staging', () => { setEnvironment('Staging'); renderView(environmentsView('Staging')); }), hold(1500),
      click('env-Production', () => { setEnvironment('Production'); renderView(environmentsView()); }), hold(1500),

      scene('tokens', () => tokenView(), 'Выдаёт токен на время сборки.', 2),
      click('create-token', () => renderView(tokenView('active'))), hold(2400),

      scene('integrations', () => integrationView(), 'Отдаёт секрет по API. И через CLI.', 3),
      click('run-api', () => renderView(integrationView('api', true))), hold(2100),
      click('mode-cli', () => { renderView(integrationView('cli')); q('cli-command')!.textContent = ''; }),
      { duration: 1300, frame: (progress) => { q('cli-command')!.textContent = './deploy.sh --env production'.slice(0, Math.ceil(progress * 27)); } },
      click('run-cli', () => renderView(integrationView('cli', true))), hold(2600),

      scene('secrets', () => rotationView(), 'Меняет ключи по расписанию.', 4),
      click('devops-rotation', () => renderView(rotationView(true))),
      click('save-schedule', () => renderView(rotationView(true, true))), hold(2500),

      scene('tokens', () => tokenView('active'), 'Сборка завершена — доступ к секретам закрыт.', 5), hold(1400),
      { duration: 300, start: () => renderView(tokenView('revoked')) }, hold(2400),

      scene('history', () => journalView(), 'Помнит каждое обращение.', 6), hold(1200),
      click('api-event', () => overlay(`<h4>Секрет получен по API</h4>${field('Источник', 'CI runner')}${field('Сборка', '#248')}${field('Запись', 'DEPLOY_KEY')}${field('Сейф', 'Production')}${field('Результат', '200 OK')}<p>Сегодня, 14:04 · токен deploy-production</p>`)), hold(3000),
    ],
  }, options);
}
