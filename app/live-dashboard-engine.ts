/*
 * Живой дашборд в hero: один безличный сценарий без курсоров и персон.
 * Интерфейс сам проходит цикл «поиск → запись → пароль → копирование →
 * журнал действий → сброс», после чего долго «дышит» в покое.
 * Сцена 1344×725 масштабируется под ширину контейнера через --pw-s.
 */

type Person = { full: string; init: string; color: string };
type PersonKey = 'marina' | 'ilya' | 'sasha';
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
const PEOPLE: Record<PersonKey, Person> = {
  marina: { full: 'Марина Ковалёва', init: 'М', color: '#ff6b4a' },
  ilya: { full: 'Илья Смирнов', init: 'И', color: '#8b7cff' },
  sasha: { full: 'Саша Орлов', init: 'С', color: '#2fcb8f' },
};

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
  cloud: '<svg viewBox="0 0 20 20"><path fill="#e3e6ea" d="M5.7 15.6a3.7 3.7 0 0 1-.6-7.3 4.7 4.7 0 0 1 9.1-1.1 3.2 3.2 0 0 1 .9 6.3c-.2.1-.4.1-.6.1z"/></svg>',
  astra: '<svg viewBox="0 0 18 18"><path fill="#0b5f9b" d="M9 1l2.1 5.2 5.6.4-4.3 3.6 1.4 5.5L9 12.7l-4.8 3 1.4-5.5L1.3 6.6l5.6-.4z"/></svg>',
  sprint: '<svg viewBox="0 0 12 12"><path d="M2.6 8.3c1.6 1.3 4.5 1.5 5.8-.2.9-1.4-.5-2.4-2-2.7C5 5 3.6 4.6 3.7 3.3 3.8 2 5.7 1.4 7.3 1.9" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
};

const glyph = (kind: Entry['icon'], large = false) => {
  const cls = `pw-glyph pw-glyph--${kind}${large ? ' pw-glyph--lg' : ''}`;
  if (kind === 'emergency') return `<span class="${cls} pw-glyph--sq">E</span>`;
  if (kind === 'py') return `<span class="${cls} pw-glyph--sq">py</span>`;
  if (kind === 'sprinthost') return `<span class="${cls}">${ICONS.sprint}</span>`;
  if (kind === 'cloud') return `<span class="${cls}">${ICONS.cloud}</span>`;
  return `<span class="${cls}">${ICONS.astra}</span>`;
};

const random = (a: number, b: number) => a + Math.random() * (b - a);

/* Сценарий: запись, которая открыта в покое, и запись, которую находит поиск. */
const HOME_ENTRY = 'sprinthost';
const FOUND_ENTRY = 'astra';
const QUERY = 'admin';

export function initLiveDashboard(embed: HTMLElement): () => void {
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
    scale = embed.clientWidth / WIDTH || 1;
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

  /* Нейтральная подсветка активного элемента — одна на весь интерфейс. */
  let focused: Element | null = null;
  const focus = (selector: string) => {
    blur();
    const el = $(selector);
    if (!el) return null;
    el.classList.add('pw-hl');
    focused = el;
    return el;
  };
  const blur = () => {
    focused?.classList.remove('pw-hl');
    focused = null;
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
  const eraseSearch = async () => {
    searchFocus();
    await sleep(260);
    while (alive && state.query) {
      setQuery(state.query.slice(0, -1));
      await sleep(random(32, 50));
    }
    searchBlur();
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

  /* ---------- сценарий ---------- */
  const scenario = async () => {
    await sleep(random(900, 1300));
    while (alive) {
      // поиск
      focus('.pw-search');
      searchFocus();
      await sleep(420);
      await typeSearch(QUERY);
      await sleep(random(520, 700));
      blur();

      // найденная запись: поле поиска теряет фокус, запрос остаётся
      if (focus(`.pw-item[data-id="${FOUND_ENTRY}"]`)) {
        await sleep(360);
        press(focused);
        searchBlur();
        selectEntry(FOUND_ENTRY);
        blur();
      }
      await sleep(random(1000, 1300));

      // пароль
      if (focus('[data-act="eye"]')) {
        await sleep(320);
        press(focused);
        await revealTyped();
      }
      await sleep(random(1200, 1500));

      // копирование
      const copyBtn = focus('[data-copy="pass"]');
      if (copyBtn) {
        await sleep(260);
        press(copyBtn);
        copyFlash(copyBtn);
        await sleep(1350);
        blur();
        setReveal(false);
      }
      await sleep(random(500, 700));

      // журнал действий
      if (focus('[data-tab="history"]')) {
        await sleep(300);
        blur();
        setTab('history', { stagger: true });
      }
      await sleep(random(3400, 3800));

      // сброс к исходному виду
      await eraseSearch();
      await sleep(240);
      selectEntry(HOME_ENTRY);

      // покой: живут только TOTP и фон
      await sleep(random(9000, 11000));
    }
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    // без движения: сразу конечное состояние — запись открыта, журнал заполнен
    state.tab = 'history';
    renderDetail();
  } else {
    void scenario();
  }

  return () => {
    alive = false;
    window.clearInterval(totpTimer);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    resizeObserver?.disconnect();
    if (!resizeObserver) window.removeEventListener('resize', fit);
    intersection?.disconnect();
    blur();
    state.query = '';
    searchBlur();
    app.querySelectorAll('.pw-toast').forEach((el) => el.remove());
  };
}
