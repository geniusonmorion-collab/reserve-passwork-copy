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
            <div className="figma-hero__badge">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 1.6 13.4 3.8v3.9c0 3.2-2.3 5.5-5.4 6.7C4.9 13.2 2.6 10.9 2.6 7.7V3.8z" />
                <path d="m5.6 8 1.7 1.7L10.6 6" />
              </svg>
              <span>Сделано в России</span>
              <i aria-hidden="true" />
              <span>Реестр отечественного ПО</span>
            </div>
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
            <LiveDashboard />
          </div>
        </section>

        <ClientLogoRotator />

        <section className="figma-security" id="company">
          <div className="figma-shell">
            <h2 className="figma-security__statement">
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
