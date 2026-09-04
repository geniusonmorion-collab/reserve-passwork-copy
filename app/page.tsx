/* eslint-disable @next/next/no-img-element */

import BlueNoiseLayer from './blue-noise-layer';
import HeaderNav from './header-nav';
import HeroBackground from './hero-background';
import HeroCursorTrail from './hero-cursor-trail';
import InteractiveGridSection from './interactive-grid-section';
import PassworkKeyComposition from './passwork-key-composition';
import PostHeroSections from './post-hero-sections';
import PassworkTimeline from './passwork-timeline';
import SignalFooter from './signal-footer';
import SolutionCta from './solution-cta';
import SuiActionButton from './sui-action-button';
import UseCasesShowcase from './use-cases-showcase';

const navigation = [
  { label: 'Компания', href: '#company' },
  { label: 'Ресурсы', href: '#resources' },
  { label: 'Поддержка', href: '#support' },
  { label: 'Цены', href: '#prices' },
] as const;

const accessBenefits = [
  'Полный журнал действий пользователей',
  'Отслеживание изменений и доступа к записям',
  'Настройка политики ротации паролей',
  'Уведомления о подозрительных действиях',
];

const planAudiences = [
  {
    title: 'Для бизнеса',
    points: [
      'Храните пароли и доступы в едином защищённом пространстве.',
      'Настройте роли и права один раз для всей компании.',
      'Контролируйте действия сотрудников без ручных отчётов.',
      'Масштабируйте управление доступами вместе с бизнесом.',
    ],
  },
  {
    title: 'Для IT-команд',
    points: [
      'Выдавайте и отзывайте доступы по заданным правилам.',
      'Подключайте каталоги, браузеры и рабочие приложения.',
      'Обновляйте корпоративные пароли без ручной передачи.',
      'Отслеживайте каждое действие в подробном журнале.',
    ],
  },
] as const;

const solutionCards = [
  {
    title: 'Стандарт',
    lead: 'Доступы под политиками, а не под ручным контролем',
    features: [
      'Ролевые права и общие папки',
      'Полный журнал действий сотрудников',
      'Ротация паролей и уведомления',
    ],
    cta: 'Попробовать Стандарт',
    href: '#use-cases',
    icon: '/assets/icon-security-a.svg',
    partners: [
      { src: '/assets/logo-vtb.svg', alt: 'ВТБ' },
      { src: '/assets/logo-pik.svg', alt: 'ПИК' },
      { src: '/assets/logo-sber.png', alt: 'Сбер' },
    ],
  },
  {
    title: 'Расширенная',
    lead: 'Доступы остаются управляемыми на каждом этапе',
    features: [
      'Права видимости по ролям',
      'Быстрый онбординг и отзыв доступа',
      'LDAP, SSO и двухфакторная защита',
    ],
    cta: 'Попробовать Расширенную',
    href: '#use-cases',
    icon: '/assets/icon-government.svg',
    marks: ['AD', 'SSO', '2ФА'],
  },
  {
    title: 'ФСТЭК',
    lead: 'Секреты для приложений внутри защищённого контура',
    features: [
      'API, CLI и каталог интеграций',
      'Интеграции с CI/CD и каталогами',
      'Развёртывание on-premise',
    ],
    cta: 'Запросить звонок',
    href: '#demo',
    icon: '/assets/icon-devops.svg',
    partners: [
      { src: '/assets/devops-linux.svg', alt: 'Linux' },
      { src: '/assets/devops-mongodb.svg', alt: 'MongoDB' },
      { src: '/assets/devops-docker.svg', alt: 'Docker' },
    ],
  },
] as const;

