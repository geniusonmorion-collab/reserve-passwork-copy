'use client';

import { useSyncExternalStore } from 'react';
import { isLightTheme, subscribeToTheme } from './theme-preference';

// Both themes share the same Framer transitions; only their colour targets differ.
export const motionPalettes = {
  dark: {
    ink: '#fff3f0', text: 'rgba(255,255,255,.8)',
    primary: 'rgba(255,255,255,.8)', primaryHover: '#fff3f0',
    secondary: 'rgba(255,255,255,.06)', secondaryHover: 'rgba(255,255,255,.12)',
    surface: 'rgba(23,23,23,.85)', surfaceHover: 'rgba(38,38,38,.85)',
    subtle: 'rgba(255,255,255,.05)', edge: 'rgba(255,255,255,.1)',
    clear: 'rgba(0,0,0,0)', clearEdge: 'rgba(255,255,255,0)',
  },
  light: {
    ink: '#172231', text: '#455568',
    primary: '#315fbb', primaryHover: '#264e9e',
    secondary: 'rgba(255,255,255,.55)', secondaryHover: 'rgba(255,255,255,.9)',
    surface: 'rgba(225,234,247,.85)', surfaceHover: 'rgba(208,224,245,.85)',
    subtle: 'rgba(49,95,187,.05)', edge: 'rgba(25,50,80,.13)',
    clear: 'rgba(250,251,253,0)', clearEdge: 'rgba(25,50,80,0)',
  },
};

export function useThemeMotion() {
  const light = useSyncExternalStore(subscribeToTheme, isLightTheme, () => false);
  return motionPalettes[light ? 'light' : 'dark'];
}
