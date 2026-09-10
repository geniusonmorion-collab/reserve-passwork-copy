// Shared presentation data for the hero and scenario dashboards.
export type Person = { full: string; init: string; color: string };
export type PersonKey = 'marina' | 'ilya' | 'sasha';

export const DASHBOARD_CURSOR_MARKUP = '<svg class="pw-cursor__arrow" viewBox="0 0 22 22"><path d="M1 1v15.3l4.3-3.7 2.9 6.3 2.9-1.3-2.9-6.2h5.5z"/></svg>';

export const DASHBOARD_PEOPLE: Record<PersonKey, Person> = {
  marina: { full: 'Марина Ковалёва', init: 'М', color: '#ff6b4a' },
  ilya: { full: 'Илья Смирнов', init: 'И', color: '#8b7cff' },
  sasha: { full: 'Саша Орлов', init: 'С', color: '#2fcb8f' },
};

export const DASHBOARD_ICONS: Record<string, string> = {
  copy: '<svg class="pw-ico" viewBox="0 0 16 16"><rect x="5.5" y="5.5" width="8.5" height="8.5" rx="1.5"/><path d="M10.5 5.5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h2"/></svg>',
  check: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="m3 8.5 3.2 3.2L13 5"/></svg>',
  eye: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M1.5 8c1.3-3 3.6-4.7 6.5-4.7S13.2 5 14.5 8c-1.3 3-3.6 4.7-6.5 4.7S2.8 11 1.5 8z"/><circle cx="8" cy="8" r="2.1"/></svg>',
  eyeOff: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M2 2l12 12M6.6 6.7A2 2 0 0 0 9.3 9.4M4.2 4.3C2.8 5.2 1.9 6.5 1.4 8c1.2 3 3.6 4.7 6.6 4.7 1.3 0 2.5-.3 3.5-.9M7 3.4c.3 0 .7-.1 1-.1 3 0 5.4 1.7 6.6 4.7-.4 1-1 1.9-1.7 2.6"/></svg>',
  close: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
  share: '<svg class="pw-ico" viewBox="0 0 16 16"><circle cx="6.5" cy="5.2" r="2.7"/><path d="M1.8 13.5c.4-2.6 2.2-4.1 4.7-4.1 1 0 1.9.2 2.6.7M12.5 8.6v4.6M10.2 10.9h4.6"/></svg>',
  edit: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M11.3 2.5l2.2 2.2-7.6 7.6-3 .8.8-3z"/></svg>',
  more: '<svg class="pw-ico" viewBox="0 0 18 18" style="fill:currentColor;stroke:none"><circle cx="4" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/><circle cx="14" cy="9" r="1.5"/></svg>',
  star: '<svg viewBox="0 0 16 16"><path d="m8 1.9 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.7l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/></svg>',
  cloud: '<svg viewBox="0 0 20 20"><path fill="#e3e6ea" d="M5.7 15.6a3.7 3.7 0 0 1-.6-7.3 4.7 4.7 0 0 1 9.1-1.1 3.2 3.2 0 0 1 .9 6.3c-.2.1-.4.1-.6.1z"/></svg>',
  astra: '<svg viewBox="0 0 18 18"><path fill="#0b5f9b" d="M9 1l2.1 5.2 5.6.4-4.3 3.6 1.4 5.5L9 12.7l-4.8 3 1.4-5.5L1.3 6.6l5.6-.4z"/></svg>',
  sprint: '<svg viewBox="0 0 12 12"><path d="M2.6 8.3c1.6 1.3 4.5 1.5 5.8-.2.9-1.4-.5-2.4-2-2.7C5 5 3.6 4.6 3.7 3.3 3.8 2 5.7 1.4 7.3 1.9" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
};

export const DASHBOARD_ACCESS: [PersonKey, string][] = [
  ['marina', 'Администратор'],
  ['ilya', 'Редактор'],
  ['sasha', 'Просмотр'],
];
