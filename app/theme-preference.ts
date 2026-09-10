export const THEME_STORAGE_KEY = 'passwork-theme';
export const THEME_CHANGE_EVENT = 'passwork-theme-change';

// Restore the user's choice before the first paint, including on a reload.
export const themeBootstrap = `(()=>{let theme='dark';try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light')theme='light'}catch{}document.documentElement.dataset.theme=theme})()`;

export function isLightTheme() {
  return document.documentElement.dataset.theme === 'light';
}

export function setLightTheme(light: boolean) {
  const theme = light ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* Switching still works when storage is unavailable. */ }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function subscribeToTheme(notify: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    document.documentElement.dataset.theme = event.newValue === 'light' ? 'light' : 'dark';
    notify();
  };
  window.addEventListener(THEME_CHANGE_EVENT, notify);
  window.addEventListener('storage', sync);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, notify);
    window.removeEventListener('storage', sync);
  };
}
