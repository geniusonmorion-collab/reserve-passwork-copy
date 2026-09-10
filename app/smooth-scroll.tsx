'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

function bindAnchors(lenis: Lenis) {
  const onClick = (event: MouseEvent) => {
    const link = event.composedPath().find(
      (node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement,
    );
    if (!link?.href) return;

    const url = new URL(link.href);
    if (
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      url.search !== location.search ||
      !url.hash
    ) return;

    // Lenis 1.3.19's window listener does not cancel the native hash jump
    // or check modified clicks. Handle these links before that listener.
    event.stopPropagation();
    if (
      event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      link.hasAttribute('download') ||
      (link.target && link.target !== '_self')
    ) return;

    let id: string;
    try {
      id = decodeURIComponent(url.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    lenis.scrollTo(target, {
      offset: -margin,
      onStart: () => {
        if (location.hash !== url.hash) {
          history.pushState(history.state, '', url);
        }
      },
      onComplete: () => {
        // Preserve the keyboard navigation destination without a second scroll.
        const needsTabIndex = !target.hasAttribute('tabindex') && target.tabIndex < 0;
        if (needsTabIndex) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (needsTabIndex) target.removeAttribute('tabindex');
      },
    });
  };

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}

/** One window-based scroller; existing section animations use its native scroll events. */
export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | undefined;
    let unbindAnchors = () => {};

    const dispose = () => {
      unbindAnchors();
      lenis?.destroy();
      lenis = undefined;
    };
    const sync = () => {
      dispose();
      if (reducedMotion.matches) return;

      // Same active settings as Fora's published Lenis component: lerp, no duration.
      lenis = new Lenis({
        smoothWheel: true,
        lerp: 0.1,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        infinite: false,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        autoRaf: true,
        autoToggle: true,
        anchors: true,
        allowNestedScroll: true,
        syncTouch: false,
        stopInertiaOnNavigate: true,
      });
      unbindAnchors = bindAnchors(lenis);
    };

    sync();
    reducedMotion.addEventListener('change', sync);
    return () => {
      reducedMotion.removeEventListener('change', sync);
      dispose();
    };
  }, []);

  return null;
}
