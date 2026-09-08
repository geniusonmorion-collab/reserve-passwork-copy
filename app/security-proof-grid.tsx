import ApplicationSectors from './application-sectors';

/* Figma 485:9384: full-width certification panel with four sectors below. */

export default function SecurityProofGrid() {
  return (
    <div className="figma-security-grid">
      <article className="figma-security-card is-fstec" aria-labelledby="security-proof-fstec">
        <div className="figma-security-card__copy">
          <h3 id="security-proof-fstec">ФСТЭК России, 4 уровень доверия</h3>
          <p>Соответствует требованиям госсектора<br />и критической инфраструктуры</p>
        </div>
      </article>
      <ApplicationSectors />
    </div>
  );
}
