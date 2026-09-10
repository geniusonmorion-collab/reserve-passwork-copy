import SectorIcon from './sector-icon';
import CardGlow from './card-glow';

const sectors = [
  { title: 'Производство', subtitle: 'АСУ ТП 1 класса', icon: 'factory' },
  { title: 'Инфраструктура', subtitle: 'КИИ 1 категории', icon: 'network' },
  { title: 'Госорганы', subtitle: 'ГИС 1 класса', icon: 'landmark' },
  { title: 'Операторы ПДн', subtitle: 'ИСПДн 1 уровня', icon: 'shield-user' },
] as const;

export default function ApplicationSectors() {
  return (
    <div className="figma-sectors" role="list" aria-label="Области применения">
      {sectors.map((sector) => (
        <article className="figma-sector-card" key={sector.title} role="listitem">
          <CardGlow
            className="security-card-glow"
            borderOnly
            interiorGlow={0.15}
          />
          <SectorIcon name={sector.icon} />
          <div className="figma-sector-card__copy">
            <h3>{sector.title}</h3>
            <p>{sector.subtitle}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
