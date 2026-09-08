/* eslint-disable @next/next/no-img-element */

import PostHeroSections from './post-hero-sections';
import ClientLogoRotator from './client-logo-rotator';
import LiveDashboard from './live-dashboard';
import SecurityProofGrid from './security-proof-grid';
import FstecSection from './fstec-section';

const navigation = [
  { label: 'Компания', href: '#company' },
  { label: 'Ресурсы', href: '#resources' },
  { label: 'Поддержка', href: '#certification' },
  { label: 'Цены', href: '#certification' },
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

          <div className="figma-hero__copy">
            <div className="figma-hero__origin">
              <span className="figma-hero__origin-flag" aria-hidden="true" />
              <span>Сделано в России</span>
            </div>
            <h1 id="hero-title">
              <span className="figma-hero__title-line">Пассворк — основа вашей</span>
              <span className="figma-hero__title-line">информационной безопасности</span>
            </h1>
            <p>
              Управление корпоративными паролями, доступами и действиями — в одном
              защищённом контуре
            </p>
            <div className="figma-hero__actions">
              <PrimaryAction />
              <a className="figma-button figma-button--secondary" href="#certification">
                Получить демо
              </a>
            </div>
          </div>

          <div className="figma-hero__visual" aria-hidden="true">
            <div className="figma-hero__background">
              <span className="figma-hero__visual-gradient" />
              <img
                className="figma-hero__cast-shadow"
                src="/assets/figma-473-454/hero-cast-shadow.png"
                alt=""
                width="1920"
                height="891"
                draggable="false"
              />
              <img
                className="figma-hero__shade"
                src="/assets/figma-473-454/hero-floor-light.png"
                alt=""
                width="1898"
                height="1072"
                draggable="false"
              />
            </div>
            <img
              className="figma-hero__contact-shadow"
              src="/assets/figma-473-454/hero-contact-shadow.svg"
              alt=""
              width="1451.2"
              height="71.2"
              draggable="false"
            />
            <LiveDashboard />
          </div>
        </section>

        <ClientLogoRotator />

        <section className="figma-security" id="company" aria-labelledby="security-title">
          <div className="figma-shell figma-security__inner">
            <h2 className="figma-security__statement" id="security-title">
              <span>Пассворк разработан в России и входит в реестр отечественного ПО. </span>
              <span>
                Он объединяет пароли, доступы{' '}
                <br />и действия команды в едином защищённом пространстве
              </span>
            </h2>

            <SecurityProofGrid />
          </div>
        </section>

        <FstecSection />

        <div className="figma-transition-lead" aria-hidden="true" />
        <PostHeroSections transitionOnly />
      </main>
    </div>
  );
}
