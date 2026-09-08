import Image from 'next/image';

type SecurityPreviewKind = 'fstec' | 'gost' | 'infrastructure' | 'data';

function PassworkLabel() {
  return (
    <span className="security-preview__brand">
      <Image src="/assets/passwork-symbol.svg" width={22} height={22} alt="" unoptimized />
      <span>Пассворк</span>
    </span>
  );
}

function Check() {
  return <Image src="/assets/check-circle-blue.svg" width={18} height={18} alt="" unoptimized />;
}

function CertificatePreview() {
  return (
    <div className="security-preview__panel security-preview__certificate">
      <div className="security-preview__header"><PassworkLabel /><Check /></div>
      <div className="security-preview__certificate-title">
        <span>Сертификат соответствия</span>
        <strong>ФСТЭК России</strong>
        <span className="security-preview__certificate-number">№ 5063</span>
      </div>
      <div className="security-preview__certificate-footer">
        <span>Уровень доверия</span>
        <span className="security-preview__trust">4</span>
      </div>
    </div>
  );
}

function EncryptionPreview() {
  return (
    <div className="security-preview__panel">
      <div className="security-preview__header">Шифрование</div>
      <div className="security-preview__algorithm"><span>Алгоритм</span><strong>ГОСТ</strong></div>
      <div className="security-preview__row"><span>Пароли</span><Check /></div>
      <div className="security-preview__row"><span>Вложения</span><Check /></div>
    </div>
  );
}

function InfrastructurePreview() {
  return (
    <div className="security-preview__deployment">
      <div className="security-preview__panel security-preview__app"><PassworkLabel /></div>
      <span className="security-preview__connector" />
      <div className="security-preview__panel security-preview__server">
        <span>Сервер компании</span>
        <span className="security-preview__local"><span />Внутри сети</span>
      </div>
    </div>
  );
}

function DataPreview() {
  return (
    <div className="security-preview__panel">
      <div className="security-preview__header">Внешние соединения</div>
      {['Телеметрия', 'Внешние API'].map((label) => (
        <div className="security-preview__row" key={label}>
          <span>{label}</span><span className="security-preview__switch"><span /></span>
        </div>
      ))}
      <div className="security-preview__privacy"><Check /><span>Данные внутри</span></div>
    </div>
  );
}

const previews = {
  fstec: CertificatePreview,
  gost: EncryptionPreview,
  infrastructure: InfrastructurePreview,
  data: DataPreview,
};

/** Illustrative interface fragments; the card copy carries their accessible meaning. */
export default function SecurityPreview({ kind }: { kind: SecurityPreviewKind }) {
  const Preview = previews[kind];
  return (
    <div className={`security-preview security-preview--${kind}`} aria-hidden="true">
      <div className="security-preview__content"><Preview /></div>
    </div>
  );
}
