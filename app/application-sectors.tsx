import CardGlow from './card-glow';
import SectorIllustration, { type SectorSceneName } from './sector-illustrations';

/*
 * Четыре области применения, Figma 45:6893. Порядок макета: производство и
 * инфраструктура в верхнем ряду, операторы ПДн и госорганы — в нижнем.
 * Карточки — прямые элементы сетки секции, поэтому компонент возвращает
 * фрагмент, а не собственный контейнер.
 */
const sectors: readonly {
  id: string; title: string; subtitle: string; scene: SectorSceneName;
}[] = [
  { id: 'production', title: 'Производство', subtitle: 'АСУ ТП 1 класса', scene: 'production' },
  { id: 'infrastructure', title: 'Инфраструктура', subtitle: 'КИИ 1 категории', scene: 'infrastructure' },
  { id: 'personal-data', title: 'Операторы ПДн', subtitle: 'ИСПДн 1 уровня', scene: 'personal-data' },
  { id: 'government', title: 'Госорганы', subtitle: 'ГИС 1 класса', scene: 'government' },
];

export default function ApplicationSectors() {
  return <>
    {sectors.map((sector) => (
      <article
        className="figma-sector-card"
        key={sector.id}
        aria-labelledby={`sector-${sector.id}`}
      >
        <CardGlow
          className="security-card-glow"
          borderOnly
          interiorGlow={0.15}
        />
        <SectorIllustration scene={sector.scene} />
        <div className="figma-sector-card__copy">
          <h3 id={`sector-${sector.id}`}>{sector.title}</h3>
          <p>{sector.subtitle}</p>
        </div>
      </article>
    ))}
  </>;
}
