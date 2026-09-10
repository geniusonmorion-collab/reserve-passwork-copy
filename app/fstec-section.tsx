import type { CSSProperties } from 'react';
import SecurityFeatureGraphic from './security-feature-graphics';
import './fstec-showcase.css';

// Copy from Figma: cfKzXws2r1wr4VbJIzjBBD, node 15:3963.
const features = [
  {
    label: '01 / 04',
    title: <>ФСТЭК России,{' '}<br />4 уровень доверия</>,
    description: 'Подтверждает соответствие требованиям безопасности госсектора и критической инфраструктуры',
    note: 'Готов к проверке ФСБ',
    demo: <SecurityFeatureGraphic kind="certification" />,
  },
  {
    label: '02 / 04',
    title: 'ГОСТ-шифрование',
    description: 'Поддержка ГОСТ Р 34.10-2012 и ГОСТ Р 34.11-2012 — отечественные стандарты шифрования и подписи',
    note: 'Без иностранных зависимостей',
    demo: <SecurityFeatureGraphic kind="encryption" />,
  },
  {
    label: '03 / 04',
    title: 'Размещение внутри инфраструктуры',
    description: 'Полное on-premise развёртывание на серверах заказчика без зависимости от облачных провайдеров',
    note: 'Реестр отечественного ПО',
    demo: <SecurityFeatureGraphic kind="infrastructure" />,
  },
  {
    label: '04 / 04',
    title: 'Отсутствие передачи данных',
    description: 'Никакой телеметрии, внешних API и зависимостей от зарубежных сервисов — абсолютная изоляция',
    note: 'Безопасность и доступность данных остаются под вашим контролем.',
    demo: <SecurityFeatureGraphic kind="isolation" />,
  },
];

export default function FstecSection() {
  return (
    <section className="control-showcase" id="certification" aria-labelledby="fstec-title">
      <div className="figma-shell control-showcase__inner">
        <div className="control-showcase__head">
          <div>
            <span className="control-showcase__eyebrow">Импортозамещение</span>
            <h2 id="fstec-title">Российское решение{' '}<span>для корпоративной безопасности</span></h2>
          </div>
          <div className="control-showcase__intro">
            <p>Пассворк разработан в России и включён в реестр отечественного программного обеспечения Минцифры. В условиях санкционного давления и ухода западных вендоров, Пассворк обеспечивает полноценную замену зарубежных менеджеров паролей: 1Password, LastPass, Bitwarden Enterprise и других.</p>
            <p>Продукт не зависит от зарубежных серверов, облачных сервисов и лицензионных ограничений. Безопасность и доступность данных остаются под вашим контролем.</p>
          </div>
        </div>
        <div className="control-showcase__stack">
          {features.map((feature, index) => (
            <article
              className={`control-card${index % 2 === 1 ? ' control-card--reversed' : ''}`}
              style={{ '--card-index': index } as CSSProperties}
              aria-labelledby={`control-card-title-${index}`}
              key={feature.label}
            >
              <div className="control-card__copy">
                <span className="control-card__label"><i />{feature.label}</span>
                <div className="control-card__body">
                  <h3 id={`control-card-title-${index}`}>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <p className="control-card__note"><span className="control-card__note-mark" aria-hidden="true" />{feature.note}</p>
              </div>
              {feature.demo}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
