/*
 * Геометрия гранёного щита для панели сертификации, Figma 65:197.
 *
 * Форма задана вершинами: остриё сверху, прямые плечи, вертикальные борта,
 * длинный сход в точку. Скругляем только вершины — грани остаются прямыми.
 *
 * Композиция центрирована: щит виден целиком, а мягкость силуэта снимает сама
 * форма — грани прямые, скруглены только вершины небольшим радиусом.
 */

/** Вершины в нормализованном боксе 100 × 118 и радиусы скругления углов. */
const VERTICES = [
  { x: 50, y: 0, r: 9 },
  { x: 100, y: 24, r: 11 },
  { x: 100, y: 64, r: 11 },
  { x: 50, y: 118, r: 11 },
  { x: 0, y: 64, r: 11 },
  { x: 0, y: 24, r: 11 },
];

const BOX_W = 100;
const BOX_H = 118;

type Point = { x: number; y: number };

const unit = (a: Point, b: Point): Point => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
};

const joints = VERTICES.map((v, index) => {
  const count = VERTICES.length;
  const prev = VERTICES[(index - 1 + count) % count];
  const next = VERTICES[(index + 1) % count];
  const incoming = unit(v, prev);
  const outgoing = unit(next, v);
  return {
    v,
    a: { x: v.x - incoming.x * v.r, y: v.y - incoming.y * v.r },
    b: { x: v.x + outgoing.x * v.r, y: v.y + outgoing.y * v.r },
  };
});

/*
 * Филет пишем кубикой с контрольными точками на 2/3 к вершине — это точная
 * запись квадратичной кривой. Дуги не используем: их не принимает парсер путей
 * Figma, а браузеру такая запись всё равно.
 */
function buildPath(): string {
  const round = (value: number) => Math.round(value * 100) / 100;
  let d = `M${round(joints[0].a.x)} ${round(joints[0].a.y)}`;
  for (let i = 0; i < joints.length; i++) {
    const { v, a, b } = joints[i];
    const c1 = { x: a.x + (v.x - a.x) * 2 / 3, y: a.y + (v.y - a.y) * 2 / 3 };
    const c2 = { x: b.x + (v.x - b.x) * 2 / 3, y: b.y + (v.y - b.y) * 2 / 3 };
    d += `C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(b.x)} ${round(b.y)}`;
    const nextA = joints[(i + 1) % joints.length].a;
    d += `L${round(nextA.x)} ${round(nextA.y)}`;
  }
  return `${d}Z`;
}

export const SHIELD_PATH = buildPath();
export const SHIELD_RATIO = BOX_H / BOX_W;

/*
 * Полярная таблица контура: радиус границы для каждого направления от центра
 * бокса. Щит звёздно-выпуклый, поэтому одной таблицы хватает, чтобы для любой
 * точки узнать, на каком по счёту контуре она лежит.
 */
const POLAR_BUCKETS = 240;
const CENTER: Point = { x: BOX_W / 2, y: BOX_H / 2 };

function buildPolarTable(): number[] {
  const samples: Point[] = [];
  for (let i = 0; i < joints.length; i++) {
    const { v, a, b } = joints[i];
    for (let t = 0; t <= 12; t++) {
      const s = t / 12;
      const m = 1 - s;
      samples.push({
        x: m * m * a.x + 2 * m * s * v.x + s * s * b.x,
        y: m * m * a.y + 2 * m * s * v.y + s * s * b.y,
      });
    }
    const nextA = joints[(i + 1) % joints.length].a;
    for (let t = 1; t <= 12; t++) {
      samples.push({
        x: b.x + (nextA.x - b.x) * t / 12,
        y: b.y + (nextA.y - b.y) * t / 12,
      });
    }
  }
  const table = new Array<number>(POLAR_BUCKETS).fill(0);
  for (const p of samples) {
    const angle = Math.atan2(p.y - CENTER.y, p.x - CENTER.x);
    const radius = Math.hypot(p.x - CENTER.x, p.y - CENTER.y);
    const bucket = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * POLAR_BUCKETS) % POLAR_BUCKETS;
    if (radius > table[bucket]) table[bucket] = radius;
  }
  // Пустые корзины заполняем ближайшим известным значением.
  for (let i = 0; i < POLAR_BUCKETS; i++) {
    if (table[i] > 0) continue;
    for (let step = 1; step < POLAR_BUCKETS; step++) {
      const left = table[(i - step + POLAR_BUCKETS) % POLAR_BUCKETS];
      const right = table[(i + step) % POLAR_BUCKETS];
      if (left > 0 || right > 0) { table[i] = Math.max(left, right); break; }
    }
  }
  return table;
}

const POLAR = buildPolarTable();

/**
 * Ширина контура, проходящего через точку, в единицах бокса.
 * Позволяет узнать, над каким контуром курсор, без перебора путей.
 */
export function contourWidthAt(localX: number, localY: number): number {
  const dx = localX - CENTER.x;
  const dy = localY - CENTER.y;
  const radius = Math.hypot(dx, dy);
  if (radius < 0.001) return 0;
  const angle = Math.atan2(dy, dx);
  const bucket = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * POLAR_BUCKETS) % POLAR_BUCKETS;
  const boundary = POLAR[(bucket + POLAR_BUCKETS) % POLAR_BUCKETS];
  return boundary > 0 ? (radius / boundary) * BOX_W : 0;
}

/*
 * Центр композиции в координатах карточки 535 × 535 и размеры контуров.
 * Подтверждённый контур виден целиком; внешние контуры поля уходят за нижний
 * край и проходят за копией на малой плотности, как в макете.
 */
export const SCENE = {
  cx: 267.5,
  cy: 362,
  heroWidth: 300,
  field: Array.from({ length: 14 }, (_, i) => 168 + i * 23),
} as const;
