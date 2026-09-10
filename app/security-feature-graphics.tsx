/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from 'react';

type GraphicKind = 'certification' | 'encryption' | 'infrastructure' | 'isolation';

const graphicDetails = {
  certification: {
    label: 'СЕРТИФИКАЦИЯ',
    caption: 'ФСТЭК России · 4 уровень доверия',
    description: 'Плоская карточка с обозначением четвёртого уровня доверия ФСТЭК России и контурным щитом подтверждённой безопасности.',
  },
  encryption: {
    label: 'ГОСТ-ШИФРОВАНИЕ',
    caption: 'Отечественные стандарты защиты',
    description: 'Поток данных проходит через защищённый модуль с замком и превращается в зашифрованные последовательности. ГОСТ Р 34.10-2012 и ГОСТ Р 34.11-2012.',
  },
  infrastructure: {
    label: 'ON-PREMISE',
    caption: 'Данные остаются на ваших серверах',
    description: 'Три сервера внутри периметра компании. Команда, сервисы и администратор подключены к ним по внутренней сети.',
  },
  isolation: {
    label: 'ИЗОЛИРОВАННЫЙ КОНТУР',
    caption: '0 внешних соединений',
    description: 'Хранилище находится внутри закрытого защитного контура. Соединения с телеметрией, внешними API и облаком разорваны на границе.',
  },
};

function CertificationGraphic() {
  return (
    <>
      <div className="sg-credential">
        <div className="sg-credential__top"><span>ПАССВОРК</span><i /></div>
        <img className="sg-credential__shield" src="/assets/figma-15-3963/certification-shield.svg" width="72" height="72" alt="" />
        <div className="sg-credential__number">4</div>
        <div className="sg-credential__title">уровень<br />доверия</div>
        <div className="sg-credential__rule" />
        <span className="sg-credential__issuer">ФСТЭК РОССИИ</span>
      </div>
      <div className="sg-verification"><img src="/assets/figma-15-3963/certification-shield.svg" width="22" height="22" alt="" /><span>Соответствие подтверждено</span></div>
    </>
  );
}

const cipherLines = [
  '8f 21 b4 c0 76 3a 9d e2 51 0c f7 64',
  'a3 d8 40 9f e1 72 0b c5 68 34 fa 91',
  '6d c2 15 f9 84 0a e7 b3 52 98 41 dc',
  '02 7e a9 31 d5 f0 6b 84 c8 12 5f ea',
  'b6 43 e8 0d 95 a2 7c f1 30 69 de 54',
  'f4 18 6c a7 02 db 93 5e c0 74 2a 81',
];

function EncryptionGraphic() {
  return (
    <>
      <div className="sg-cipher-grid">{cipherLines.concat(cipherLines).map((line, index) => <span key={index}>{line}</span>)}</div>
      <div className="sg-data-card sg-data-card--input"><span>ВАШИ ДАННЫЕ</span><div /><div /><div /></div>
      <div className="sg-crypto-track sg-crypto-track--in"><i /></div>
      <div className="sg-crypto-track sg-crypto-track--out"><i /></div>
      <div className="sg-crypto-core">
        <span className="sg-crypto-core__pins sg-crypto-core__pins--left" />
        <span className="sg-crypto-core__pins sg-crypto-core__pins--right" />
        <img src="/assets/figma-15-3963/encryption-lock.svg" width="66" height="66" alt="" />
        <strong>ГОСТ</strong>
      </div>
      <div className="sg-data-card sg-data-card--output"><span>ЗАШИФРОВАНО</span><code>8f21 b4c0<br />763a 9de2<br />510c f764</code></div>
      <div className="sg-standards"><span>ГОСТ Р 34.10-2012</span><span>ГОСТ Р 34.11-2012</span></div>
    </>
  );
}

function InfrastructureGraphic() {
  return (
    <>
      <div className="sg-premises"><span>ВАША ИНФРАСТРУКТУРА</span><i /><i /><i /><i /></div>
      <div className="sg-server-stack">
        {['01', '02', '03'].map((number) => (
          <div className="sg-server-unit" key={number}>
            <span className="sg-server-unit__status" />
            <span className="sg-server-unit__label">SRV / {number}</span>
            <div className="sg-server-unit__slots"><i /><i /><i /><i /></div>
            <span className="sg-server-unit__port" />
          </div>
        ))}
      </div>
      <div className="sg-network-trunk"><i /></div>
      <div className="sg-network-branches" />
      <div className="sg-endpoints">
        {['Команда', 'Сервисы', 'Администратор'].map((name, index) => (
          <div className="sg-endpoint" key={name} style={{ '--node-index': index } as CSSProperties}>
            <span className="sg-endpoint__connection"><i /></span>
            <div className="sg-workstation"><span /><i /></div>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function IsolationGraphic() {
  return (
    <>
      <div className="sg-outside-services">
        {['Телеметрия', 'Внешние API', 'Облако'].map((name) => <div className="sg-outside-service" key={name}><span>{name}</span><i className="sg-blocked-line" /><i className="sg-stop" /></div>)}
      </div>
      <div className="sg-perimeter">
        <span className="sg-perimeter__label">ВАШ ЗАЩИЩЁННЫЙ КОНТУР</span>
        <div className="sg-isolated-vault"><img src="/assets/figma-15-3963/certification-shield.svg" width="76" height="76" alt="" /><span>Пассворк</span></div>
        <div className="sg-private-data"><i /><i /><i /><i /><i /></div>
        <span className="sg-perimeter__status"><i />Данные внутри</span>
      </div>
      <div className="sg-isolation-zero"><strong>0</strong><span>передач во внешние сервисы</span></div>
    </>
  );
}

const illustrations = {
  certification: CertificationGraphic,
  encryption: EncryptionGraphic,
  infrastructure: InfrastructureGraphic,
  isolation: IsolationGraphic,
};

export default function SecurityFeatureGraphic({ kind }: { kind: GraphicKind }) {
  const details = graphicDetails[kind];
  const Illustration = illustrations[kind];

  return (
    <div className={`security-graphic security-graphic--${kind}`} role="img" aria-label={details.description}>
      <div className="security-graphic__content" aria-hidden="true">
        <div className="security-graphic__topline"><span>{details.label}</span><span className="security-graphic__registration">PW / {kind === 'certification' ? '01' : kind === 'encryption' ? '02' : kind === 'infrastructure' ? '03' : '04'}</span></div>
        <div className="sg-stage"><Illustration /></div>
        <div className="security-graphic__caption"><i />{details.caption}</div>
      </div>
    </div>
  );
}
