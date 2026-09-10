import { DASHBOARD_ICONS as icons, DASHBOARD_PEOPLE as people, type PersonKey } from './dashboard-shared';

// These scenes are presentation-only: no credentials, requests or clipboard writes.
export const icon = (name: string) => `<span class="pw-it__icon">${icons[name]}</span>`;
export const action = (id: string, label: string, primary = false) => `<span class="pw-it__button${primary ? ' pw-it__button--primary' : ''}" data-demo="${id}">${label}</span>`;
export const chevron = '<span class="pw-audit__chevron"></span>';
export const person = (key: PersonKey) => `<span class="pw-it__person"><span class="pw-mini" style="background:${people[key].color}">${people[key].init}</span><span>${people[key].full}</span></span>`;
export const heading = (title: string, subtitle: string, control = '') => `<div class="pw-it__heading"><div><h3>${title}</h3><p>${subtitle}</p></div>${control}</div>`;
export const field = (label: string, value: string, extra = '') => `<div class="pw-it__field"><span>${label}</span><div>${value}</div>${extra}</div>`;
export const toggle = (id: string, on = false) => `<span class="pw-it__toggle${on ? ' is-on' : ''}" data-demo="${id}"><i></i></span>`;
export const option = (id: string, label: string, description: string, control: string) => `<div class="pw-it__setting" data-demo="${id}"><div><strong>${label}</strong><p>${description}</p></div>${control}</div>`;
export const result = (text: string) => `<span class="pw-it__result">${icon('check')}${text}</span>`;

