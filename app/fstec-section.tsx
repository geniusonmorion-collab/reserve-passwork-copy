import Image from 'next/image';

/* Figma 485:9932: certification statement and four application sectors. */
const sectors = [
  { title: 'Производство', subtitle: 'АСУ ТП 1 класса' },
  { title: 'Инфраструктура', subtitle: 'КИИ 1 категории' },
  { title: 'Госорганы', subtitle: 'ГИС 1 класса' },
  { title: 'Операторы ПДн', subtitle: 'ИСПДн 1 уровня' },
] as const;

export default function FstecSection() {
  return (
    <section className="figma-fstec" id="certification" aria-labelledby="fstec-title">
      <div className="figma-shell">
        <div className="figma-fstec__head">
          <h2 className="figma-fstec__title" id="fstec-title">
            Пассворк сертифицирован
            <br />
            ФСТЭК России
          </h2>
          <div className="figma-fstec__copy">
            <p>
              Соответствие требованиям ФСТЭК подтверждено сертификатом № 5063 по 4-му уровню доверия.
              Пассворк работает внутри инфраструктуры компании и хранит данные на её серверах
            </p>
            <a className="figma-button figma-button--primary" href="#certification">
              Попробовать бесплатно
            </a>
          </div>
        </div>

        <div className="figma-sectors" role="list" aria-label="Области применения">
          {sectors.map((sector) => (
            <article className="figma-sector-card" key={sector.title} role="listitem">
              <Image
                className="figma-sector-card__icon"
                src="/assets/figma-485-9932/sector-icon.svg"
                alt=""
                width={32}
                height={32}
                unoptimized
              />
              <div className="figma-sector-card__copy">
                <h3>{sector.title}</h3>
                <p>{sector.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
