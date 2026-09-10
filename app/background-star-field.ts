/**
 * Star-only adaptation of levalovushka/passwork's AuroraCanvas.jsx.
 * Source: https://github.com/levalovushka/passwork/blob/f72a27a949f1b8419728c20182ec8bbccbcb757a/src/components/AuroraCanvas.jsx
 * Ports the non-emblem aurora intensity and glyph equations to Canvas 2D;
 * the host positions the light field and keeps its foreground occlusion.
 */
export const STAR_CELL = 17;
export const STAR_SPRITE_SIZE = 12;

export const smoothstep = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

export const starHash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smoothstep(0, 1, x - ix);
  const fy = smoothstep(0, 1, y - iy);
  return mix(
    mix(starHash(ix, iy), starHash(ix + 1, iy), fx),
    mix(starHash(ix, iy + 1), starHash(ix + 1, iy + 1), fx), fy,
  );
}

function fbm(x: number, y: number) {
  let value = 0;
  let amplitude = 0.5;
  for (let i = 0; i < 4; i++) {
    value += amplitude * noise(x, y);
    x = x * 2.02 + 11.2;
    y = y * 2.02 + 3.7;
    amplitude *= 0.5;
  }
  return value;
}

/** The original field pass's alpha (rays * mask), sampled at a star centre. */
export function starField(u: number, v: number, time: number, detail: number) {
  const drift = time * 0.030;
  const sway = Math.sin(time * 0.48) * 0.095;
  const nx = u * 2.6;
  const ny = v * 0.32;
  const n1 = fbm(nx + drift + sway, ny + time * 0.035);
  const n2 = fbm(nx * 1.55 - drift * 0.7 + 2.4, ny * 1.55 + time * 0.022);

  let x = (u - 0.5) * mix(1.22, 0.76, v) + 0.5;
  x += drift * 0.35 + sway;
  x += (n1 - 0.5) * 0.16 + (n2 - 0.5) * 0.07;
  x += Math.sin(v * 3.1 + time * 0.58) * 0.042;

  const s1 = Math.pow(Math.sin(x * 7.4 + time * 0.55) * 0.5 + 0.5, 2.4);
  const s2 = Math.pow(Math.sin(x * 12.6 - time * 0.40 + 1.3) * 0.5 + 0.5, 3.2);
  const s3 = Math.pow(Math.sin(x * 4.6 + n2 * 2.8 + time * 0.35 + 0.6) * 0.5 + 0.5, 2);
  let rays = s1 * 0.62 + s2 * 0.26 + s3 * 0.48;

  const px = u * detail * 10 + drift * 1.6;
  const py = v * 0.55 + time * 0.02;
  const v1 = 1 - Math.abs(noise(px, py) * 2 - 1);
  const v2 = 1 - Math.abs(noise(px * 2.4 + 7.1, py * 2.4 + 1.3) * 2 - 1);
  const veins = Math.pow(v1 * (0.55 + 0.55 * v2), 1.8);
  rays *= mix(1, 0.88 + 0.70 * veins, smoothstep(0.30, 0.72, n2) * 0.45);
  rays *= 0.42 + n1 * 0.7;
  rays *= 0.92 + 0.08 * Math.sin(time * 0.52 + n1 * 2.4);
  rays *= 0.95 + 0.05 * Math.sin(time * 0.38 + s2 * 3);

  const yy = Math.max(0, Math.min(1, v));
  const side = smoothstep(1.12, 0.28, Math.abs(u - 0.5) * 1.65);
  const mask = Math.pow(yy, 0.72) * smoothstep(0, 0.16, yy) * mix(0.55, 1, side);
  return Math.min(1, rays * mask);
}

export function starBrightness(field: number, seed: number, column: number, row: number, time: number) {
  const show = smoothstep(0.24, 0.46, field * (0.4 + 0.8 * seed));
  const tick = Math.floor(time * 9);
  const flicker = starHash(column + tick * 0.137, row + tick * 0.311);
  return show * (0.55 + 0.45 * flicker) * 0.45;
}

/** Three rounded segments form the original six-spoke glyph, including its soft edge. */
export function starGlyph(x: number, y: number) {
  let distance = Infinity;
  for (const [cos, sin] of [[-0.00000037, 1], [-0.8660254, 0.5], [-0.8660252, -0.5000005]]) {
    const qx = cos * x + sin * y;
    const qy = -sin * x + cos * y;
    distance = Math.min(distance, Math.hypot(qx - Math.max(-0.16, Math.min(0.16, qx)), qy));
  }
  return smoothstep(0.058, 0.02, distance);
}
