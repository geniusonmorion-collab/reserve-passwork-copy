import { DASHBOARD_CURSOR_MARKUP } from './dashboard-shared';

export type DemoOptions = { onProgress?: (progress: number) => void; onComplete?: () => void };
export type DemoCue = { duration: number; start?: () => void; frame?: (progress: number) => void; finish?: () => void };
type DemoContext = {
  scene: (tab: string, html: () => string, caption: string, index: number) => DemoCue;
  click: (selector: string, change: () => void) => DemoCue;
  hold: (duration?: number) => DemoCue;
  renderView: (html: string) => void;
  overlay: (html: string) => void;
  q: (selector: string) => HTMLElement | null;
};
type DemoConfig = {
  tabs: readonly (readonly [string, string])[];
  totalSteps: number;
  initial: { tab: string; html: string; caption: string };
  createCues: (context: DemoContext) => DemoCue[];
};

export function initDashboardDemo(embed: HTMLElement, workspace: HTMLElement, config: DemoConfig, options: DemoOptions = {}) {
  const stage = embed.querySelector<HTMLElement>('.pw-stage')!;
  const panel = embed.closest<HTMLElement>('.product-features__panel');
  const layer = document.createElement('div');
  layer.className = 'pw-cursors';
  const cursor = document.createElement('div');
  cursor.className = 'pw-cursor';
  cursor.innerHTML = DASHBOARD_CURSOR_MARKUP;
  layer.appendChild(cursor);
  stage.appendChild(layer);

  let alive = true;
  let visible = false;
  let raf = 0;
  let x = stage.offsetWidth * .57;
  let y = stage.offsetHeight * .47;
  let highlighted: Element | null = null;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const q = (selector: string) => workspace.querySelector<HTMLElement>(`[data-demo="${selector}"]`);
  const drawCursor = () => { cursor.style.transform = `translate(${x - 1}px, ${y - 1}px)`; };
  const clearHighlight = () => { highlighted?.classList.remove('pw-hl', 'pw-pressed'); highlighted = null; };
  const view = () => workspace.querySelector<HTMLElement>('.pw-it__view')!;
  const renderView = (html: string) => { clearHighlight(); view().innerHTML = html; };
  const overlay = (html: string) => { workspace.querySelector<HTMLElement>('.pw-it__overlay-slot')!.innerHTML = `<div class="pw-it__dialog">${html}</div>`; };
  const show = (tab: string, html: string, caption: string, index: number) => {
    clearHighlight();
    workspace.innerHTML = `<div class="pw-tabs pw-it__tabs">${config.tabs.map(([id, label]) => `<span class="pw-tab${id === tab ? ' is-active' : ''}" data-demo="tab-${id}">${label}</span>`).join('')}</div><div class="pw-it__view">${html}</div><div class="pw-it__caption"><span>${String(index).padStart(2, '0')} / ${String(config.totalSteps).padStart(2, '0')}</span><strong>${caption}</strong></div>`;
  };
  const hold = (duration = 1800): DemoCue => ({ duration });
  const scene = (tab: string, html: () => string, caption: string, index: number): DemoCue => ({ duration: 500, start: () => show(tab, html(), caption, index) });
  const click = (selector: string, change: () => void): DemoCue => {
    let startX = 0;
    let startY = 0;
    let pressed = false;
    let changed = false;
    let ripple: HTMLElement | null = null;
    return {
      duration: 1350,
      start: () => { clearHighlight(); startX = x; startY = y; pressed = false; changed = false; },
      frame: (progress) => {
        const target = q(selector);
        if (target && progress < .68) {
          const bounds = target.getBoundingClientRect();
          const base = stage.getBoundingClientRect();
          const scale = base.width / stage.offsetWidth || 1;
          const toX = (bounds.left + bounds.width * .62 - base.left) / scale;
          const toY = (bounds.top + bounds.height * .55 - base.top) / scale;
          const t = Math.min(1, progress / .56);
          // Same eased, gently curved movement as the hero cursor.
          const eased = t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
          const bend = Math.min(26, Math.hypot(toX - startX, toY - startY) * .06);
          x = startX + (toX - startX) * eased;
          y = startY + (toY - startY) * eased - Math.sin(Math.PI * eased) * bend;
          drawCursor();
          if (t === 1) { target.classList.add('pw-hl'); highlighted = target; }
        }
        if (progress >= .64 && !pressed) {
          pressed = true;
          cursor.classList.add('is-pressed');
          target?.classList.add('pw-pressed');
          ripple = document.createElement('div');
          ripple.className = 'pw-ripple';
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          layer.appendChild(ripple);
        }
        if (progress >= .75 && !changed) { changed = true; change(); }
        if (progress >= .82) cursor.classList.remove('is-pressed');
      },
      finish: () => { clearHighlight(); ripple?.remove(); cursor.classList.remove('is-pressed'); },
    };
  };

  const cues = config.createCues({ scene, click, hold, renderView, overlay, q });

  const total = cues.reduce((sum, cue) => sum + cue.duration, 0);
  let index = 0;
  let elapsed = 0;
  let cueElapsed = 0;
  let previous = 0;
  let started = false;
  // A complete static overview remains available with reduced motion.
  show(config.initial.tab, config.initial.html, config.initial.caption, 1);
  drawCursor();
  options.onProgress?.(0);

  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .15; }, { threshold: [0, .15] });
  observer.observe(embed);
  const tick = (now: number) => {
    if (!alive) return;
    const delta = previous ? Math.min(48, now - previous) : 0;
    previous = now;
    const paused = !visible || document.hidden || motion.matches || panel?.dataset.active === 'false';
    cursor.classList.toggle('is-visible', !paused);
    embed.dataset.demoPaused = String(paused);
    if (!paused) {
      if (!started) { started = true; cues[0].start?.(); }
      elapsed = Math.min(total, elapsed + delta);
      cueElapsed += delta;
      while (index < cues.length && cueElapsed >= cues[index].duration) {
        const cue = cues[index];
        cue.frame?.(1);
        cue.finish?.();
        cueElapsed -= cue.duration;
        index += 1;
        cues[index]?.start?.();
      }
      options.onProgress?.(elapsed / total);
      if (index === cues.length) {
        cursor.classList.remove('is-visible');
        options.onComplete?.();
        return;
      }
      cues[index].frame?.(cueElapsed / cues[index].duration);
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      clearHighlight();
      layer.remove();
      workspace.innerHTML = '';
      delete embed.dataset.demoPaused;
    },
  };
}
