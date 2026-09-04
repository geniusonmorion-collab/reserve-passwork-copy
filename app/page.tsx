/* eslint-disable @next/next/no-img-element */

import PostHeroSections from './post-hero-sections';
import ClientLogoRotator from './client-logo-rotator';
import LiveDashboard from './live-dashboard';
import SecurityProofGrid from './security-proof-grid';

const navigation = [
  { label: 'Компания', href: '#company' },
  { label: 'Ресурсы', href: '#resources' },
  { label: 'Поддержка', href: '#certification' },
  { label: 'Цены', href: '#certification' },
] as const;

const sectors = [
  { title: 'Производство', subtitle: 'АСУ ТП 1 класса' },
  { title: 'Инфраструктура', subtitle: 'КИИ 1 категории' },
  { title: 'Госорганы', subtitle: 'ГИС 1 класса' },
  { title: 'Операторы ПДн', subtitle: 'ИСПДн 1 уровня' },
] as const;

function Brand() {
  return (
    <a className="figma-brand" href="#top" aria-label="Пассворк — на главную">
      <img
        className="figma-brand__symbol"
        src="/assets/figma-9206/passwork-symbol.png"
        alt=""
        width="29"
        height="29"
      />
      <img
        className="figma-brand__wordmark"
        src="/assets/figma-9206/passwork-wordmark.png"
        alt="Пассворк"
        width="99"
        height="20"
      />
    </a>
  );
}

function PrimaryAction({ className = '' }: { className?: string }) {
  return (
    <a className={`figma-button figma-button--primary ${className}`} href="#certification">
      Попробовать бесплатно
    </a>
  );
}

export default function Home() {
  return (
    <div id="top" className="figma-passwork-page">
      <header className="figma-site-header">
        <Brand />

        <nav className="figma-site-header__nav" aria-label="Основная навигация">
          {navigation.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>

        <PrimaryAction className="figma-site-header__cta" />
      </header>

      <main>
        <section className="figma-hero" aria-labelledby="hero-title">
          <div className="figma-hero__base" aria-hidden="true" />
          <span className="figma-hero__aurora figma-hero__aurora--top" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>

          <div className="figma-hero__copy">
            <h1 id="hero-title">
              Пассворк — основа вашей
              <br />
              информационной безопасности
            </h1>
            <p>
              Управление корпоративными паролями, доступами и действиями — в одном
              защищённом контуре.
            </p>
            <div className="figma-hero__actions">
              <PrimaryAction />
              <a className="figma-button figma-button--secondary" href="#certification">
                Получить демо
              </a>
            </div>
          </div>

          <div className="figma-hero__visual" aria-hidden="true">
            <span className="figma-hero__visual-gradient" />
            <span className="figma-hero__aurora figma-hero__aurora--stage">
              <i />
              <i />
              <i />
            </span>
            <img
              className="figma-hero__texture"
              src="/assets/figma-9206/hero-texture.png"
              alt=""
            />
            <LiveDashboard />
          </div>
        </section>

        <ClientLogoRotator />

        <section className="figma-security" id="company">
          <div className="figma-shell">
            <h2 className="figma-security__statement">
              <span>Пассворк разработан в России и входит в реестр отечественного ПО. </span>
              <span>
                Он объединяет пароли, доступы
                <br />и действия команды в едином защищённом пространстве
              </span>
            </h2>

            <SecurityProofGrid />

            <section
              className="figma-certification"
              id="certification"
              aria-labelledby="certification-title"
            >
              <h2 id="certification-title">
                Пассворк сертифицирован
                <br />
                ФСТЭК России
              </h2>
              <div className="figma-certification__copy">
                <p>
                  Соответствие требованиям ФСТЭК подтверждено сертификатом № 5063
                  по 4-му уровню доверия. Пассворк работает внутри инфраструктуры
                  компании и хранит данные на её серверах
                </p>
                <PrimaryAction />
              </div>
            </section>

            <section className="figma-sectors" id="resources" aria-label="Области применения">
              {sectors.map((sector) => (
                <article className="figma-sector-card" key={sector.title}>
                  <img
                    src="/assets/figma-9206/audience-icon.svg"
                    alt=""
                    width="32"
                    height="32"
                    aria-hidden="true"
                  />
                  <div>
                    <h3>{sector.title}</h3>
                    <p>{sector.subtitle}</p>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </section>

        <div className="figma-transition-lead" aria-hidden="true" />
        <PostHeroSections transitionOnly />
      </main>
    </div>
  );
}
