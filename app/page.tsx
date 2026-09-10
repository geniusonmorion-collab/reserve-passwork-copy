/* eslint-disable @next/next/no-img-element */

import AuroraTransition from './aurora-transition';
import ClientLogoRotator from './client-logo-rotator';
import PassworkHero from './passwork-hero';
import PassworkIntro from './passwork-intro';
import SecurityProofGrid from './security-proof-grid';
import ProductFeatureTabs from './product-feature-tabs';
import WhatYouGet from './what-you-get';
import FaqSection from './faq-section';
import PassworkHeader from './passwork-header';

export default function Home() {
  return (
    <>
      <PassworkHeader />
      <div id="top" className="figma-passwork-page">
        <main>
          <PassworkHero />

          <div className="pw-page-frame">
            <ClientLogoRotator />

            <PassworkIntro />

            <section className="figma-security" id="certification" aria-labelledby="security-title">
              <div className="figma-shell figma-security__inner">
                <div className="figma-security__heading">
                  <h2 id="security-title">
                    Российское решение<br />для корпоративной безопасности
                  </h2>
                  <p>
                    Соответствие требованиям ФСТЭК подтверждено сертификатом №&nbsp;5063 по 4-му уровню доверия.
                    <br />
                    Пассворк работает внутри инфраструктуры компании и хранит данные на её серверах
                  </p>
                </div>

                <SecurityProofGrid />
              </div>
            </section>

            <ProductFeatureTabs />

            <WhatYouGet />

            <FaqSection />
          </div>

          <AuroraTransition />
        </main>
      </div>
    </>
  );
}
