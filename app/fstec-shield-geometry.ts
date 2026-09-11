/*
 * Геометрия щита для панели сертификации, Figma 45:6893.
 *
 * Форма повторяет щит на самой эмблеме ФСТЭК: плоский верх, прямые борта до
 * середины высоты и прямой сход в точку. Скруглены только вершины.
 *
 * Поле контуров строится честным параллельным офсетом — каждая грань сдвигается
 * по нормали на одно и то же расстояние. Масштабирование формы от центра, которым
 * это делалось раньше, концентрических контуров не даёт: расстояние между
 * линиями получается пропорционально расстоянию от центра, поэтому у широкого
 * верха они расходятся, а у острия сбиваются в пучок.
 */

type Vertex = { x: number; y: number; r: number };
type Point = { x: number; y: number };

/** Центр композиции и размер подтверждённого контура в координатах карточки. */
const CX = 267.5;
const CY = 352;
const WIDTH = 300;
const HEIGHT = WIDTH * 1.18;
/** Доля высоты, на которой борт переходит в сход к острию. */
const HIP = 0.5;

const unit = (dx: number, dy: number): Point => {
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
};

/*
 * Вершины в координатах карточки, по часовой стрелке. Радиусы даны в долях
 * ширины, чтобы форма читалась одинаково при любом размере.
 */
const HERO: Vertex[] = (() => {
  const left = CX - WIDTH / 2;
  const right = CX + WIDTH / 2;
  const top = CY - HEIGHT / 2;
  const hip = top + HEIGHT * HIP;
  const tip = top + HEIGHT;
  const k = WIDTH / 100;
  return [
    { x: left, y: top, r: 10 * k },
    { x: right, y: top, r: 10 * k },
    { x: right, y: hip, r: 14 * k },
    { x: CX, y: tip, r: 10 * k },
    { x: left, y: hip, r: 14 * k },
  ];
})();

/**
 * Параллельный офсет выпуклого контура: грани сдвигаются по внешней нормали,
 * новая вершина — пересечение сдвинутых граней, радиус растёт на ту же величину.
 * Все углы формы выпуклые, поэтому митр-соединения достаточно.
 */
function offsetVertices(vertices: Vertex[], distance: number): Vertex[] {
  const n = vertices.length;
  return vertices.map((v, i) => {
    const prev = vertices[(i - 1 + n) % n];
    const next = vertices[(i + 1) % n];
    // Обход по часовой стрелке в экранных координатах: внешняя нормаль к (dx, dy) — (dy, −dx).
    const dirIn = unit(v.x - prev.x, v.y - prev.y);
    const dirOut = unit(next.x - v.x, next.y - v.y);
    const nIn = { x: dirIn.y, y: -dirIn.x };
    const nOut = { x: dirOut.y, y: -dirOut.x };
    const aIn = { x: v.x + nIn.x * distance, y: v.y + nIn.y * distance };
    const aOut = { x: v.x + nOut.x * distance, y: v.y + nOut.y * distance };
    // Пересечение двух прямых, заданных точкой и направлением.
    const cross = dirIn.x * dirOut.y - dirIn.y * dirOut.x;
    if (Math.abs(cross) < 1e-6) return { x: aIn.x, y: aIn.y, r: v.r + distance };
    const t = ((aOut.x - aIn.x) * dirOut.y - (aOut.y - aIn.y) * dirOut.x) / cross;
    return { x: aIn.x + dirIn.x * t, y: aIn.y + dirIn.y * t, r: Math.max(0, v.r + distance) };
  });
}

/** Скругляем вершины, оставляя грани прямыми: филет пишем кубикой. */
function toPath(vertices: Vertex[]): string {
  const n = vertices.length;
  const joints = vertices.map((v, i) => {
    const prev = vertices[(i - 1 + n) % n];
    const next = vertices[(i + 1) % n];
    const dirIn = unit(v.x - prev.x, v.y - prev.y);
    const dirOut = unit(next.x - v.x, next.y - v.y);
    // Радиус не должен съедать грань целиком.
    const limit = Math.min(
      Math.hypot(v.x - prev.x, v.y - prev.y),
      Math.hypot(next.x - v.x, next.y - v.y),
    ) / 2;
    const r = Math.min(v.r, limit);
    return {
      v,
      a: { x: v.x - dirIn.x * r, y: v.y - dirIn.y * r },
      b: { x: v.x + dirOut.x * r, y: v.y + dirOut.y * r },
    };
  });
  const f = (value: number) => Math.round(value * 100) / 100;
  let d = `M${f(joints[0].a.x)} ${f(joints[0].a.y)}`;
  for (let i = 0; i < n; i++) {
    const { v, a, b } = joints[i];
    const c1 = { x: a.x + (v.x - a.x) * 2 / 3, y: a.y + (v.y - a.y) * 2 / 3 };
    const c2 = { x: b.x + (v.x - b.x) * 2 / 3, y: b.y + (v.y - b.y) * 2 / 3 };
    d += `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(b.x)} ${f(b.y)}`;
    d += `L${f(joints[(i + 1) % n].a.x)} ${f(joints[(i + 1) % n].a.y)}`;
  }
  return `${d}Z`;
}

export const HERO_PATH = toPath(HERO);

/** Шаг поля: равные расстояния между контурами — в этом весь смысл офсета. */
const STEP = 15;
const RINGS = 13;

export const FIELD = Array.from({ length: RINGS }, (_, i) => {
  const distance = STEP * (i + 1);
  return {
    distance,
    d: toPath(offsetVertices(HERO, distance)),
    opacity: Math.max(0.028, 0.115 - (distance / (STEP * RINGS)) * 0.082),
  };
});

/* Плотная выборка подтверждённого контура для замеров расстояния до курсора. */
const OUTLINE: Point[] = (() => {
  const points: Point[] = [];
  const n = HERO.length;
  for (let i = 0; i < n; i++) {
    const from = HERO[i];
    const to = HERO[(i + 1) % n];
    for (let t = 0; t < 24; t++) {
      points.push({
        x: from.x + (to.x - from.x) * t / 24,
        y: from.y + (to.y - from.y) * t / 24,
      });
    }
  }
  return points;
})();

function isInside(x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = HERO.length - 1; i < HERO.length; j = i++) {
    const a = HERO[i], b = HERO[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

/**
 * Расстояние от точки до подтверждённого контура в координатах карточки.
 * Внутри формы отрицательное — так значение прямо сравнивается со сдвигом
 * контура и сразу говорит, над каким из них курсор.
 */
export function offsetAt(x: number, y: number): number {
  let min = Infinity;
  for (const p of OUTLINE) {
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < min) min = d;
  }
  return Math.sqrt(min) * (isInside(x, y) ? -1 : 1);
}

/** Эмблема сидит на щите гербом: по центру формы, чуть выше её середины. */
export const EMBLEM = (() => {
  const width = WIDTH * 0.54;
  const height = width / 0.77;
  return {
    width,
    height,
    x: CX - width / 2,
    y: CY - HEIGHT / 2 + HEIGHT * 0.13,
  };
})();

export const SCENE = { cx: CX, cy: CY, width: WIDTH, height: HEIGHT } as const;
