'use client';

import { useSyncExternalStore } from 'react';
import { isLightTheme, setLightTheme, subscribeToTheme } from './theme-preference';

export default function ThemeToggle() {
  const light = useSyncExternalStore(subscribeToTheme, isLightTheme, () => false);

  return <button
    type="button"
    className="fh-theme-toggle"
    role="switch"
    aria-label="Светлая тема"
    aria-checked={light}
    title={light ? 'Включить тёмную тему' : 'Включить светлую тему'}
    onClick={() => setLightTheme(!isLightTheme())}
  >
    <svg className="fh-theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <svg className="fh-theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.4 14.3A8.8 8.8 0 0 1 9.7 3.6 8.8 8.8 0 1 0 20.4 14.3Z" />
    </svg>
  </button>;
}
