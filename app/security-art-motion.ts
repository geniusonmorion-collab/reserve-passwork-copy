/** Cursor-driven motion for decorative security scenes. No React updates per frame. */
export function attachSecurityArtMotion(art: HTMLDivElement) {
  const card = art.closest<HTMLElement>('.figma-security-card');
  const svg = art.querySelector('svg');
  if (!card || !svg) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const parts = [...svg.querySelectorAll<SVGGElement>('[data-sp-layer], [data-sp-column], [data-sp-channel]')].map((element) => ({
    element,
    layer: element.hasAttribute('data-sp-layer') ? Number(element.dataset.spLayer) : null,
    column: element.hasAttribute('data-sp-column') ? Number(element.dataset.spColumn) : null,
    channel: element.hasAttribute('data-sp-channel') ? Number(element.dataset.spChannel) : null,
    x: 0, y: 0, vx: 0, vy: 0,
  }));
  const layerCount = parts.filter(part => part.layer !== null).length;
  let animations: Animation[] = [];
  let visible = false;
  let hovering = false;
  let frame = 0;
  let previousTime = 0;
  let speed = 1;
  let pointerX = 200;
  let pointerY = 140;

  const canRun = () => visible && !document.hidden && !reduced.matches;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  };
  const reset = () => {
    stop();
    hovering = false;
    art.dataset.hover = 'false';
    speed = 1;
    for (const animation of animations) animation.playbackRate = 1;
    for (const part of parts) {
      part.x = part.y = part.vx = part.vy = 0;
      part.element.removeAttribute('transform');
    }
  };
  const proximity = (distance: number, radius: number) => Math.exp(-((distance / radius) ** 2));

  const tick = (now: number) => {
    frame = 0;
    if (!canRun()) return;
    const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.04) : 1 / 60;
    previousTime = now;
    const normalizedX = (pointerX - 200) / 200;
    const normalizedY = (pointerY - 140) / 140;
    let unsettled = false;

    for (const part of parts) {
      let targetX = 0;
      let targetY = 0;
      if (hovering) {
        if (part.layer !== null) {
          const depth = layerCount - 1 - part.layer;
          const local = proximity(pointerY - (115 + part.layer * 30), 65);
          targetX = normalizedX * (depth + 1) * 4;
          targetY = -depth * 10 - local * 21 + normalizedY * 4;
        } else if (part.column !== null) {
          const local = proximity(pointerX - (88 + part.column * 14), 48);
          targetX = normalizedX * local * 5;
          targetY = -local * 24 + normalizedY * local * 9;
        } else if (part.channel !== null) {
          const local = proximity(pointerY - (140 + part.channel * 49), 38);
          targetY = -local * 12 + normalizedY * 5;
        }
      }

      // Small substeps keep the spring stable on both 30 Hz and 144 Hz screens.
      const steps = Math.ceil(dt / (1 / 120));
      const step = dt / steps;
      const stiffness = 230 - (part.layer ?? 0) * 24;
      const damping = 19;
      for (let i = 0; i < steps; i++) {
        part.vx += ((targetX - part.x) * stiffness - part.vx * damping) * step;
        part.vy += ((targetY - part.y) * stiffness - part.vy * damping) * step;
        part.x += part.vx * step;
        part.y += part.vy * step;
      }
      const moving = Math.abs(targetX - part.x) + Math.abs(targetY - part.y) + Math.abs(part.vx) + Math.abs(part.vy) > 0.04;
      if (!moving) {
        part.x = targetX;
        part.y = targetY;
        part.vx = part.vy = 0;
      }
      unsettled ||= moving;
      part.element.setAttribute('transform', `translate(${part.x.toFixed(3)} ${part.y.toFixed(3)})`);
    }

    // Change playback speed without resetting the phase of the running loops.
    const targetSpeed = hovering ? 2.8 : 1;
    speed += (targetSpeed - speed) * (1 - Math.exp(-dt * 10));
    if (Math.abs(targetSpeed - speed) < 0.002) speed = targetSpeed;
    for (const animation of animations) animation.updatePlaybackRate(speed);
    if (unsettled || speed !== targetSpeed) frame = requestAnimationFrame(tick);
    else previousTime = 0;
  };
  const wake = () => {
    if (!frame && canRun()) frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    art.dataset.motion = canRun() ? 'active' : 'paused';
    if (!canRun() || !finePointer.matches) reset();
    else wake();
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !finePointer.matches || !canRun()) return;
    // SVG may be letterboxed at narrow widths; use its real viewBox mapping.
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    pointerX = Math.max(0, Math.min(400, point.x));
    pointerY = Math.max(0, Math.min(280, point.y));
    if (!hovering) {
      hovering = true;
      art.dataset.hover = 'true';
      animations = svg.getAnimations({ subtree: true });
      // Send the first signal immediately when the pointer enters a card.
      for (const animation of animations) {
        const effect = animation.effect as KeyframeEffect | null;
        if (effect?.target?.matches('.sp-data-shackle, .sp-data-frame, .sp-cipher-scan')) animation.currentTime = 0;
      }
    }
    wake();
  };
  const leave = () => {
    hovering = false;
    art.dataset.hover = 'false';
    wake();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { threshold: 0.15 });
  observer.observe(art);
  card.addEventListener('pointerenter', move);
  card.addEventListener('pointermove', move);
  card.addEventListener('pointerleave', leave);
  card.addEventListener('pointercancel', leave);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  finePointer.addEventListener('change', sync);
  sync();

  return () => {
    observer.disconnect();
    card.removeEventListener('pointerenter', move);
    card.removeEventListener('pointermove', move);
    card.removeEventListener('pointerleave', leave);
    card.removeEventListener('pointercancel', leave);
    document.removeEventListener('visibilitychange', sync);
    reduced.removeEventListener('change', sync);
    finePointer.removeEventListener('change', sync);
    reset();
  };
}
