/*
 * Живой дашборд в hero: три курсора коллег, которые одновременно работают
 * в интерфейсе — кликают, переключают записи и вкладки, раскрывают дерево.
 * Сцена 1344×725 масштабируется под ширину контейнера через --pw-s.
 */

type User = { name: string; full: string; init: string; color: string };
type UserKey = 'marina' | 'ilya' | 'sasha';
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
type MenuItem = [icon: string, label: string, tone?: 'danger'] | null;
type MenuSpec = { items?: MenuItem[]; access?: boolean };
type Point = { x: number; y: number };
type Target = string | Element | (() => Element | null | undefined);
type GoOptions = { fx?: number; fy?: number; dur?: number };

const WIDTH = 1344;

const USERS: Record<UserKey, User> = {
  marina: { name: 'Марина', full: 'Марина Ковалёва', init: 'М', color: '#ff6b4a' },
  ilya: { name: 'Илья', full: 'Илья Смирнов', init: 'И', color: '#8b7cff' },
  sasha: { name: 'Саша', full: 'Саша Орлов', init: 'С', color: '#2fcb8f' },
};

const ENTRIES: Entry[] = [
  { id: 'emergency', name: 'Emergency Server User', icon: 'emergency', login: 'emergency@passwork.ru', pass: 'Qw7#rT2v!mN9xB', urls: ['https://passwork.ru/'], totp: true, tags: ['Admin', 'SSH'], access: '1 отправленный пароль, 1 ссылка', fav: false, dot: true },
  { id: 'site24x7', name: 'Site24x7 Monitoring', icon: 'cloud', login: 'monitoring@passwork.ru', pass: 'zK4$pL8w@cD3hM', urls: ['https://www.site24x7.com/login'], totp: false, tags: ['Monitoring'], access: '3 отправленных пароля', fav: false },
  { id: 'perpy', name: 'Per.py', icon: 'py', login: 'deploy@per.py', pass: 'Hf6&nV1q%sY5tR', urls: ['https://per.py/'], totp: false, tags: ['DevOps'], access: 'Нет дополнительного доступа', fav: false },
  { id: 'sprinthost', name: 'Sprinthost', icon: 'sprinthost', login: 'user@passwork.ru', pass: 'hT7#kQ9v!x2mLw', urls: ['https://sprinthost.ru/', 'https://cp.sprinthost.ru/auth/login'], totp: true, tags: ['Admin', 'GIT'], access: '2 отправленных пароля, 1 ссылка, 1 ярлык', fav: true },
  { id: 'astra', name: 'Astra Linux', icon: 'astra', login: 'admin@astra.local', pass: 'Bp3!wE8c$gU4kZ', urls: ['https://astralinux.ru/'], totp: false, tags: ['Linux', 'Admin'], access: '1 ссылка, 2 ярлыка', fav: false },
];

const HISTORY: [UserKey, string, string][] = [
  ['marina', 'просмотрела пароль', 'только что'],
  ['ilya', 'изменил пароль', 'вчера, 18:42'],
  ['sasha', 'добавил ярлык «{tag}»', '3 дня назад'],
  ['marina', 'отправила пароль пользователю A', '12 авг'],
  ['ilya', 'создал запись', '19 мая'],
];

const VERSIONS: [number, string, UserKey, boolean?][] = [
  [4, '28 авг, 18:42', 'ilya', true],
  [3, '12 авг, 10:07', 'marina'],
  [2, '3 июл, 16:51', 'sasha'],
  [1, '19 мая, 09:30', 'marina'],
];