const footerGroups = [
  {
    key: 'company',
    id: 'company',
    title: ['Компания'],
    links: [
      { label: 'О Пассворке', href: 'https://passwork.ru/' },
      { label: 'Новости', href: 'https://passwork.ru/blog/' },
      {
        label: 'Дорожная карта',
        href: 'https://passwork.ru/blog/release-notes/',
      },
      { label: 'Релизы', href: 'https://passwork.ru/blog/release-notes/' },
      { label: 'Блог', href: 'https://passwork.ru/blog/' },
    ],
  },
  {
    key: 'product',
    title: ['Продукт'],
    links: [
      { label: 'Функциональность', href: '#use-cases' },
      {
        label: 'Интеграции',
        href: 'https://passwork.ru/docs/secret-management/integrations/',
      },
      { label: 'Решения', href: '#prices' },
      { label: 'Обновления', href: 'https://passwork.ru/blog/release-notes/' },
    ],
  },
  {
    key: 'support',
    id: 'support',
    title: ['Поддержка'],
    links: [
      { label: 'Техническая документация', href: 'https://passwork.ru/docs/' },
      { label: 'Руководство пользователя', href: 'https://passwork.ru/manuals/' },
      { label: 'Центр поддержки', href: 'https://passwork.ru/help/' },
    ],
  },
  {
    key: 'browser',
    title: ['Браузерное', 'расширение'],
    links: [
      { label: 'Google Chrome', href: 'https://passwork.ru/browser-chrome' },
      { label: 'Apple Safari', href: 'https://passwork.ru/browser-safari' },
      { label: 'Mozilla Firefox', href: 'https://passwork.ru/browser-firefox' },
      { label: 'Microsoft Edge', href: 'https://passwork.ru/browser-edge' },
      { label: 'Yandex Browser', href: 'https://passwork.ru/browser-chrome' },
    ],
  },
  {
    key: 'mobile',
    title: ['Мобильное', 'приложение'],
    links: [
      {
        label: 'RuStore',
        href: 'https://www.rustore.ru/catalog/app/com.passwork.passwork_sh',
      },
      {
        label: 'AppStore',
        href: 'https://apps.apple.com/us/app/passwork-self-hosted/id1589706401',
      },
      {
        label: 'Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.passwork.passwork_sh',
      },
    ],
  },
  {
    key: 'two-factor',
    title: ['Приложение', 'Пассворк 2ФА'],
    links: [
      {
        label: 'RuStore',
        href: 'https://www.rustore.ru/catalog/app/com.passwork.authenticator',
      },
      {
        label: 'AppStore',
        href: 'https://apps.apple.com/us/developer/passwork-oy/id1584163755',
      },
      {
        label: 'Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.passwork.authenticator',
      },
    ],
  },
  {
    key: 'tools',
    title: ['Бесплатные', 'инструменты'],
    links: [
      {
        label: 'Генератор паролей',
        href: 'https://passwork.ru/manuals/browser-extension/passwords/password-generator/',
      },
      {
        label: 'Генератор парольных фраз',
        href: 'https://passwork.ru/manuals/',
      },
      {
        label: 'Генератор логинов',
        href: 'https://passwork.ru/manuals/',
      },
      {
        label: 'Проверка надёжности пароля',
        href: 'https://passwork.ru/manuals/',
      },
    ],
  },
] as const;

const footerLegalLinks = [
  {
    label: 'Политика конфиденциальности',
    href: 'https://passwork.ru/Политика_конфиденциальность.pdf',
  },
  {
    label: 'Лицензионное соглашение',
    href: 'https://passwork.ru/Лицензионное_соглашение.pdf',
  },
  { label: 'Оферта', href: 'https://passwork.ru/Оферта.pdf' },
] as const;

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Пассворк — на главную">
      <img
        className="brand__symbol"
        src="/assets/passwork-symbol.svg"
        alt=""
        width="29"
        height="29"
      />
      <img
        className="brand__wordmark"
        src="/assets/passwork-wordmark.svg"
        alt="Пассворк"
        width="99"
        height="21"
      />
    </a>
  );
}

