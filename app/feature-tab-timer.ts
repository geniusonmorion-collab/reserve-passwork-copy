// Fora's tabs advance after eight seconds. This clock belongs to the section,
// not a dashboard's much longer cursor demonstration or its visibility gate.
const DURATION = 8_000;

export function startFeatureTabTimer(section: HTMLElement, onComplete: () => void, onLeave?: () => void) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 809.98px)');
  let visible = false;
  let alive = true;
  let completed = false;
  let elapsed = 0;
  let previous: number | null = null;
  let frame: number | null = null;
  section.style.setProperty('--scenario-tab-progress', '0%');

  const canPlay = () => alive && !completed && visible && !document.hidden && !motion.matches && !mobile.matches;
  function tick(now: number) {
    frame = null;
    if (!canPlay()) return;
    if (previous !== null) elapsed = Math.min(DURATION, elapsed + Math.max(0, now - previous));
    previous = now;
    section.style.setProperty('--scenario-tab-progress', `${elapsed / DURATION * 100}%`);
    if (elapsed === DURATION) {
      completed = true;
      onComplete();
    } else frame = requestAnimationFrame(tick);
  }

  function updatePlayback() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    if (canPlay()) frame = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (!alive) return;
    const exited = visible && !entry.isIntersecting;
    visible = entry.isIntersecting;
    updatePlayback();
    if (exited && !mobile.matches) {
      elapsed = 0;
      section.style.setProperty('--scenario-tab-progress', '0%');
      onLeave?.();
    }
  }, { threshold: 0 });
  observer.observe(section);
  document.addEventListener('visibilitychange', updatePlayback);
  motion.addEventListener('change', updatePlayback);
  const changeLayout = () => {
    elapsed = 0;
    section.style.setProperty('--scenario-tab-progress', '0%');
    updatePlayback();
  };
  mobile.addEventListener('change', changeLayout);

  return () => {
    alive = false;
    updatePlayback();
    observer.disconnect();
    document.removeEventListener('visibilitychange', updatePlayback);
    motion.removeEventListener('change', updatePlayback);
    mobile.removeEventListener('change', changeLayout);
  };
}
