/** Readable adaptation of Fora's published Gradient_ease.js.
 * The easing controls spatial alpha distribution, not animation timing.
 */
export function easedBlackGradient(stops = 50): string {
  return `linear-gradient(to bottom, ${Array.from({ length: stops }, (_, i) => {
    const t = i / (stops - 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    return `rgba(0, 0, 0, ${1 - eased}) ${t * 100}%`;
  }).join(", ")})`;
}
