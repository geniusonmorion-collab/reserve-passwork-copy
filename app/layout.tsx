import type { Metadata } from 'next';
import 'lenis/dist/lenis.css';
import './globals.css';
import './theme.css';
import './theme-illustrations.css';
import SmoothScroll from './smooth-scroll';
import { themeBootstrap } from './theme-preference';

export const metadata: Metadata = {
  metadataBase: new URL('https://reserve-passwork-copy.andrtek.chatgpt.site'),
  title: 'Пассворк — корпоративный менеджер паролей',
  description:
    'Безопасное хранение корпоративных паролей, управление доступами и полный аудит действий внутри вашей инфраструктуры.',
  icons: {
    icon: '/assets/passwork-symbol.svg',
  },
  openGraph: {
    title: 'Пассворк — корпоративные пароли под вашим контролем',
    description:
      'Безопасное хранение, мгновенный доступ и полный аудит действий.',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Пассворк — корпоративные пароли под вашим контролем',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Пассворк — корпоративные пароли под вашим контролем',
    description:
      'Безопасное хранение, мгновенный доступ и полный аудит действий.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning>
      <head>
        <script id="passwork-theme" dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
