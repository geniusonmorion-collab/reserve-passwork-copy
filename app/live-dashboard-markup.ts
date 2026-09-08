/* Статичная разметка дашборда (сайдбар, шапка, список) и пустая полоса вкладок тура.
   Список записей, панель пароля и вкладки дорисовывает live-dashboard-engine.ts. */

export const LIVE_DASHBOARD_MARKUP = `
<div class="pw-stage">
<div class="pw-app">
  <aside class="pw-side">
    <div class="pw-side__top">
      <div class="pw-search" data-id="search"><svg class="pw-ico" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.6"/><path d="M10.5 10.5 14 14"/></svg><span class="pw-search__field"><span class="pw-search__placeholder">Поиск</span><span class="pw-search__value"></span><i class="pw-search__caret"></i></span><span class="pw-search__clear" data-act="search-clear"><svg class="pw-ico" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></span></div>
      <nav class="pw-nav">
        <div class="pw-nav-item" data-id="recent"><svg class="pw-ico" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.4 1.5"/></svg><span>Недавние</span></div>
        <div class="pw-nav-item" data-id="fav"><svg class="pw-ico" viewBox="0 0 16 16"><path d="m8 1.9 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.7l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/></svg><span>Избранные</span></div>
        <div class="pw-nav-item" data-id="inbox"><svg class="pw-ico" viewBox="0 0 16 16"><path d="M2 9.5V12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5M2 9.5 3.6 3.8A1 1 0 0 1 4.6 3h6.8a1 1 0 0 1 1 .8L14 9.5M2 9.5h3.2l.8 1.5h4l.8-1.5H14"/></svg><span>Входящие</span></div>
      </nav>
      <div class="pw-sec"><span class="pw-sec__title">Приватные сейфы</span><span class="pw-sec__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m2 6.5 3-3 3 3"/></svg></span><span class="pw-sec__add" data-act="add-private"><svg class="pw-ico" viewBox="0 0 10 10"><path d="M5 1.5v7M1.5 5h7"/></svg></span></div>
      <div class="pw-tree">
        <div class="pw-tree-group" data-id="budget">
          <div class="pw-tree-row pw-tree-row--l1" data-id="budget"><span class="pw-tree-row__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m3.5 1.5 3.5 3.5-3.5 3.5"/></svg></span><span class="pw-tree-row__text">Бюджеты</span></div>
          <div class="pw-tree-children"><div>
            <div class="pw-tree-row pw-tree-row--l2"><span class="pw-tree-row__chev"></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#d5a021" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">2026</span></div>
            <div class="pw-tree-row pw-tree-row--l2"><span class="pw-tree-row__chev"></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#777" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">Резерв</span></div>
          </div></div>
        </div>
      </div>
      <div class="pw-sec"><span class="pw-sec__title">Общие сейфы</span><span class="pw-sec__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m2 6.5 3-3 3 3"/></svg></span><span class="pw-sec__add" data-act="add-shared"><svg class="pw-ico" viewBox="0 0 10 10"><path d="M5 1.5v7M1.5 5h7"/></svg></span></div>
      <div class="pw-tree">
        <div class="pw-tree-group pw-tree-group--marked is-open" data-id="admin">
          <div class="pw-tree-row pw-tree-row--l1" data-id="admin"><span class="pw-tree-row__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m3.5 1.5 3.5 3.5-3.5 3.5"/></svg></span><span class="pw-tree-row__text">Администрирование</span></div>
          <div class="pw-tree-children"><div>
            <div class="pw-tree-group is-open" data-id="auth">
              <div class="pw-tree-row pw-tree-row--l2" data-id="auth"><span class="pw-tree-row__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m3.5 1.5 3.5 3.5-3.5 3.5"/></svg></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#9376d1" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">Авторизация и 2FA</span></div>
              <div class="pw-tree-children"><div>
                <div class="pw-tree-row pw-tree-row--l3 pw-tree-row--active" data-id="access"><span class="pw-tree-row__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m3.5 1.5 3.5 3.5-3.5 3.5"/></svg></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#777" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">Доступы к серверам</span></div>
              </div></div>
            </div>
            <div class="pw-tree-group" data-id="test">
              <div class="pw-tree-row pw-tree-row--l2 pw-tree-row--dim" data-id="test"><span class="pw-tree-row__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m3.5 1.5 3.5 3.5-3.5 3.5"/></svg></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#5d5e60" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">Тестовые сервера</span></div>
              <div class="pw-tree-children"><div>
                <div class="pw-tree-row pw-tree-row--l3"><span class="pw-tree-row__chev"></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#777" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">Staging</span></div>
                <div class="pw-tree-row pw-tree-row--l3"><span class="pw-tree-row__chev"></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#777" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">QA-стенд</span></div>
              </div></div>
            </div>
          </div></div>
        </div>
        <div class="pw-tree-group" data-id="ads">
          <div class="pw-tree-row pw-tree-row--l1" data-id="ads"><span class="pw-tree-row__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m3.5 1.5 3.5 3.5-3.5 3.5"/></svg></span><span class="pw-tree-row__text">Реклама</span></div>
          <div class="pw-tree-children"><div>
            <div class="pw-tree-row pw-tree-row--l2"><span class="pw-tree-row__chev"></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#e0563f" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">Яндекс Директ</span></div>
            <div class="pw-tree-row pw-tree-row--l2"><span class="pw-tree-row__chev"></span><span class="pw-tree-row__folder"><svg viewBox="0 0 20 16"><path fill="#23aad9" d="M1 3.2A1.7 1.7 0 0 1 2.7 1.5h4.4l1.8 1.8h8.4A1.7 1.7 0 0 1 19 5v8.3a1.7 1.7 0 0 1-1.7 1.7H2.7A1.7 1.7 0 0 1 1 13.3z"/></svg></span><span class="pw-tree-row__text">VK Реклама</span></div>
          </div></div>
        </div>
      </div>
      <div class="pw-sec"><span class="pw-sec__title">Корпоративные сейфы</span><span class="pw-sec__chev"><svg class="pw-ico" viewBox="0 0 10 10"><path d="m2 3.5 3 3 3-3"/></svg></span><span class="pw-sec__add" data-act="add-corp"><svg class="pw-ico" viewBox="0 0 10 10"><path d="M5 1.5v7M1.5 5h7"/></svg></span></div>
    </div>
    <div class="pw-side__bottom">
      <div class="pw-nav-item" data-id="hidden"><svg class="pw-ico" viewBox="0 0 16 16"><path d="M2 2l12 12M6.6 6.7A2 2 0 0 0 9.3 9.4M4.2 4.3C2.8 5.2 1.9 6.5 1.4 8c1.2 3 3.6 4.7 6.6 4.7 1.3 0 2.5-.3 3.5-.9M7 3.4c.3 0 .7-.1 1-.1 3 0 5.4 1.7 6.6 4.7-.4 1-1 1.9-1.7 2.6"/></svg><span>14 скрытых сейфов</span></div>
      <div class="pw-nav-item" data-id="trash"><svg class="pw-ico" viewBox="0 0 16 16"><path d="M2.5 4.2h11M6 4.2V2.8h4v1.4M3.8 4.2l.7 9a1 1 0 0 0 1 .9h5a1 1 0 0 0 1-.9l.7-9M6.6 7v4.4M9.4 7v4.4"/></svg><span>Корзина</span></div>
    </div>
  </aside>
  <div class="pw-main">
    <header class="pw-head">
      <div class="pw-crumbs"><span>Администрирование</span><span>/</span><span>…</span><span>/</span><b>Доступы к серверам</b></div>
      <div class="pw-people">
        <div class="pw-avatars">
          <span class="pw-avatar" style="background:linear-gradient(135deg,#ff8a65,#ff5a3a)">М<i class="pw-avatar__dot"></i></span>
          <span class="pw-avatar" style="background:linear-gradient(135deg,#a89bff,#7a66ff)">И<i class="pw-avatar__dot"></i></span>
          <span class="pw-avatar" style="background:linear-gradient(135deg,#4fdba6,#22b57a)">С<i class="pw-avatar__dot"></i></span>
          <span class="pw-avatar pw-avatar--letter">A</span>
          <span class="pw-avatar pw-avatar--letter">B</span>
        </div>
        <span class="pw-circle" data-act="head-share"><svg class="pw-ico" viewBox="0 0 16 16"><circle cx="6.5" cy="5.2" r="2.7"/><path d="M1.8 13.5c.4-2.6 2.2-4.1 4.7-4.1 1 0 1.9.2 2.6.7M12.5 8.6v4.6M10.2 10.9h4.6"/></svg></span>
        <div class="pw-people__text"><b>Доступ к папке:</b><span>33 пользователя</span></div>
      </div>
      <div class="pw-head__actions">
        <span class="pw-round" data-act="head-more"><svg class="pw-ico" viewBox="0 0 18 18" style="fill:currentColor;stroke:none"><circle cx="4" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/><circle cx="14" cy="9" r="1.5"/></svg></span>
        <span class="pw-btn-add" data-act="add-password">Добавить пароль</span>
      </div>
    </header>
    <div class="pw-body">
      <section class="pw-list">
        <div class="pw-label pw-label--folders">Папки</div>
        <div class="pw-folders">
          <div class="pw-folder" data-id="servers"><svg viewBox="0 0 22 18"><path fill="#23aad9" d="M1 3.4A1.9 1.9 0 0 1 2.9 1.5h5l2 2h9.2A1.9 1.9 0 0 1 21 5.4v9.2a1.9 1.9 0 0 1-1.9 1.9H2.9A1.9 1.9 0 0 1 1 14.6z"/></svg><span>Серверы</span></div>
          <div class="pw-folder" data-id="mail"><svg viewBox="0 0 22 18"><path fill="#3bc78f" d="M1 3.4A1.9 1.9 0 0 1 2.9 1.5h5l2 2h9.2A1.9 1.9 0 0 1 21 5.4v9.2a1.9 1.9 0 0 1-1.9 1.9H2.9A1.9 1.9 0 0 1 1 14.6z"/></svg><span>Почта</span></div>
        </div>
        <div class="pw-list__divider"></div>
        <div class="pw-label pw-label--second">Название</div>
        <div class="pw-items"></div>
      </section>
      <section class="pw-detail"></section>
    </div>
  </div>
</div>
</div>
<div class="pw-tour" role="tablist" aria-label="Возможности Пассворка"></div>
`;
