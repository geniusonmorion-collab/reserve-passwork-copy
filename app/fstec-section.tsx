/* Figma 485:9384: supporting statement follows the certification composition. */
export default function FstecSection() {
  return (
    <section className="figma-fstec" id="certification" aria-labelledby="fstec-title">
      <div className="figma-shell figma-fstec__inner">
        <div className="figma-fstec__head">
          <h2 className="figma-fstec__title" id="fstec-title">
            Российское решение для корпоративной безопасности
          </h2>
          <div className="figma-fstec__copy">
            <p>
              Соответствие требованиям ФСТЭК подтверждено сертификатом № 5063 по 4-му уровню доверия.
              Пассворк работает внутри инфраструктуры компании и хранит данные на её серверах
            </p>
            <a className="figma-button" href="#certification">
              Попробовать бесплатно
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
