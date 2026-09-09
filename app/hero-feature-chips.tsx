import Image from 'next/image';

// Short labels from Figma v4 (15:2162): hero, IT and DevOps features, encryption.
const features = [
  { label: 'На своём сервере', icon: 'server' },
  { label: 'Роли и права', icon: 'users-round' },
  { label: 'Аудит действий', icon: 'history' },
  { label: 'API-ключи и токены', icon: 'key-round' },
  { label: 'Интеграция с CI/CD', icon: 'workflow' },
  { label: 'AES-256', icon: 'shield-check' },
] as const;

export default function HeroFeatureChips() {
  return (
    <ul className="figma-hero__features" aria-label="Основные возможности Пассворка" role="list">
      {features.map((feature) => (
        <li
          className="figma-hero__feature-chip"
          key={feature.icon}
        >
          <Image
            src={`/assets/hero-feature-icons/${feature.icon}.svg`}
            width={16}
            height={16}
            alt=""
            unoptimized
          />
          <span>{feature.label}</span>
        </li>
      ))}
    </ul>
  );
}
