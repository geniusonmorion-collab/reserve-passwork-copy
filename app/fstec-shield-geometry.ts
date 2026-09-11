/*
 * Геометрия иллюстрации панели сертификации, Figma 54:199.
 *
 * Числа взяты из узла напрямую: четырнадцать концентрических контуров щита
 * с шагом 23 по ширине, подтверждённый контур шириной 268 и эмблема 73 × 92.
 * Все контуры центрированы в одной точке карточки.
 */

/** Центр композиции в координатах карточки 535 × 535. */
export const CENTER = { x: 267.5, y: 350 } as const;
/** Отношение высоты контура к ширине, как в узле: 165.82 / 132. */
const RATIO = 1.2562;

/** Щит Lucide, записанный абсолютными кубиками: дуги парсерам путей не нужны. */
export const SHIELD_PATH = [
  'M20 13',
  'C20 18 16.5 20.5 12.34 22.05',
  'C12.11 22.13 11.88 22.13 11.67 22.04',
  'C7.5 20.5 4 18 4 13',
  'L4 6',
  'C4 5.45 4.45 5 5 5',
  'C7 5 9.5 3.8 11.24 2.28',
  'C11.66 1.92 12.34 1.92 12.76 2.28',
  'C14.51 3.81 17 5 19 5',
  'C19.55 5 20 5.45 20 6',
  'Z',
].join('');

type Point = { x: number; y: number };

/* Плотная выборка формы: нужна и для габаритов, и для полярной таблицы. */
const OUTLINE: Point[] = (() => {
  const segments: [Point, Point, Point, Point][] = [];
  const p = (x: number, y: number) => ({ x, y });
  let cur = p(20, 13);
  const cubics: [number, number, number, number, number, number][] = [
    [20, 18, 16.5, 20.5, 12.34, 22.05],
    [12.11, 22.13, 11.88, 22.13, 11.67, 22.04],
    [7.5, 20.5, 4, 18, 4, 13],
    [4, 13, 4, 6, 4, 6],
    [4, 5.45, 4.45, 5, 5, 5],
    [7, 5, 9.5, 3.8, 11.24, 2.28],
    [11.66, 1.92, 12.34, 1.92, 12.76, 2.28],
    [14.51, 3.81, 17, 5, 19, 5],
    [19.55, 5, 20, 5.45, 20, 6],
    [20, 6, 20, 13, 20, 13],
  ];
  for (const c of cubics) {
    segments.push([cur, p(c[0], c[1]), p(c[2], c[3]), p(c[4], c[5])]);
    cur = p(c[4], c[5]);
  }
  const points: Point[] = [];
  for (const [a, b, c, d] of segments) {
    for (let i = 1; i <= 20; i++) {
      const t = i / 20;
      const m = 1 - t;
      points.push({
        x: m * m * m * a.x + 3 * m * m * t * b.x + 3 * m * t * t * c.x + t * t * t * d.x,
        y: m * m * m * a.y + 3 * m * m * t * b.y + 3 * m * t * t * c.y + t * t * t * d.y,
      });
    }
  }
  return points;
})();

/** Габариты формы в её собственных координатах. */
export const PATH_BOX = (() => {
  const xs = OUTLINE.map((p) => p.x);
  const ys = OUTLINE.map((p) => p.y);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
})();

/*
 * Полярная таблица: радиус границы формы по направлениям от её центра.
 * Контуры — равномерно масштабированные копии, поэтому по расстоянию от центра
 * сразу считается, контур какой ширины проходит через точку.
 */
const BUCKETS = 240;
const BOX_CENTER = {
  x: PATH_BOX.x + PATH_BOX.width / 2,
  y: PATH_BOX.y + PATH_BOX.height / 2,
};
const POLAR = (() => {
  const table = new Array<number>(BUCKETS).fill(0);
  for (const p of OUTLINE) {
    const angle = Math.atan2(p.y - BOX_CENTER.y, p.x - BOX_CENTER.x);
    const radius = Math.hypot(p.x - BOX_CENTER.x, p.y - BOX_CENTER.y);
    const bucket = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * BUCKETS) % BUCKETS;
    if (radius > table[bucket]) table[bucket] = radius;
  }
  for (let i = 0; i < BUCKETS; i++) {
    if (table[i] > 0) continue;
    for (let step = 1; step < BUCKETS; step++) {
      const left = table[(i - step + BUCKETS) % BUCKETS];
      const right = table[(i + step) % BUCKETS];
      if (left > 0 || right > 0) { table[i] = Math.max(left, right); break; }
    }
  }
  return table;
})();

/** Ширина контура, проходящего через точку карточки. */
export function contourWidthAt(cardX: number, cardY: number): number {
  const dx = (cardX - CENTER.x) / (PATH_BOX.width / 1);
  const dy = (cardY - CENTER.y) / (PATH_BOX.height / 1);
  const angle = Math.atan2(dy, dx);
  const radius = Math.hypot(cardX - CENTER.x, cardY - CENTER.y);
  if (radius < 0.001) return 0;
  const bucket = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * BUCKETS) % BUCKETS;
  const boundary = POLAR[(bucket + BUCKETS) % BUCKETS];
  return boundary > 0 ? (radius / boundary) * PATH_BOX.width : 0;
}

/** Габариты контура заданной ширины в координатах карточки. */
export function contourBox(width: number) {
  const height = width * RATIO;
  return { x: CENTER.x - width / 2, y: CENTER.y - height / 2, width, height };
}

/** Трансформ, вписывающий форму в габариты контура. */
export function contourTransform(width: number) {
  const box = contourBox(width);
  const sx = box.width / PATH_BOX.width;
  const sy = box.height / PATH_BOX.height;
  return `translate(${box.x} ${box.y}) scale(${sx} ${sy}) translate(${-PATH_BOX.x} ${-PATH_BOX.y})`;
}

/** Подтверждённый контур и поле вокруг него — ширины и плотности из узла. */
export const HERO_WIDTH = 268;
export const FIELD = [
  { width: 132, opacity: 0.064 },
  { width: 155, opacity: 0.072625 },
  { width: 178, opacity: 0.08125 },
  { width: 201, opacity: 0.089875 },
  { width: 224, opacity: 0.0985 },
  { width: 247, opacity: 0.107125 },
  { width: 270, opacity: 0.11425 },
  { width: 293, opacity: 0.105625 },
  { width: 316, opacity: 0.097 },
  { width: 339, opacity: 0.088375 },
  { width: 362, opacity: 0.07975 },
  { width: 385, opacity: 0.071125 },
  { width: 408, opacity: 0.0625 },
  { width: 431, opacity: 0.053875 },
] as const;

/** Эмблема по центру щита, размер из узла. */
export const EMBLEM = { x: 231, y: 304, width: 73, height: 92 } as const;
