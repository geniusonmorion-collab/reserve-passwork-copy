'use client';

import { useSyncExternalStore } from 'react';
import { isLightTheme, subscribeToTheme } from './theme-preference';

// Both themes share the same Framer transitions; only their colour targets differ.
export const motionPalettes = {
  dark: {
    introRestOpacity: 0.25,
    ink: '#fff3f0', text: 'rgba(255,255,255,.8)',
    primary: 'rgba(255,255,255,.8)', primaryHover: '#fff3f0',
    secondary: 'rgba(255,255,255,.06)', secondaryHover: 'rgba(255,255,255,.12)',
    surface: 'rgba(23,23,23,.85)', surfaceHover: 'rgba(38,38,38,.85)',
    subtle: 'rgba(255,255,255,.05)', edge: 'rgba(255,255,255,.1)',
    clear: 'rgba(0,0,0,0)', clearEdge: 'rgba(255,255,255,0)',
  },
  light: {
    // 64% charcoal on the page retains > 4.5:1 even between scroll highlights.
    introRestOpacity: 0.64,
    ink: '#171717', text: '#404040',
    primary: '#171717', primaryHover: '#262626',
    secondary: 'rgba(255,255,255,.06)', secondaryHover: 'rgba(255,255,255,.12)',
    surface: 'rgba(226,226,226,.85)', surfaceHover: 'rgba(211,211,211,.85)',
    subtle: 'rgba(23,23,23,.05)', edge: 'rgba(23,23,23,.16)',
    clear: 'rgba(250,250,250,0)', clearEdge: 'rgba(23,23,23,0)',
  },
};

export function useThemeMotion() {
  const light = useSyncExternalStore(subscribeToTheme, isLightTheme, () => false);
  return motionPalettes[light ? 'light' : 'dark'];
}
