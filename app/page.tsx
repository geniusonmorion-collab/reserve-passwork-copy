/* eslint-disable @next/next/no-img-element */

import AuroraTransition from './aurora-transition';
import ClientLogoRotator from './client-logo-rotator';
import PassworkHero from './passwork-hero';
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

            <section className="figma-security" id="company" aria-labelledby="security-title">
              <div className="figma-shell figma-security__inner">
                <h2 className="figma-security__statement" id="security-title">
                  <span>Пассворк разработан в России и входит в реестр отечественного ПО. </span>
                  <span>
                    Он объединяет пароли, доступы и действия команды в едином защищённом пространстве
                  </span>
                </h2>

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
