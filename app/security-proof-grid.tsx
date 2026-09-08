import SecurityArt from './security-art';

/*
 * Три доказательства суверенности: ГОСТ-шифрование, размещение внутри
 * инфраструктуры, отсутствие передачи данных. Сертификация ФСТЭК живёт
 * в отдельном блоке (fstec-section.tsx) и здесь не дублируется.
 */
const securityProofs = [
  {
    title: 'ГОСТ-шифрование',
    description:
      'Шифрование по российскому стандарту ГОСТ Р 34.12-2015 — требование госсектора и критической инфраструктуры',
    kind: 'gost',
  },
  {
    title: 'Размещение внутри инфраструктуры',
    description: 'Полное развёртывание на серверах заказчика — без зависимости от облачных провайдеров',
    kind: 'infrastructure',
  },
  {
    title: 'Отсутствие передачи данных',
    description: 'Без телеметрии, внешних API и зависимости от зарубежных сервисов',
    kind: 'data',
  },
] as const;

export default function SecurityProofGrid() {
  return (
    <div className="figma-security-grid" role="list">
      {securityProofs.map((proof) => (
        <article
          aria-label={`${proof.title}. Анимация запускается при наведении`}
          className={`figma-security-card is-${proof.kind}`}
          key={proof.title}
          role="listitem"
          tabIndex={0}
        >
          <div className="figma-security-card__copy">
            <h3>{proof.title}</h3>
            <p>{proof.description}</p>
          </div>
          <SecurityArt kind={proof.kind} />
        </article>
      ))}
    </div>
  );
}