const ICONS: Record<string, string> = {
  copy: '<svg class="pw-ico" viewBox="0 0 16 16"><rect x="5.5" y="5.5" width="8.5" height="8.5" rx="1.5"/><path d="M10.5 5.5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h2"/></svg>',
  check: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="m3 8.5 3.2 3.2L13 5"/></svg>',
  eye: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M1.5 8c1.3-3 3.6-4.7 6.5-4.7S13.2 5 14.5 8c-1.3 3-3.6 4.7-6.5 4.7S2.8 11 1.5 8z"/><circle cx="8" cy="8" r="2.1"/></svg>',
  eyeOff: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M2 2l12 12M6.6 6.7A2 2 0 0 0 9.3 9.4M4.2 4.3C2.8 5.2 1.9 6.5 1.4 8c1.2 3 3.6 4.7 6.6 4.7 1.3 0 2.5-.3 3.5-.9M7 3.4c.3 0 .7-.1 1-.1 3 0 5.4 1.7 6.6 4.7-.4 1-1 1.9-1.7 2.6"/></svg>',
  close: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
  share: '<svg class="pw-ico" viewBox="0 0 16 16"><circle cx="6.5" cy="5.2" r="2.7"/><path d="M1.8 13.5c.4-2.6 2.2-4.1 4.7-4.1 1 0 1.9.2 2.6.7M12.5 8.6v4.6M10.2 10.9h4.6"/></svg>',
  edit: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M11.3 2.5l2.2 2.2-7.6 7.6-3 .8.8-3z"/></svg>',
  more: '<svg class="pw-ico" viewBox="0 0 18 18" style="fill:currentColor;stroke:none"><circle cx="4" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/><circle cx="14" cy="9" r="1.5"/></svg>',
  star: '<svg viewBox="0 0 16 16"><path d="m8 1.9 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.7l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/></svg>',
  move: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M2 4.5h7M2 8h12M2 11.5h7M11 2l3 2.5-3 2.5M11 9l3 2.5-3 2.5"/></svg>',
  link: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 0 0-3.7-3.7l-.9.9M9.2 6.8a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 0 0 3.7 3.7l.9-.9"/></svg>',
  clock: '<svg class="pw-ico" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.4 1.5"/></svg>',
  trash: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M2.5 4.2h11M6 4.2V2.8h4v1.4M3.8 4.2l.7 9a1 1 0 0 0 1 .9h5a1 1 0 0 0 1-.9l.7-9M6.6 7v4.4M9.4 7v4.4"/></svg>',
  down: '<svg class="pw-ico" viewBox="0 0 16 16"><path d="M8 2.5v8M4.8 7.3 8 10.5l3.2-3.2M2.5 13h11"/></svg>',
  cloud: '<svg viewBox="0 0 20 20"><path fill="#e3e6ea" d="M5.7 15.6a3.7 3.7 0 0 1-.6-7.3 4.7 4.7 0 0 1 9.1-1.1 3.2 3.2 0 0 1 .9 6.3c-.2.1-.4.1-.6.1z"/></svg>',
  astra: '<svg viewBox="0 0 18 18"><path fill="#0b5f9b" d="M9 1l2.1 5.2 5.6.4-4.3 3.6 1.4 5.5L9 12.7l-4.8 3 1.4-5.5L1.3 6.6l5.6-.4z"/></svg>',
  sprint: '<svg viewBox="0 0 12 12"><path d="M2.6 8.3c1.6 1.3 4.5 1.5 5.8-.2.9-1.4-.5-2.4-2-2.7C5 5 3.6 4.6 3.7 3.3 3.8 2 5.7 1.4 7.3 1.9" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
};

const MENU_ENTRY: MenuItem[] = [['edit', 'Редактировать'], ['move', 'Переместить'], ['link', 'Скопировать ссылку'], ['clock', 'История действий'], null, ['trash', 'Удалить', 'danger']];
const MENU_FOLDER: MenuItem[] = [['edit', 'Переименовать папку'], ['move', 'Переместить'], ['down', 'Экспорт паролей'], null, ['trash', 'Удалить папку', 'danger']];
const ACCESS: [UserKey, string][] = [['marina', 'Администратор'], ['ilya', 'Редактор'], ['sasha', 'Просмотр']];

const glyph = (kind: Entry['icon'], large = false) => {
  const cls = `pw-glyph pw-glyph--${kind}${large ? ' pw-glyph--lg' : ''}`;
  if (kind === 'emergency') return `<span class="${cls} pw-glyph--sq">E</span>`;
  if (kind === 'py') return `<span class="${cls} pw-glyph--sq">py</span>`;
  if (kind === 'sprinthost') return `<span class="${cls}">${ICONS.sprint}</span>`;
  if (kind === 'cloud') return `<span class="${cls}">${ICONS.cloud}</span>`;
  return `<span class="${cls}">${ICONS.astra}</span>`;
};

