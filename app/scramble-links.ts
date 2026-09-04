const scrambleGlyphs =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+=?<>/{}[]';

export function initScrambleLinks(root: HTMLElement) {
  const links = Array.from(
    root.querySelectorAll<HTMLAnchorElement>('[data-signal-scramble]'),
  );
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new Map<HTMLAnchorElement, number>();
  let reducedMotion = motionPreference.matches;

  const getCharacters = (link: HTMLAnchorElement) =>
    Array.from(link.querySelectorAll<HTMLElement>('[data-signal-char]'));

  const resetScramble = (link: HTMLAnchorElement) => {
    const timer = timers.get(link);
    if (timer) window.clearTimeout(timer);
    timers.delete(link);
    link.removeAttribute('data-scrambling');

    getCharacters(link).forEach((character) => {
      character.textContent = character.dataset.signalChar ?? '';
      character.classList.remove('is-scrambling');
      character.style.removeProperty('--scramble-color');
      character.style.removeProperty('--scramble-opacity');
    });
  };

  const playScramble = (link: HTMLAnchorElement) => {
    resetScramble(link);
    if (reducedMotion) return;

    const characters = getCharacters(link);
    const animatedIndexes = characters
      .map((character, index) =>
        character.dataset.signalChar?.trim() ? index : -1,
      )
      .filter((index) => index >= 0);

    for (let index = animatedIndexes.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [animatedIndexes[index], animatedIndexes[swapIndex]] = [
        animatedIndexes[swapIndex],
        animatedIndexes[index],
      ];
    }

    const startedAt = window.performance.now();
    const duration = 280;
    const frameDuration = 38;
    link.setAttribute('data-scrambling', 'true');

    const renderFrame = () => {
      const progress = Math.min(
        1,
        (window.performance.now() - startedAt) / duration,
      );
      const resolvedCount = Math.floor(progress * animatedIndexes.length);
      const resolvedIndexes = new Set(animatedIndexes.slice(0, resolvedCount));

      characters.forEach((character, index) => {
        const originalCharacter = character.dataset.signalChar ?? '';
        if (
          !originalCharacter.trim() ||
          resolvedIndexes.has(index) ||
          progress === 1
        ) {
          character.textContent = originalCharacter;
          character.classList.remove('is-scrambling');
          character.style.removeProperty('--scramble-color');
          character.style.removeProperty('--scramble-opacity');
          return;
        }

        character.textContent =
          scrambleGlyphs[Math.floor(Math.random() * scrambleGlyphs.length)] ??
          originalCharacter;
        character.classList.add('is-scrambling');
        character.style.setProperty(
          '--scramble-color',
          Math.random() > 0.5 ? '#298dff' : '#6c7584',
        );
        character.style.setProperty(
          '--scramble-opacity',
          (0.35 + Math.random() * 0.65).toFixed(2),
        );
      });

      if (progress < 1) {
        const timer = window.setTimeout(renderFrame, frameDuration);
        timers.set(link, timer);
        return;
      }

      timers.delete(link);
      link.removeAttribute('data-scrambling');
    };

    renderFrame();
  };

  const handlers = links.map((link) => {
    const handleEnter = () => playScramble(link);
    const handleLeave = () => resetScramble(link);
    link.addEventListener('mouseenter', handleEnter);
    link.addEventListener('mouseleave', handleLeave);
    link.addEventListener('focus', handleEnter);
    link.addEventListener('blur', handleLeave);
    return { link, handleEnter, handleLeave };
  });

  const handleMotionPreference = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches;
    if (reducedMotion) links.forEach(resetScramble);
  };

  motionPreference.addEventListener('change', handleMotionPreference);

  return () => {
    motionPreference.removeEventListener('change', handleMotionPreference);
    handlers.forEach(({ link, handleEnter, handleLeave }) => {
      link.removeEventListener('mouseenter', handleEnter);
      link.removeEventListener('mouseleave', handleLeave);
      link.removeEventListener('focus', handleEnter);
      link.removeEventListener('blur', handleLeave);
      resetScramble(link);
    });
  };
}
