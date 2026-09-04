import type { CSSProperties } from 'react';

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

const gostCipherRows = [
  '4A6C F291 073B',
  '88D1 5E0A 74C9',
  '16EF 3D27 A9B4',
  'C702 5F18 6E93',
] as const;

const blockedRows = [
  ['telemetry.passwork', 'Заблокировано · 0 запросов'],
  ['external.api', 'Заблокировано · 0 запросов'],
  ['cloud.service', 'Заблокировано · 0 запросов'],
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

function GostEncryptionArtwork() {
  return (
    <div className="clerk-art clerk-art--gost" aria-hidden="true">
      <div className="gost-flow">
        <div className="gost-flow__source">
          <div className="gost-flow__document">
            <span className="gost-flow__document-head">
              <i />
              <i />
              <i />
            </span>
            {['74%', '56%', '66%'].map((width, index) => (
              <span
                className="gost-flow__source-line"
                key={width}
                style={
                  {
                    '--gost-delay': `${index * 90}ms`,
                    '--gost-line-width': width,
                  } as CSSProperties
                }
              >
                <i />
              </span>
            ))}
          </div>
          <small>Открытые данные</small>
        </div>

        <span className="gost-flow__route gost-flow__route--in" />

        <div className="gost-flow__cipher">
          <span className="gost-flow__cipher-ring" />
          <svg viewBox="0 0 64 64">
            <path
              className="gost-flow__lock-shackle"
              d="M20 29v-8c0-7 5-12 12-12s12 5 12 12v8"
            />
            <rect
              className="gost-flow__lock-body"
              x="14"
              y="27"
              width="36"
              height="29"
              rx="5"
            />
            <path className="gost-flow__keyhole" d="M32 37v9" />
          </svg>
          <strong>ГОСТ 34.12</strong>
        </div>

        <span className="gost-flow__route gost-flow__route--out" />

        <div className="gost-flow__result">
          <div className="gost-flow__output">
            {gostCipherRows.map((row, index) => (
              <span
                key={row}
                style={
                  { '--gost-delay': `${index * 85}ms` } as CSSProperties
                }
              >
                {row}
              </span>
            ))}
            <i className="gost-flow__output-scan" />
            <i className="gost-flow__seal">✓</i>
          </div>
          <small>Зашифровано</small>
        </div>
      </div>
    </div>
  );
}

function InfrastructureArtwork() {
  return (
    <div className="clerk-art clerk-art--session" aria-hidden="true">
      <div className="clerk-session">
        <div className="infra-flow">
          <div className="infra-flow__client">
            <span className="infra-flow__device">
              <i>PW</i>
            </span>
            <small>Клиент Passwork</small>
          </div>

          <span className="infra-flow__route infra-flow__route--request" />

          <div className="infra-flow__gate">
            <span className="infra-flow__gate-ring" />
            <svg viewBox="0 0 50 58">
              <path
                className="infra-flow__shield"
                d="M25 2 45 10v15c0 14-8.5 24.5-20 31C13.5 49.5 5 39 5 25V10L25 2Z"
              />
              <path
                className="infra-flow__check"
                d="m15 29 7 7 14-16"
                pathLength="1"
              />
            </svg>
            <strong>Проверка доступа</strong>
          </div>

          <span className="infra-flow__route infra-flow__route--approved" />

          <div className="infra-flow__servers">
            {Array.from({ length: 3 }, (_, rackIndex) => (
              <span
                className="infra-flow__rack"
                key={rackIndex}
                style={
                  { '--rack-delay': `${rackIndex * 120}ms` } as CSSProperties
                }
              >
                {Array.from({ length: 3 }, (_, ledIndex) => (
                  <i
                    key={ledIndex}
                    style={
                      {
                        '--led-delay': `${rackIndex * 120 + ledIndex * 70}ms`,
                      } as CSSProperties
                    }
                  />
                ))}
                <b />
              </span>
            ))}
            <small>Локальные серверы</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function FraudArtwork() {
  return (
    <div className="clerk-art clerk-art--fraud" aria-hidden="true">
      <div className="clerk-fraud">
        <div className="clerk-fraud__status">
          <span className="clerk-fraud__spinner" />
          <strong>Исходящие соединения заблокированы</strong>
          <time>0</time>
        </div>

        <div className="clerk-fraud__feed">
          <svg
            className="clerk-fraud__route"
            viewBox="0 0 39 150"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M2 0v20.5c0 2.1.84 4.16 2.34 5.66l30.32 30.32A8 8 0 0 1 37 62.14V150" />
          </svg>

          {blockedRows.map(([name, detail], index) => (
            <div
              className="clerk-fraud__event"
              key={name}
              style={
                { '--clerk-delay': `${index * 180}ms` } as CSSProperties
              }
            >
              <span className="clerk-fraud__node">
                <i />
                <b>×</b>
              </span>
              <span className="clerk-fraud__event-copy">
                <strong>{name}</strong>
                <small>{detail}</small>
              </span>
            </div>
          ))}
        </div>
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
  if (kind === 'gost') return <GostEncryptionArtwork />;
  if (kind === 'infrastructure') return <InfrastructureArtwork />;
  return <FraudArtwork />;
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
