const sectors = [
  { title: 'Производство', subtitle: 'АСУ ТП 1 класса' },
  { title: 'Инфраструктура', subtitle: 'КИИ 1 категории' },
  { title: 'Госорганы', subtitle: 'ГИС 1 класса' },
  { title: 'Операторы ПДн', subtitle: 'ИСПДн 1 уровня' },
] as const;

export default function ApplicationSectors() {
  return (
    <div className="figma-sectors" role="list" aria-label="Области применения">
      {sectors.map((sector) => (
        <article className="figma-sector-card" key={sector.title} role="listitem">
          <div className="figma-sector-card__copy">
            <h3>{sector.title}</h3>
            <p>{sector.subtitle}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
