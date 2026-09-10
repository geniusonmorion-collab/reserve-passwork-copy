/*
 * Живой дашборд в hero: один безымянный курсор плавно проходит по интерфейсу —
 * ищет запись, открывает и копирует пароль, листает журнал, смотрит права
 * на папку, раскрывает дерево — и возвращается в покой. Без персон и вкладок.
 * Сцена 1344×725 масштабируется под ширину контейнера через --pw-s.
 */

import {
  DASHBOARD_PEOPLE as PEOPLE,
  DASHBOARD_ICONS as ICONS,
  DASHBOARD_ACCESS as ACCESS,
  DASHBOARD_CURSOR_MARKUP,
  type PersonKey,
} from './dashboard-shared';
type Entry = {
  id: string;
  name: string;
  icon: 'emergency' | 'cloud' | 'py' | 'sprinthost' | 'astra';
  login: string;
  pass: string;
  urls: string[];
  totp: boolean;
  tags: string[];
  access: string;
  fav: boolean;
  dot?: boolean;
};
type Tab = 'data' | 'history' | 'versions';

const WIDTH = 1344;

/* Люди нужны только журналу действий и редакциям — это лог, а не соприсутствие. */

const ENTRIES: Entry[] = [
  { id: 'emergency', name: 'Emergency Server User', icon: 'emergency', login: 'emergency@passwork.ru', pass: 'Qw7#rT2v!mN9xB', urls: ['https://passwork.ru/'], totp: true, tags: ['Admin', 'SSH'], access: '1 отправленный пароль, 1 ссылка', fav: false, dot: true },
  { id: 'site24x7', name: 'Site24x7 Monitoring', icon: 'cloud', login: 'monitoring@passwork.ru', pass: 'zK4$pL8w@cD3hM', urls: ['https://www.site24x7.com/login'], totp: false, tags: ['Monitoring'], access: '3 отправленных пароля', fav: false },
  { id: 'perpy', name: 'Per.py', icon: 'py', login: 'deploy@per.py', pass: 'Hf6&nV1q%sY5tR', urls: ['https://per.py/'], totp: false, tags: ['DevOps'], access: 'Нет дополнительного доступа', fav: false },
  { id: 'sprinthost', name: 'Sprinthost', icon: 'sprinthost', login: 'user@passwork.ru', pass: 'hT7#kQ9v!x2mLw', urls: ['https://sprinthost.ru/', 'https://cp.sprinthost.ru/auth/login'], totp: true, tags: ['Admin', 'GIT'], access: '2 отправленных пароля, 1 ссылка, 1 ярлык', fav: true },
  { id: 'astra', name: 'Astra Linux', icon: 'astra', login: 'admin@astra.local', pass: 'Bp3!wE8c$gU4kZ', urls: ['https://astralinux.ru/'], totp: false, tags: ['Linux', 'Admin'], access: '1 ссылка, 2 ярлыка', fav: false },
];

const HISTORY: [PersonKey, string, string][] = [
  ['marina', 'просмотрела пароль', 'только что'],
  ['ilya', 'изменил пароль', 'вчера, 18:42'],
  ['sasha', 'добавил ярлык «{tag}»', '3 дня назад'],
  ['marina', 'отправила пароль пользователю A', '12 авг'],
  ['ilya', 'создал запись', '19 мая'],
];

const VERSIONS: [number, string, PersonKey, boolean?][] = [
  [4, '28 авг, 18:42', 'ilya', true],
  [3, '12 авг, 10:07', 'marina'],
  [2, '3 июл, 16:51', 'sasha'],
  [1, '19 мая, 09:30', 'marina'],
];


const glyph = (kind: Entry['icon'], large = false) => {
  const cls = `pw-glyph pw-glyph--${kind}${large ? ' pw-glyph--lg' : ''}`;
  if (kind === 'emergency') return `<span class="${cls} pw-glyph--sq">E</span>`;
  if (kind === 'py') return `<span class="${cls} pw-glyph--sq">py</span>`;
  if (kind === 'sprinthost') return `<span class="${cls}">${ICONS.sprint}</span>`;
  if (kind === 'cloud') return `<span class="${cls}">${ICONS.cloud}</span>`;
  return `<span class="${cls}">${ICONS.astra}</span>`;
};

