import ApplicationSectors from './application-sectors';
import CardGlow from './card-glow';
import FstecTrustMark from './fstec-trust-mark';

/*
 * Figma 45:6893: панель сертификации на два столбца и два ряда, справа —
 * четыре квадратные карточки применения. Сетка из четырёх равных колонок
 * повторяет контейнер секции 1080 px: (1080 − 3 × 10) / 4 = 262.5.
 */

export default function SecurityProofGrid() {
  return (
    <div className="figma-security-grid">
      <article className="figma-security-card is-fstec" aria-labelledby="security-proof-fstec">
        <CardGlow
          className="security-card-glow"
          borderOnly
          interiorGlow={0.15}
        />
        {/*
          Синее свечение макета — изображение 1892 × 828, повёрнутое на 90°
          с blur(100px). Поворот и размытие запечены в ассет: тот же кадр
          под фильтром в рантайме занимал бы 1.5 Мп на каждой перерисовке.
        */}
        <div className="figma-security-card__bloom" aria-hidden="true" />
        <FstecTrustMark />
        <div className="figma-security-card__copy">
          <h3 id="security-proof-fstec">ФСТЭК России, 4 уровень доверия</h3>
          <p>Соответствует требованиям госсектора<br />и критической инфраструктуры</p>
        </div>
      </article>
      <ApplicationSectors />
    </div>
  );
}
