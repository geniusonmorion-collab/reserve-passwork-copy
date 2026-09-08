import SecurityArt from './security-art';

/* Figma 485:9866: одна большая карточка слева и три компактные справа. */
const securityProofs = [
  {
    title: 'ФСТЭК России, 4 уровень доверия',
    description: 'Соответствует требованиям госсектора\nи критической инфраструктуры',
    kind: 'fstec',
  },
  {
    title: 'ГОСТ-шифрование',
    description:
      'Подтверждает соответствие требованиям безопасности госсектора и критической инфраструктуры',
    kind: 'gost',
  },
  {
    title: 'Размещение внутри инфраструктуры',
    description: 'Полное развёртывание на серверах заказчика без зависимости от облачных провайдеров',
    kind: 'infrastructure',
  },
  {
    title: 'Отсутствие передачи данных',
    description: 'Без телеметрии, внешних API\nи зависимостей от зарубежных сервисов',
    kind: 'data',
  },
] as const;

export default function SecurityProofGrid() {
  return (
    <div className="figma-security-grid" role="list">
      {securityProofs.map((proof) => (
        <article
          aria-labelledby={`security-proof-${proof.kind}`}
          className={`figma-security-card is-${proof.kind}`}
          key={proof.title}
          role="listitem"
        >
          <SecurityArt kind={proof.kind} />
          <div className="figma-security-card__copy">
            <h3 id={`security-proof-${proof.kind}`}>{proof.title}</h3>
            <p>{proof.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