const random = (a: number, b: number) => a + Math.random() * (b - a);

/* Сценарий: запись в покое, запись, которую находит поиск, и сам запрос. */
const HOME_ENTRY = 'sprinthost';
const FOUND_ENTRY = 'astra';
const QUERY = 'admin';

type Point = { x: number; y: number };
type Target = string | Element | (() => Element | null | undefined);
type GoOptions = { fx?: number; fy?: number; dur?: number };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
/* Плавный ход курсора: медленный старт, мягкое торможение без рывка на финише. */
const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);


export function initLiveDashboard(embed: HTMLElement, { animate = true }: { animate?: boolean } = {}): () => void {
  const stage = embed.querySelector<HTMLElement>('.pw-stage');
  const app = embed.querySelector<HTMLElement>('.pw-app');
  const itemsEl = embed.querySelector<HTMLElement>('.pw-items');
  const detailEl = embed.querySelector<HTMLElement>('.pw-detail');
  if (!stage || !app || !itemsEl || !detailEl) return () => undefined;

  const $ = <T extends Element = HTMLElement>(selector: string) => app.querySelector<T>(selector);
  const $$ = <T extends Element = HTMLElement>(selector: string) => Array.from(app.querySelectorAll<T>(selector));

  let alive = true;
  let scale = 1;
  let offscreen = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (alive) fn();
    }, ms);
    timers.add(id);
    return id;
  };

  /* ---------- масштаб под контейнер ---------- */
  const fit = () => {
    scale = embed.clientWidth / (stage.offsetWidth || WIDTH) || 1;
    embed.style.setProperty('--pw-s', String(scale));
  };
  fit();
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
  if (resizeObserver) resizeObserver.observe(embed);
  else window.addEventListener('resize', fit);

  /* ---------- состояние и рендер ---------- */
  const state = {
    entry: ENTRIES.find((e) => e.id === HOME_ENTRY) ?? ENTRIES[0],
    tab: 'data' as Tab,
    reveal: false,
    totpCode: '203 572',
    totpSlot: Math.floor(Date.now() / 30000),
    query: '',
  };

  type Hit = { entry: Entry; at?: number; hint?: string; chip?: string };
  const searchHits = (raw: string): Hit[] => {
    const q = raw.trim().toLowerCase();
    if (!q) return ENTRIES.map((entry) => ({ entry }));
    return ENTRIES.flatMap((entry): Hit[] => {
      const at = entry.name.toLowerCase().indexOf(q);
      if (at >= 0) return [{ entry, at }];
      if (entry.login.toLowerCase().includes(q)) return [{ entry, hint: entry.login }];
      const chip = entry.tags.find((tag) => tag.toLowerCase().includes(q));
      return chip ? [{ entry, chip }] : [];
    });
  };

  const itemHTML = ({ entry: e, at, hint, chip }: Hit, q: string) => {
    const name =
      at == null
        ? e.name
        : `${e.name.slice(0, at)}<mark>${e.name.slice(at, at + q.length)}</mark>${e.name.slice(at + q.length)}`;
    const extra = hint
      ? `<span class="pw-item__hint">${hint}</span>`
      : chip
        ? `<span class="pw-item__hint pw-item__hint--chip">${chip}</span>`
        : '';
    return `${e.dot ? '<i class="pw-item__dot"></i>' : ''}${glyph(e.icon)}<span>${name}</span>${extra}`;
  };

  /*
   * Список обновляется без пересборки: строки, которые перестали подходить,
   * схлопываются и исчезают; новые появляются с мягким подъёмом; остальные
   * остаются на месте и только меняют подсветку совпадения.
   */
  const renderItems = (animate = true) => {
    const q = state.query.trim();
    const hits = searchHits(q);
    const list = $('.pw-list');
    if (list) list.classList.toggle('is-searching', q.length > 0);
    const label = $('.pw-label--second');
    if (label) label.textContent = q ? `Результаты · ${hits.length}` : 'Название';

    const wanted = new Map(hits.map((hit) => [hit.entry.id, hit]));
    const existing = new Map<string, HTMLElement>();
    for (const el of Array.from(itemsEl.children) as HTMLElement[]) {
      const id = el.dataset.id;
      if (!id || el.classList.contains('is-leaving')) continue;
      if (wanted.has(id)) {
        existing.set(id, el);
      } else if (animate) {
        el.classList.add('is-leaving');
        el.style.height = `${el.offsetHeight}px`;
        el.getBoundingClientRect();
        el.style.height = '0px';
        later(() => el.remove(), 200);
      } else {
        el.remove();
      }
    }

    let cursor: HTMLElement | null = null; // последняя живая строка в порядке ENTRIES
    for (const hit of hits) {
      const id = hit.entry.id;
      let el = existing.get(id);
      if (!el) {
        el = document.createElement('div');
        el.className = `pw-item${animate ? ' is-entering' : ''}`;
        el.dataset.id = id;
        el.innerHTML = itemHTML(hit, q);
        // вставляем после предыдущей живой строки, пропуская уходящие
        let ref: Element | null = cursor ? cursor.nextElementSibling : itemsEl.firstElementChild;
        while (ref && (ref as HTMLElement).classList.contains('is-leaving')) ref = ref.nextElementSibling;
        itemsEl.insertBefore(el, ref);
        if (animate) later(() => el?.classList.remove('is-entering'), 260);
      } else {
        const html = itemHTML(hit, q);
        if (el.innerHTML !== html) el.innerHTML = html;
      }
      el.classList.toggle('is-selected', id === state.entry.id);
      cursor = el;
    }

    const empty = itemsEl.querySelector('.pw-list__empty');
    if (!hits.length && !empty) {
      const el = document.createElement('div');
      el.className = 'pw-list__empty';
      el.textContent = 'Ничего не найдено';
      itemsEl.appendChild(el);
    } else if (hits.length && empty) {
      empty.remove();
    }
  };

  /* ---------- поиск: набор запроса, живая фильтрация ---------- */
  const searchEl = $('.pw-search');
  const searchValue = $('.pw-search__value');
  const setQuery = (q: string) => {
    state.query = q;
    if (searchValue) searchValue.textContent = q;
    if (searchEl) searchEl.classList.toggle('has-value', q.length > 0);
    renderItems();
  };
  const searchFocus = () => searchEl?.classList.add('is-focused');
  const searchBlur = () => searchEl?.classList.remove('is-focused');

  const secretHTML = () =>
    state.reveal
      ? `<span class="pw-secret">${state.entry.pass}</span>`
      : `<span class="pw-dots">${'•'.repeat(15)}</span>`;

  const rowsHTML = (e: Entry) => `<div class="pw-rows">
    <div class="pw-row pw-row--first"><div class="pw-row__label">Логин</div><div class="pw-row__val">${e.login}</div><div class="pw-row__acts"><span class="pw-ib" data-act="copy" data-copy="login">${ICONS.copy}</span></div></div>
    <div class="pw-row"><div class="pw-row__label">Пароль</div><div class="pw-row__val" data-role="secret">${secretHTML()}</div><div class="pw-row__acts"><span class="pw-ib" data-act="eye">${state.reveal ? ICONS.eyeOff : ICONS.eye}</span><span class="pw-ib" data-act="copy" data-copy="pass">${ICONS.copy}</span></div></div>
    <div class="pw-row"><div class="pw-row__label">URL-адреса</div><div class="pw-row__val pw-row__val--col">${e.urls.map((u) => `<a>${u}</a>`).join('')}</div><div class="pw-row__acts pw-row__acts--col">${e.urls.map((_, i) => `<span class="pw-ib" data-act="copy" data-copy="url${i + 1}">${ICONS.copy}</span>`).join('')}</div></div>
    ${e.totp ? `<div class="pw-row"><div class="pw-row__label">TOTP</div><div class="pw-row__val"><span class="pw-totp" data-role="totp">${state.totpCode}</span></div><div class="pw-row__acts"><svg class="pw-ring" viewBox="0 0 16 16"><circle class="pw-ring__bg" cx="8" cy="8" r="6"/><circle class="pw-ring__fg" data-role="ring" cx="8" cy="8" r="6"/></svg><span class="pw-ib" data-act="copy" data-copy="totp">${ICONS.copy}</span></div></div>` : ''}
    <div class="pw-row pw-row--last"><div class="pw-row__label">Теги</div><div class="pw-row__val"><div class="pw-chips">${e.tags.map((t) => `<span class="pw-chip">${t}</span>`).join('')}</div></div><div></div></div>
  </div>`;

  const historyHTML = (e: Entry, stagger: boolean) =>
    `<div class="pw-rows${stagger ? ' pw-rows--stagger' : ''}">${HISTORY.map(([key, text, time], i) => {
      const who = PEOPLE[key];
      return `<div class="pw-hist${i ? '' : ' pw-hist--first'}"><span class="pw-mini" style="background:${who.color}">${who.init}</span><span class="pw-hist__text"><b>${who.full}</b> ${text.replace('{tag}', e.tags[e.tags.length - 1])}</span><span class="pw-hist__time">${time}</span></div>`;
    }).join('')}</div>`;

  const versionsHTML = () =>
    `<div class="pw-rows">${VERSIONS.map(([n, date, key, current], i) => {
      const who = PEOPLE[key];
      return `<div class="pw-ver${i ? '' : ' pw-ver--first'}"><span class="pw-mini" style="background:${who.color}">${who.init}</span><span class="pw-ver__num">Редакция ${n}</span><span class="pw-ver__by">${who.full}</span>${current ? '<span class="pw-ver__cur">Текущая</span>' : ''}<span class="pw-ver__meta">${date}</span></div>`;
    }).join('')}</div>`;

  const renderDetail = (opts: { stagger?: boolean } = {}) => {
    const e = state.entry;
    const tabs: [Tab, string][] = [['data', 'Данные пароля'], ['history', 'История действий'], ['versions', 'Редакции']];
    detailEl.innerHTML = `<div class="pw-detail__head"><div class="pw-detail__title">${glyph(e.icon, true)}<h3>${e.name}</h3><span class="pw-star${e.fav ? ' is-on' : ''}" data-act="star">${ICONS.star}</span></div><span class="pw-close" data-act="close">${ICONS.close}</span></div>
      <div class="pw-detail__meta"><div><div class="pw-meta__title">Дополнительный доступ:</div><div class="pw-meta__sub">${e.access}</div></div><div class="pw-circles"><span class="pw-circle" data-act="share">${ICONS.share}</span><span class="pw-circle" data-act="edit">${ICONS.edit}</span><span class="pw-circle" data-act="more">${ICONS.more}</span></div></div>
      <div class="pw-tabs">${tabs.map(([key, label]) => `<span class="pw-tab${state.tab === key ? ' is-active' : ''}" data-tab="${key}">${label}</span>`).join('')}</div>
      ${state.tab === 'data' ? rowsHTML(e) : state.tab === 'history' ? historyHTML(e, Boolean(opts.stagger)) : versionsHTML()}`;
    totpTick();
  };

  /* ---------- действия интерфейса ---------- */
  const selectEntry = (id: string) => {
    const e = ENTRIES.find((x) => x.id === id);
    if (!e || e === state.entry) return;
    state.entry = e;
    state.reveal = false;
    state.tab = 'data';
    $$('.pw-item').forEach((el) => el.classList.toggle('is-selected', el.dataset.id === id));
    detailEl.classList.remove('is-in');
    detailEl.getBoundingClientRect(); // форсируем reflow, чтобы анимация перезапустилась
    renderDetail();
    detailEl.classList.add('is-in');
  };
  const setTab = (tab: Tab, opts: { stagger?: boolean } = {}) => {
    if (state.tab === tab) return;
    state.tab = tab;
    detailEl.classList.remove('is-in'); // содержимое таба анимируем сами, без общего fade
    renderDetail(opts);
    if (!opts.stagger) {
      const rows = $('.pw-rows');
      if (rows) rows.style.animation = 'pw-fade-in .22s ease-out';
    }
  };
  const setReveal = (on: boolean) => {
    state.reveal = on;
    const secret = $('[data-role="secret"]');
    if (secret) secret.innerHTML = secretHTML();
    const eye = $('[data-act="eye"]');
    if (eye) eye.innerHTML = state.reveal ? ICONS.eyeOff : ICONS.eye;
  };
  const appRect = (el: Element) => {
    const r = el.getBoundingClientRect();
    const a = app.getBoundingClientRect();
    return {
      left: (r.left - a.left) / scale,
      top: (r.top - a.top) / scale,
      width: r.width / scale,
      height: r.height / scale,
    };
  };
  const toast = (anchor: Element, text: string) => {
    const r = appRect(anchor);
    const el = document.createElement('div');
    el.className = 'pw-toast';
    el.textContent = text;
    el.style.left = `${r.left + r.width / 2}px`;
    el.style.top = `${r.top - 4}px`;
    app.appendChild(el);
    later(() => el.remove(), 1450);
  };
  const copyFlash = (btn: Element | null) => {
    if (!btn) return;
    btn.classList.add('is-done');
    btn.innerHTML = ICONS.check;
    later(() => {
      if (btn.isConnected) {
        btn.classList.remove('is-done');
        btn.innerHTML = ICONS.copy;
      }
    }, 1300);
    toast(btn, 'Скопировано');
  };

  const press = (el: Element | null) => {
    if (!el) return;
    el.classList.add('pw-pressed');
    later(() => el.classList.remove('pw-pressed'), 140);
  };

  /* ---------- TOTP: живой отсчёт ---------- */
  const generateCode = () => {
    const digits = String(Math.floor(100000 + Math.random() * 900000));
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  };
  function totpTick() {
    const now = Date.now();
    const slot = Math.floor(now / 30000);
    const remaining = 30 - ((now / 1000) % 30);
    if (slot !== state.totpSlot) {
      state.totpSlot = slot;
      state.totpCode = generateCode();
      const code = $('[data-role="totp"]');
      if (code) {
        code.classList.remove('is-flip');
        code.getBoundingClientRect();
        code.classList.add('is-flip');
        later(() => {
          code.textContent = state.totpCode;
        }, 160);
      }
    }
    const ring = $<SVGCircleElement>('[data-role="ring"]');
    if (ring) {
      const circumference = 2 * Math.PI * 6;
      ring.style.strokeDasharray = String(circumference);
      ring.style.strokeDashoffset = String(circumference * (1 - remaining / 30));
    }
  }
  const totpTimer = window.setInterval(totpTick, 500);

  renderItems(false);
  renderDetail();

  /* ---------- пауза вне экрана / в фоновой вкладке ---------- */
  const intersection =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          (entries) => {
            offscreen = !entries[0].isIntersecting;
          },
          { threshold: 0.02 },
        )
      : null;
  if (intersection) intersection.observe(embed);
  const isPaused = () => offscreen || document.hidden;

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      let left = ms;
      let last = performance.now();
      const tick = () => {
        if (!alive) return resolve();
        const now = performance.now();
        if (!isPaused()) left -= now - last;
        last = now;
        if (left <= 0) resolve();
        else later(tick, Math.min(left, 90));
      };
      later(tick, Math.min(ms, 90));
    });

  const typeSearch = async (text: string) => {
    for (const ch of text) {
      if (!alive) return;
      setQuery(state.query + ch);
      await sleep(random(55, 105));
    }
  };
  /* Пароль проявляется посимвольно слева направо, как расшифровка. */
  const revealTyped = async () => {
    const secret = $('[data-role="secret"]');
    if (!secret) return;
    const pass = state.entry.pass;
    const eye = $('[data-act="eye"]');
    if (eye) eye.innerHTML = ICONS.eyeOff;
    state.reveal = true;
    for (let i = 1; i <= pass.length; i++) {
      if (!alive) return;
      secret.innerHTML = `<span class="pw-secret">${pass.slice(0, i)}${'•'.repeat(pass.length - i)}</span>`;
      await sleep(28);
    }
  };

  /* ---------- всплывающая панель доступа к папке ---------- */
  let accessMenu: HTMLElement | null = null;
  const closeAccess = () => {
    accessMenu?.remove();
    accessMenu = null;
  };
  const openAccess = () => {
    closeAccess();
    const anchor = $('[data-act="head-share"]');
    if (!anchor) return;
    const r = appRect(anchor);
    const menu = document.createElement('div');
    menu.className = 'pw-menu';
    menu.innerHTML =
      '<div class="pw-menu__title">Доступ к папке</div>' +
      ACCESS.map(([key, role]) => {
        const who = PEOPLE[key];
        return `<div class="pw-access"><span class="pw-mini" style="background:${who.color}">${who.init}</span><span>${who.full}</span><span class="pw-access__role">${role}</span></div>`;
      }).join('') +
      '<div class="pw-access"><span class="pw-mini pw-mini--more">30</span><span>Ещё 30 пользователей</span><span class="pw-access__role">Просмотр</span></div>';
    menu.style.left = `${r.left}px`;
    menu.style.top = `${r.top + r.height + 10}px`;
    app.appendChild(menu);
    accessMenu = menu;
  };
  const toggleTree = (row: Element | null) => {
    const group = row && row.closest('.pw-tree-group');
    if (group) group.classList.toggle('is-open');
  };

  const tween = (duration: number, frame: (p: number) => void) =>
    new Promise<void>((resolve) => {
      let elapsed = 0;
      let last: number | null = null;
      const step = (ts: number) => {
        if (!alive) return resolve();
        if (last == null) last = ts;
        if (!isPaused()) elapsed += Math.min(48, ts - last);
        last = ts;
        const p = Math.min(1, elapsed / duration);
        frame(p);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

  /* ---------- курсор ---------- */
  const layer = embed.querySelector<HTMLElement>('.pw-cursors');

  class Cursor {
    x: number;
    y: number;
    el: HTMLElement;
    hoverEl: Element | null = null;
    hoverTarget: Target | null = null;

    constructor(start: Point) {
      this.x = start.x;
      this.y = start.y;
      this.el = document.createElement('div');
      this.el.className = 'pw-cursor';
      this.el.innerHTML =
        DASHBOARD_CURSOR_MARKUP;
      layer?.appendChild(this.el);
      this.render();
    }
    render() {
      this.el.style.transform = `translate(${this.x - 1}px, ${this.y - 1}px)`;
    }
    set(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.render();
    }
    show() {
      this.el.classList.add('is-visible');
    }
    hide() {
      this.el.classList.remove('is-visible');
    }
    resolve(target: Target | null): Element | null {
      if (!target || !alive) return null;
      if (typeof target === 'string') return $(target);
      if (typeof target === 'function') return target() ?? null;
      return target.isConnected ? target : null;
    }
    pointIn(el: Element, o: GoOptions): Point {
      const r = appRect(el);
      const fx = o.fx ?? (r.width < 60 ? 0.5 + random(-0.06, 0.06) : random(0.14, 0.5));
      const fy = o.fy ?? (r.height < 40 ? 0.5 + random(-0.08, 0.08) : random(0.35, 0.65));
      return { x: r.left + r.width * fx, y: r.top + r.height * fy };
    }
    /* Ход по слегка изогнутой дуге: старт и финиш мягкие, без прямых «телепортов». */
    async moveTo(p: Point, o: GoOptions = {}) {
      this.unhover();
      const from = { x: this.x, y: this.y };
      const dx = p.x - from.x;
      const dy = p.y - from.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1) return;
      const duration = o.dur ?? clamp(420 + dist * 1.35, 520, 1600) * random(0.95, 1.1);
      const bend = dist * random(-0.1, 0.1);
      const nx = -dy / dist;
      const ny = dx / dist;
      const cx = (from.x + p.x) / 2 + nx * bend;
      const cy = (from.y + p.y) / 2 + ny * bend;
      await tween(duration, (t) => {
        const e = easeInOutQuart(t);
        const u = 1 - e;
        this.set(u * u * from.x + 2 * u * e * cx + e * e * p.x, u * u * from.y + 2 * u * e * cy + e * e * p.y);
      });
    }
    async go(target: Target, o: GoOptions = {}): Promise<Element | null> {
      let el = this.resolve(target);
      if (!el) return null;
      await this.moveTo(this.pointIn(el, o), o);
      el = this.resolve(target);
      if (!el) return null;
      this.setHover(el, target);
      return el;
    }
    setHover(el: Element, target: Target) {
      if (this.hoverEl && this.hoverEl !== el) this.unhover();
      el.classList.add('pw-hl');
      this.hoverEl = el;
      this.hoverTarget = target;
    }
    unhover() {
      const el = this.hoverEl;
      if (!el) return;
      this.hoverEl = null;
      this.hoverTarget = null;
      el.classList.remove('pw-hl');
    }
    ripple() {
      const r = document.createElement('div');
      r.className = 'pw-ripple';
      r.style.left = `${this.x}px`;
      r.style.top = `${this.y}px`;
      layer?.appendChild(r);
      later(() => r.remove(), 600);
    }
    async click(action?: (el: Element | null) => void) {
      const el = this.hoverTarget ? this.resolve(this.hoverTarget) : this.hoverEl;
      if (this.hoverTarget && !el) return false;
      this.el.classList.add('is-pressed');
      this.ripple();
      if (el) press(el);
      await sleep(120);
      this.el.classList.remove('is-pressed');
      if (action && alive) action(el);
      await sleep(160);
      return true;
    }
    idle(a: number, b = a) {
      return sleep(random(a, b));
    }
  }

  /* ---------- сценарий ---------- */
  const scenario = async (c: Cursor) => {
    await c.idle(900, 1300);
    c.show();
    while (alive) {
      // поиск
      if (await c.go('[data-id="search"]', { fx: 0.4 })) {
        await c.idle(260, 420);
        await c.click(() => searchFocus());
        await c.idle(320, 480);
        await typeSearch(QUERY);
        await c.idle(700, 1000);
      }
      if (await c.go(`.pw-item[data-id="${FOUND_ENTRY}"]`)) {
        await c.idle(300, 460);
        await c.click(() => {
          searchBlur();
          selectEntry(FOUND_ENTRY);
        });
        await c.idle(900, 1300);
      }

      // пароль: показать, скопировать, скрыть
      if (await c.go('[data-act="eye"]')) {
        await c.idle(320, 480);
        await c.click();
        await revealTyped();
        await c.idle(1100, 1500);
      }
      if (await c.go('[data-copy="pass"]')) {
        await c.idle(260, 400);
        await c.click((el) => copyFlash(el));
        await c.idle(1300, 1700);
      }
      if (await c.go('[data-act="eye"]')) {
        await c.idle(240, 380);
        await c.click(() => setReveal(false));
        await c.idle(500, 800);
      }

      // журнал действий
      if (await c.go('[data-tab="history"]')) {
        await c.idle(300, 450);
        await c.click(() => setTab('history', { stagger: true }));
        await c.idle(1300, 1700);
        for (let i = 0; i < 3; i++) {
          if (!(await c.go(() => $$('.pw-hist')[i]))) break;
          await c.idle(600, 900);
        }
        await c.idle(400, 700);
      }

      // права на папку
      if (await c.go('[data-act="head-share"]')) {
        await c.idle(300, 450);
        await c.click(() => openAccess());
        await c.idle(700, 1000);
        if (await c.go(() => $$('.pw-access')[1])) await c.idle(700, 1000);
        if (await c.go(() => $$('.pw-access')[2])) await c.idle(600, 900);
        closeAccess();
        await c.idle(400, 700);
      }

      // дерево сейфов
      if (await c.go('.pw-tree-row[data-id="test"]')) {
        await c.idle(300, 450);
        await c.click((el) => toggleTree(el));
        await c.idle(900, 1300);
        if (await c.go(() => $$('.pw-tree-group[data-id="test"] .pw-tree-children .pw-tree-row')[1])) {
          await c.idle(700, 1000);
        }
        if (await c.go('.pw-tree-row[data-id="test"]')) {
          await c.idle(240, 380);
          await c.click((el) => toggleTree(el));
          await c.idle(500, 800);
        }
      }

      // сброс: очистить поиск, вернуться к исходной записи, отойти в сторону
      if (await c.go('[data-act="search-clear"]')) {
        await c.idle(260, 400);
        await c.click(() => {
          setQuery('');
          searchBlur();
          selectEntry(HOME_ENTRY);
        });
        await c.idle(600, 900);
      }
      await c.moveTo({ x: random(820, 1180), y: random(600, 680) });
      await c.idle(5000, 7000);
    }
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cursor = new Cursor({ x: 980, y: 560 });
  if (reducedMotion && animate) {
    // без движения: конечное состояние — запись открыта, журнал заполнен, курсора нет
    state.tab = 'history';
    renderDetail();
  } else if (animate) {
    void scenario(cursor);
  }

  return () => {
    alive = false;
    window.clearInterval(totpTimer);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    resizeObserver?.disconnect();
    if (!resizeObserver) window.removeEventListener('resize', fit);
    intersection?.disconnect();
    closeAccess();
    cursor.unhover();
    cursor.hide();
    state.query = '';
    searchBlur();
    app.querySelectorAll('.pw-toast').forEach((el) => el.remove());
    if (layer) layer.innerHTML = '';
  };
}
