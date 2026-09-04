import type { CSSProperties } from 'react';
import SecurityArt from './security-art';

const securityProofs = [
  {
    title: 'ФСТЭК России, 4 уровень доверия',
    description:
      'Соответствует требованиям госсектора и критической инфраструктуры',
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
    description:
      'Полное развёртывание на серверах заказчика без зависимости от облачных провайдеров',
    kind: 'infrastructure',
  },
  {
    title: 'Отсутствие передачи данных',
    description:
      'Без телеметрии, внешних API и зависимости от зарубежных сервисов',
    kind: 'data',
  },
] as const;

function MfaArtwork() {
  return (
    <div className="clerk-art clerk-art--mfa" aria-hidden="true">
      <div className="clerk-mfa">
        {Array.from({ length: 6 }, (_, index) => (
          <span
            className="clerk-mfa__cell"
            key={index}
            style={
              { '--clerk-delay': `${index * 120}ms` } as CSSProperties
            }
          >
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

function SecurityProofVisual({
  kind,
}: {
  kind: (typeof securityProofs)[number]['kind'];
}) {
  if (kind === 'fstec') return <MfaArtwork />;
  return <SecurityArt kind={kind} />;
}

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
          <SecurityProofVisual kind={proof.kind} />
          <div className="figma-security-card__copy">
            <h3>{proof.title}</h3>
            <p>{proof.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
