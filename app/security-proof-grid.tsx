import ApplicationSectors from './application-sectors';
import CardGlow from './card-glow';
import SectorIcon from './sector-icon';

/* Figma 517:10784: certification panel beside a two-by-two sector grid. */

export default function SecurityProofGrid() {
  return (
    <div className="figma-security-grid" id="certification">
      <article className="figma-security-card is-fstec" aria-labelledby="security-proof-fstec">
        <CardGlow
          className="security-card-glow"
          baseColor="rgba(255,255,255,.1)"
          surface="var(--security-glow-surface)"
        />
        <div className="figma-security-card__copy">
          <h3 id="security-proof-fstec">ФСТЭК России, 4 уровень доверия</h3>
          <p>Соответствует требованиям госсектора<br />и критической инфраструктуры</p>
        </div>
        <SectorIcon
          name="badge-check"
          className="figma-security-card__icon"
          size={48}
        />
      </article>
      <ApplicationSectors />
    </div>
  );
}