function UseCasesSection() {
  return (
    <section
      id="use-cases"
      className="use-cases"
      aria-labelledby="use-cases-title"
    >
      <div className="use-cases__content">
        <div className="use-cases__heading">
          <h2 id="use-cases-title">
            <span>Сценарии использования</span>
            <span>
              Пасскворк для разных команд — от IT
              <br />
              до информационной безопасности
            </span>
          </h2>

          <div className="use-cases__actions">
            <a className="use-cases-button use-cases-button--primary" href="#try-free">
              <span>Попробовать бесплатно</span>
              <img
                src="/assets/chevron-right-white.svg"
                alt=""
                width="24"
                height="24"
                aria-hidden="true"
              />
            </a>
            <a className="use-cases-button use-cases-button--secondary" href="#demo">
              Получить демо
            </a>
          </div>
        </div>

        <div className="use-cases__grid">
          <article className="use-case-card use-case-card--copy">
            <div className="use-case-panel">
              <div className="use-case-panel__copy">
                <h3>
                  Контроль доступов без таблиц, чатов и ручной передачи паролей
                </h3>
                <p>
                  Все действия с паролями фиксируются в журнале, а права доступа
                  настраиваются по ролям.
                  <br />
                  Команда получает единое место для хранения, передачи и
                  регулярного обновления корпоративных доступов.
                </p>
              </div>

              <ul className="use-case-benefits">
                {accessBenefits.map((benefit) => (
                  <li key={benefit}>
                    <img
                      src="/assets/check-circle-blue.svg"
                      alt=""
                      width="16"
                      height="16"
                      aria-hidden="true"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <a className="use-case-feature-button" href="#try-free">
                <span>Все возможности для IT-команд</span>
                <img
                  src="/assets/chevron-right-white.svg"
                  alt=""
                  width="24"
                  height="24"
                  aria-hidden="true"
                />
              </a>
            </div>
          </article>

          <div className="use-case-card use-case-card--visual">
            <div
              className="activity-log-demo"
              role="img"
              aria-label="Журнал действий пользователей в Пассворк"
            >
              <img
                className="activity-log-demo__poster"
                src="/assets/activity-log.png"
                alt=""
                width="623"
                height="535"
                aria-hidden="true"
              />
              <div className="activity-log-demo__body" aria-hidden="true">
                <div className="activity-log-demo__track">
                  <span className="activity-log-demo__copy" />
                  <span className="activity-log-demo__copy" />
                  <span className="activity-log-demo__copy" />
                </div>
              </div>
              <span className="activity-log-demo__new-row" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanAudienceSection() {
  return (
    <section
      id="prices"
      className="plan-audience"
      aria-labelledby="plan-audience-title"
    >
      <h2 className="sr-only" id="plan-audience-title">
        Тарифы Пассворк для бизнеса и IT-команд
      </h2>

      <div className="plan-audience__grid">
        {planAudiences.map((audience) => (
          <article className="plan-audience__column" key={audience.title}>
            <h3>{audience.title}</h3>
            <ul>
              {audience.points.map((point) => (
                <li key={point}>
                  <span className="plan-audience__bullet" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="plan-audience__footer">
        <a className="plan-audience__cta" href="#pricing-cards">
          <span className="plan-audience__cta-icon" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>Сравнить тарифы</span>
        </a>
      </div>
    </section>
  );
}

function DottedRule() {
  return (
    <svg
      className="solution-card__rule"
      viewBox="0 0 1440 2"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 1L1440 0.999878"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="2 8"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SolutionsSection() {
  return (
    <section
      id="pricing-cards"
      className="solutions-section"
      aria-labelledby="solutions-title"
    >
      <div className="solutions-section__intro">
        <h2 id="solutions-title" className="solutions-section__title">
          <span>Тарифные планы для бизнеса</span>
          <span>любого масштаба</span>
        </h2>
      </div>

      <div className="solutions-grid">
        {solutionCards.map((card) => (
          <a className="solution-card" href={card.href} key={card.title}>
            <div className="solution-card__header">
              <div className="solution-card__header-row">
                <div className="solution-card__title-group">
                  <span className="solution-card__main-icon" aria-hidden="true">
                    <img src={card.icon} alt="" />
                  </span>
                  <h2>{card.title}</h2>
                </div>

                <div className="solution-card__partners" aria-hidden="true">
                  {'partners' in card
                    ? card.partners.map((partner) => (
                        <span className="solution-card__partner" key={partner.alt}>
                          <img src={partner.src} alt="" />
                        </span>
                      ))
                    : card.marks.map((mark) => (
                        <span className="solution-card__mark" key={mark}>
                          {mark}
                        </span>
                      ))}
                </div>
              </div>
              <DottedRule />
            </div>

            <div className="solution-card__body">
              <div className="solution-card__copy">
                <p>{card.lead}</p>
                <ul>
                  {card.features.map((feature) => (
                    <li key={feature}>
                      <svg viewBox="0 0 24 7" aria-hidden="true">
                        <path d="M1 0V7H24" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="solution-card__cta-wrap">
                <DottedRule />
                <SolutionCta label={card.cta} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section
      className="closing-section"
      id="try-free"
      aria-labelledby="closing-title"
    >
      <BlueNoiseLayer />
      <div className="closing-section__cta">
        <div className="closing-section__copy">
          <h2 id="closing-title">Возьмите под контроль все пароли и доступы</h2>
          <p>
            Настройте права, контролируйте действия и наведите порядок в доступах
            за один пилот. Решение разворачивается внутри компании и соответствует
            требованиям безопасности
          </p>
        </div>
        <div className="closing-section__actions">
          <SuiActionButton
            className="closing-button closing-button--primary"
            href="#try-free"
            label="Попробовать бесплатно"
          />
          <SuiActionButton
            id="demo"
            className="closing-button closing-button--secondary"
            href="#demo"
            label="Получить демо"
          />
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__shell">
        <div className="site-footer__top">
          <div className="site-footer__brand-block">
            <a className="site-footer__brand-name" href="#top">
              Пассворк
            </a>
            <p>
              Российская система управления паролями и привилегированным
              доступом для корпоративного использования.
            </p>
            <span>Включён в реестр отечественного ПО</span>

            <div className="site-footer__socials" aria-label="Пассворк в соцсетях">
              <a
                className="site-footer__social site-footer__social--vk"
                href="https://vk.com/passwork"
                aria-label="Пассворк во ВКонтакте"
              >
                <span aria-hidden="true">vk</span>
              </a>
              <a
                className="site-footer__social site-footer__social--tenchat"
                href="https://tenchat.ru/passwork"
                aria-label="Пассворк в TenChat"
              >
                <span aria-hidden="true">T</span>
              </a>
              <a
                className="site-footer__social site-footer__social--telegram"
                href="https://t.me/passwork_ru"
                aria-label="Пассворк в Telegram"
              >
                <span aria-hidden="true">➤</span>
              </a>
            </div>
          </div>

          <nav className="site-footer__navigation" aria-label="Навигация в подвале">
            {footerGroups.map((group) => (
              <section
                className={`site-footer__group site-footer__group--${group.key}`}
                id={'id' in group ? group.id : undefined}
                key={group.key}
              >
                <h2>
                  {group.title.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="site-footer__bottom">
          <span>© 2014–2026 ООО «Пассворк»</span>
          <nav className="site-footer__legal" aria-label="Юридическая информация">
            {footerLegalLinks.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div id="top" className="passwork-page">
      <header className="site-header">
        <Brand />

        <HeaderNav items={navigation} />

        <a className="header-cta" href="#try-free">
          <span className="header-cta__label" aria-hidden="true">
            {[...'Начать'].map((character, index) => (
              <span
                className="header-cta__char"
                style={{ transitionDelay: `${index * 10}ms` }}
                key={`${character}-${index}`}
              >
                {character}
              </span>
            ))}
          </span>
          <span className="sr-only">Начать</span>
        </a>

        <details className="site-header__mobile-menu">
          <summary aria-label="Открыть меню">
            <span className="site-header__hamburger" aria-hidden="true" />
          </summary>
          <nav aria-label="Мобильная навигация">
            {navigation.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
            <a className="site-header__mobile-cta" href="#try-free">
              Начать
            </a>
          </nav>
        </details>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <HeroBackground />
          <HeroCursorTrail />
          <PassworkKeyComposition variant="hero" />

          <div className="hero-copy">
            <h1 id="hero-title">
              <span className="hero-title__line">
                <span className="hero-title__reveal">Пассворк — основа</span>
              </span>
              <span className="hero-title__line hero-title__line--feature">
                <span className="hero-title__reveal">вашей</span>
                <span className="hero-title__feature">
                  <span className="hero-title__feature-icon" aria-hidden="true">
                    <img src="/assets/passwork-symbol.svg" alt="" />
                  </span>
                  <span className="hero-title__feature-label">
                    информационной
                  </span>
                </span>
              </span>
              <span className="hero-title__line">
                <span className="hero-title__reveal">безопасности</span>
              </span>
            </h1>
          </div>

          <div className="hero__fade" aria-hidden="true" />
        </section>

        <PostHeroSections />
        <PassworkTimeline />
        <PassworkKeyComposition />
        <PlanAudienceSection />
        <UseCasesShowcase />
        <SolutionsSection />
        <InteractiveGridSection />
        <ClosingSection />
      </main>
      <SignalFooter />
    </div>
  );
}