const random = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initLiveDashboard(embed: HTMLElement): () => void {
  const stage = embed.querySelector<HTMLElement>('.pw-stage');
  const app = embed.querySelector<HTMLElement>('.pw-app');
  const layer = embed.querySelector<HTMLElement>('.pw-cursors');
  const itemsEl = embed.querySelector<HTMLElement>('.pw-items');
  const detailEl = embed.querySelector<HTMLElement>('.pw-detail');
  if (!stage || !app || !layer || !itemsEl || !detailEl) return () => undefined;

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
    scale = embed.clientWidth / WIDTH || 1;
    embed.style.setProperty('--pw-s', String(scale));
  };
  fit();
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
  if (resizeObserver) resizeObserver.observe(embed);
  else window.addEventListener('resize', fit);

  /* ---------- состояние и рендер ---------- */
  const state = {
    entry: ENTRIES[3],
    tab: 'data' as Tab,
    reveal: false,
    totpCode: '203 572',
    totpSlot: Math.floor(Date.now() / 30000),
    menu: null as HTMLElement | null,
    menuTimer: 0,
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

  const renderItems = () => {
    const q = state.query.trim();
    const hits = searchHits(q);
    const list = $('.pw-list');
    if (list) list.classList.toggle('is-searching', q.length > 0);
    const label = $('.pw-label--second');
    if (label) label.textContent = q ? `Результаты · ${hits.length}` : 'Название';
    itemsEl.innerHTML =
      hits
        .map(({ entry: e, at, hint, chip }) => {
          const name =
            at == null
              ? e.name
              : `${e.name.slice(0, at)}<mark>${e.name.slice(at, at + q.length)}</mark>${e.name.slice(at + q.length)}`;
          const extra = hint
            ? `<span class="pw-item__hint">${hint}</span>`
            : chip
              ? `<span class="pw-item__hint pw-item__hint--chip">${chip}</span>`
              : '';
          return `<div class="pw-item${e.id === state.entry.id ? ' is-selected' : ''}" data-id="${e.id}">${e.dot ? '<i class="pw-item__dot"></i>' : ''}${glyph(e.icon)}<span>${name}</span>${extra}</div>`;
        })
        .join('') || '<div class="pw-list__empty">Ничего не найдено</div>';
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
  const clearSearch = () => {
    setQuery('');
    searchBlur();
  };

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

  const historyHTML = (e: Entry) =>
    `<div class="pw-rows">${HISTORY.map(([key, text, time], i) => {
      const user = USERS[key];
      return `<div class="pw-hist${i ? '' : ' pw-hist--first'}"><span class="pw-mini" style="background:${user.color}">${user.init}</span><span class="pw-hist__text"><b>${user.full}</b> ${text.replace('{tag}', e.tags[e.tags.length - 1])}</span><span class="pw-hist__time">${time}</span></div>`;
    }).join('')}</div>`;

  const versionsHTML = () =>
    `<div class="pw-rows">${VERSIONS.map(([n, date, key, current], i) => {
      const user = USERS[key];
      return `<div class="pw-ver${i ? '' : ' pw-ver--first'}"><span class="pw-mini" style="background:${user.color}">${user.init}</span><span class="pw-ver__num">Редакция ${n}</span><span class="pw-ver__by">${user.full}</span>${current ? '<span class="pw-ver__cur">Текущая</span>' : ''}<span class="pw-ver__meta">${date}</span></div>`;
    }).join('')}</div>`;

  const renderDetail = () => {
    const e = state.entry;
    const tabs: [Tab, string][] = [['data', 'Данные пароля'], ['history', 'История действий'], ['versions', 'Редакции']];
    detailEl.innerHTML = `<div class="pw-detail__head"><div class="pw-detail__title">${glyph(e.icon, true)}<h3>${e.name}</h3><span class="pw-star${e.fav ? ' is-on' : ''}" data-act="star">${ICONS.star}</span></div><span class="pw-close" data-act="close">${ICONS.close}</span></div>
      <div class="pw-detail__meta"><div><div class="pw-meta__title">Дополнительный доступ:</div><div class="pw-meta__sub">${e.access}</div></div><div class="pw-circles"><span class="pw-circle" data-act="share">${ICONS.share}</span><span class="pw-circle" data-act="edit">${ICONS.edit}</span><span class="pw-circle" data-act="more">${ICONS.more}</span></div></div>
      <div class="pw-tabs">${tabs.map(([key, label]) => `<span class="pw-tab${state.tab === key ? ' is-active' : ''}" data-tab="${key}">${label}</span>`).join('')}</div>
      ${state.tab === 'data' ? rowsHTML(e) : state.tab === 'history' ? historyHTML(e) : versionsHTML()}`;
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
  const setTab = (tab: Tab) => {
    if (state.tab === tab) return;
    state.tab = tab;
    renderDetail();
    const rows = $('.pw-rows');
    if (rows) rows.style.animation = 'pw-fade-in .22s ease-out';
  };
  const toggleReveal = (on?: boolean) => {
    state.reveal = on == null ? !state.reveal : on;
    const secret = $('[data-role="secret"]');
    if (secret) secret.innerHTML = secretHTML();
    const eye = $('[data-act="eye"]');
    if (eye) eye.innerHTML = state.reveal ? ICONS.eyeOff : ICONS.eye;
  };
  const toggleFav = () => {
    state.entry.fav = !state.entry.fav;
    const star = $('[data-act="star"]');
    if (star) star.classList.toggle('is-on', state.entry.fav);
  };
  const toggleTree = (row: Element | null) => {
    const group = row && row.closest('.pw-tree-group');
    if (group) group.classList.toggle('is-open');
  };
  const appRect = (el: Element) => {
    const r = el.getBoundingClientRect();
    const a = app.getBoundingClientRect();
    return {
      left: (r.left - a.left) / scale,
      top: (r.top - a.top) / scale,
      right: (r.right - a.left) / scale,
      bottom: (r.bottom - a.top) / scale,
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
  const closeMenu = () => {
    if (state.menu) {
      state.menu.remove();
      state.menu = null;
    }
  };
  const openMenu = (anchor: Element | null, spec: MenuSpec, opts: { align?: 'left' | 'right' } = {}) => {
    closeMenu();
    if (!anchor) return;
    const menu = document.createElement('div');
    menu.className = `pw-menu${opts.align === 'left' ? ' pw-menu--left' : ''}`;
    if (spec.items) {
      menu.innerHTML = spec.items
        .map((item) =>
          item
            ? `<div class="pw-menu__item${item[2] ? ` pw-menu__item--${item[2]}` : ''}">${ICONS[item[0]] || ''}<span>${item[1]}</span></div>`
            : '<div class="pw-menu__sep"></div>',
        )
        .join('');
    } else {
      menu.innerHTML =
        '<div class="pw-menu__title">Доступ к папке</div>' +
        ACCESS.map(([key, role]) => {
          const user = USERS[key];
          return `<div class="pw-access"><span class="pw-mini" style="background:${user.color}">${user.init}</span><span>${user.full}</span><span class="pw-access__role">${role}</span></div>`;
        }).join('') +
        '<div class="pw-access"><span class="pw-mini" style="background:#2c2d2e;color:#8c8c8c">A</span><span>Ещё 30 пользователей</span><span class="pw-access__role">Просмотр</span></div>';
    }
    const r = appRect(anchor);
    menu.style.top = `${r.bottom + 8}px`;
    if (opts.align === 'left') menu.style.left = `${r.left}px`;
    else menu.style.right = `${WIDTH - r.right}px`;
    app.appendChild(menu);
    state.menu = menu;
    window.clearTimeout(state.menuTimer);
    state.menuTimer = later(closeMenu, 6500);
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

  renderItems();
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

  const typeSearch = async (text: string) => {
    for (const ch of text) {
      if (!alive) return;
      setQuery(state.query + ch);
      await sleep(random(70, 160));
    }
  };

  /* ---------- курсоры ---------- */
  const cursors: Cursor[] = [];

  class Cursor {
    user: User;
    x: number;
    y: number;
    el: HTMLElement;
    hoverEl: Element | null = null;
    hoverTarget: Target | null = null;

    constructor(user: User, start: Point) {
      this.user = user;
      this.x = start.x;
      this.y = start.y;
      this.el = document.createElement('div');
      this.el.className = 'pw-cursor';
      this.el.style.setProperty('--c', user.color);
      this.el.innerHTML = `<svg class="pw-cursor__arrow" viewBox="0 0 22 22"><path d="M1 1v15.3l4.3-3.7 2.9 6.3 2.9-1.3-2.9-6.2h5.5z" fill="${user.color}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg><span class="pw-cursor__label">${user.name}</span>`;
      if (layer) layer.appendChild(this.el);
      this.render();
      cursors.push(this);
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
    resolve(target: Target | null): Element | null {
      if (!target || !alive) return null;
      if (typeof target === 'string') return $(target);
      if (typeof target === 'function') return target() ?? null;
      return target.isConnected ? target : null;
    }
    pointIn(el: Element, o: GoOptions): Point {
      const r = appRect(el);
      const fx = o.fx ?? (r.width < 60 ? 0.5 + random(-0.08, 0.08) : random(0.12, 0.55));
      const fy = o.fy ?? (r.height < 40 ? 0.5 + random(-0.1, 0.1) : random(0.3, 0.7));
      return { x: r.left + r.width * fx, y: r.top + r.height * fy };
    }
    async moveTo(p: Point, o: GoOptions = {}) {
      this.unhover();
      const from = { x: this.x, y: this.y };
      const dx = p.x - from.x;
      const dy = p.y - from.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1) return;
      const duration = o.dur ?? clamp(220 + dist * 1.15, 260, 1250) * random(0.9, 1.15);
      const bend = dist * random(-0.14, 0.14);
      const nx = -dy / dist;
      const ny = dx / dist;
      const cx = (from.x + p.x) / 2 + nx * bend;
      const cy = (from.y + p.y) / 2 + ny * bend;
      await tween(duration, (t) => {
        const e = easeInOut(t);
        const u = 1 - e;
        this.set(
          u * u * from.x + 2 * u * e * cx + e * e * p.x,
          u * u * from.y + 2 * u * e * cy + e * e * p.y,
        );
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
      (el as HTMLElement).style.setProperty('--pw-hl', this.user.color);
      this.hoverEl = el;
      this.hoverTarget = target;
    }
    unhover() {
      const el = this.hoverEl;
      if (!el) return;
      this.hoverEl = null;
      this.hoverTarget = null;
      if (cursors.some((c) => c.hoverEl === el)) return;
      el.classList.remove('pw-hl');
      (el as HTMLElement).style.removeProperty('--pw-hl');
    }
    ripple() {
      const r = document.createElement('div');
      r.className = 'pw-ripple';
      r.style.setProperty('--c', this.user.color);
      r.style.left = `${this.x}px`;
      r.style.top = `${this.y}px`;
      layer?.appendChild(r);
      later(() => r.remove(), 600);
    }
    async click(action?: (el: Element | null) => void, o: { keepMenu?: boolean } = {}) {
      const el = this.hoverTarget ? this.resolve(this.hoverTarget) : this.hoverEl;
      if (this.hoverTarget && !el) return false;
      if (!o.keepMenu) closeMenu();
      this.el.classList.add('is-pressed');
      this.ripple();
      if (el) {
        el.classList.add('pw-pressed');
        later(() => el.classList.remove('pw-pressed'), 140);
      }
      await sleep(110);
      this.el.classList.remove('is-pressed');
      if (action && alive) action(el);
      await sleep(140);
      return true;
    }
    idle(a: number, b = a) {
      return sleep(random(a, b));
    }
    wander(area: { x: number; y: number; w: number; h: number }) {
      return this.moveTo({ x: area.x + Math.random() * area.w, y: area.y + Math.random() * area.h });
    }
  }

  /* ---------- сценарии ---------- */
  const runMarina = async (c: Cursor) => {
    await c.idle(500, 900);
    c.show();
    while (alive) {
      if (await c.go('[data-act="eye"]')) {
        await c.idle(500, 900);
        await c.click(() => toggleReveal(true));
        await c.idle(1700, 2600);
        await c.click(() => toggleReveal(false));
        await c.idle(500, 900);
      }
      if (await c.go('[data-copy="login"]')) {
        await c.idle(300, 600);
        await c.click((el) => copyFlash(el));
        await c.idle(1200, 1800);
      }
      if (await c.go('[data-tab="history"]')) {
        await c.idle(300, 600);
        await c.click(() => setTab('history'));
        await c.idle(900, 1400);
        for (let i = 0; i < 3; i++) {
          if (!(await c.go(() => $$('.pw-hist')[i]))) break;
          await c.idle(600, 1100);
        }
      }
      if (await c.go('[data-act="star"]')) {
        await c.idle(300, 500);
        await c.click(() => toggleFav());
        await c.idle(1200, 2000);
      }
      if (await c.go('[data-tab="data"]')) {
        await c.idle(250, 500);
        await c.click(() => setTab('data'));
        await c.idle(800, 1400);
      }
      if (await c.go('[data-act="more"]')) {
        await c.idle(300, 500);
        await c.click((el) => openMenu(el, { items: MENU_ENTRY }), { keepMenu: true });
        await c.idle(700, 1000);
        if (await c.go(() => $$('.pw-menu__item')[1])) await c.idle(700, 1100);
        if (await c.go(() => $$('.pw-menu__item')[2])) await c.idle(500, 900);
        closeMenu();
        await c.idle(300, 600);
      }
      if (await c.go('[data-copy="url1"]')) {
        await c.idle(300, 500);
        await c.click((el) => copyFlash(el));
        await c.idle(900, 1500);
      }
      if (await c.go('[data-tab="versions"]')) {
        await c.idle(250, 500);
        await c.click(() => setTab('versions'));
        await c.idle(1000, 1600);
        if (await c.go(() => $$('.pw-ver')[1])) await c.idle(800, 1200);
      }
      if (await c.go('[data-tab="data"]')) {
        await c.idle(250, 450);
        await c.click(() => setTab('data'));
      }
      if (await c.go('[data-act="edit"]')) await c.idle(700, 1100);
      await c.wander({ x: 780, y: 610, w: 380, h: 70 });
      await c.idle(1600, 3000);
    }
  };

  const runIlya = async (c: Cursor) => {
    await c.idle(1300, 2000);
    c.show();
    while (alive) {
      for (const id of ['emergency', 'site24x7']) {
        if (await c.go(`.pw-item[data-id="${id}"]`)) await c.idle(500, 900);
      }
      if (await c.go('.pw-item[data-id="astra"]')) {
        await c.idle(300, 500);
        await c.click(() => selectEntry('astra'));
        await c.idle(3000, 4500);
      }
      if (await c.go('.pw-folder[data-id="mail"]')) await c.idle(700, 1200);
      if (await c.go('.pw-folder[data-id="servers"]')) await c.idle(600, 1000);
      if (await c.go('.pw-item[data-id="perpy"]')) {
        await c.idle(300, 500);
        await c.click(() => selectEntry('perpy'));
        await c.idle(2500, 4000);
      }
      if (await c.go('[data-act="add-password"]')) await c.idle(900, 1400);
      if (await c.go('[data-act="head-more"]')) {
        await c.idle(300, 500);
        await c.click((el) => openMenu(el, { items: MENU_FOLDER }), { keepMenu: true });
        await c.idle(800, 1200);
        if (await c.go(() => $$('.pw-menu__item')[0])) await c.idle(600, 900);
        if (await c.go(() => $$('.pw-menu__item')[2])) await c.idle(600, 900);
        closeMenu();
        await c.idle(300, 600);
      }
      if (await c.go('.pw-item[data-id="sprinthost"]')) {
        await c.idle(300, 500);
        await c.click(() => selectEntry('sprinthost'));
        await c.idle(2500, 4000);
      }
      if (await c.go('[data-act="head-share"]')) {
        await c.idle(300, 500);
        await c.click((el) => openMenu(el, { access: true }, { align: 'left' }), { keepMenu: true });
        await c.idle(600, 900);
        if (await c.go(() => $$('.pw-access')[1])) await c.idle(900, 1400);
        closeMenu();
        await c.idle(300, 600);
      }
      await c.wander({ x: 400, y: 560, w: 250, h: 100 });
      await c.idle(2000, 3500);
    }
  };

  const runSasha = async (c: Cursor) => {
    await c.idle(2100, 3000);
    c.show();
    while (alive) {
      for (const id of ['recent', 'fav']) {
        if (await c.go(`.pw-nav-item[data-id="${id}"]`)) await c.idle(500, 900);
      }
      if (await c.go('.pw-tree-row[data-id="test"]')) {
        await c.idle(300, 500);
        await c.click((el) => toggleTree(el));
        await c.idle(900, 1400);
        for (let i = 0; i < 2; i++) {
          if (await c.go(() => $$('.pw-tree-group[data-id="test"] .pw-tree-children .pw-tree-row')[i])) await c.idle(600, 1000);
        }
        if (await c.go('.pw-tree-row[data-id="test"]')) {
          await c.idle(200, 400);
          await c.click((el) => toggleTree(el));
          await c.idle(600, 1000);
        }
      }
      if (await c.go('.pw-tree-row[data-id="access"]')) await c.idle(700, 1100);
      if (await c.go('[data-act="add-shared"]')) await c.idle(600, 900);
      if (await c.go('.pw-tree-row[data-id="ads"]')) {
        await c.idle(300, 500);
        await c.click((el) => toggleTree(el));
        await c.idle(1000, 1600);
        if (await c.go(() => $$('.pw-tree-group[data-id="ads"] .pw-tree-children .pw-tree-row')[1])) await c.idle(700, 1100);
        if (await c.go('.pw-tree-row[data-id="ads"]')) {
          await c.idle(200, 400);
          await c.click((el) => toggleTree(el));
          await c.idle(500, 800);
        }
      }
      if (await c.go('[data-id="search"]', { fx: 0.42 })) {
        await c.idle(250, 450);
        await c.click(() => searchFocus());
        await c.idle(350, 600);
        await typeSearch('admin');
        await c.idle(900, 1400);
        if (await c.go(() => $$('.pw-item')[0])) await c.idle(500, 800);
        if (await c.go(() => $$('.pw-item')[2])) {
          await c.idle(300, 500);
          await c.click((el) => selectEntry(el?.getAttribute('data-id') ?? ''));
          await c.idle(2000, 3000);
        }
        if (await c.go('[data-act="search-clear"]')) {
          await c.idle(250, 450);
          await c.click(() => clearSearch());
          await c.idle(500, 900);
        }
      }
      if (await c.go('.pw-nav-item[data-id="hidden"]')) await c.idle(600, 1000);
      if (await c.go('.pw-tree-row[data-id="budget"]')) {
        await c.idle(300, 500);
        await c.click((el) => toggleTree(el));
        await c.idle(1000, 1600);
        if (await c.go(() => $$('.pw-tree-group[data-id="budget"] .pw-tree-children .pw-tree-row')[0])) await c.idle(600, 900);
        if (await c.go('.pw-tree-row[data-id="budget"]')) {
          await c.idle(200, 400);
          await c.click((el) => toggleTree(el));
          await c.idle(400, 700);
        }
      }
      await c.wander({ x: 60, y: 500, w: 200, h: 60 });
      await c.idle(1800, 3200);
    }
  };

  const marina = new Cursor(USERS.marina, { x: 990, y: 440 });
  const ilya = new Cursor(USERS.ilya, { x: 560, y: 540 });
  const sasha = new Cursor(USERS.sasha, { x: 170, y: 260 });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    cursors.forEach((c) => c.show());
  } else {
    runMarina(marina);
    runIlya(ilya);
    runSasha(sasha);
  }

  return () => {
    alive = false;
    window.clearInterval(totpTimer);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    resizeObserver?.disconnect();
    if (!resizeObserver) window.removeEventListener('resize', fit);
    intersection?.disconnect();
    closeMenu();
    clearSearch();
    app.querySelectorAll('.pw-toast, .pw-hl').forEach((el) => {
      if (el.classList.contains('pw-toast')) el.remove();
      else el.classList.remove('pw-hl');
    });
    layer.innerHTML = '';
    cursors.length = 0;
  };
}
