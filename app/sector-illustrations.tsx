'use client';

import { useEffect, useRef } from 'react';
import { attachSectorHover } from './sector-hover';
import './sector-illustrations.css';

/*
 * Иллюстрации карточек применения, Figma 45:6893.
 *
 * Координаты и размеры взяты из метаданных узлов, в системе координат карточки
 * 262.5 × 262.5, и переводятся в пиксели единицей `--u` от текущей ширины
 * карточки. Числа ниже сверяются с Figma напрямую.
 *
 * Зеркальные ветви в метаданных отдаются углом до отражения, поэтому их left/top
 * посчитаны как `x − width` и `y − height` от выданных значений.
 *
 * Поведение при наведении задаётся разметкой и считается в `sector-hover.ts`:
 * `depth` — план для параллакса, `signal` — импульс по ветви, `pulse` — момент,
 * когда элемент вспыхивает, приняв импульс.
 */

export type SectorSceneName =
  | 'production'
  | 'infrastructure'
  | 'personal-data'
  | 'government';

/** Дизайн-единица карточки: 1 = 1 px при ширине карточки 262.5 px. */
const u = (value: number) => `calc(${value} * var(--u))`;

/*
 * Геометрия Lucide, 24 × 24. Экспорт узла содержит эти же глифы, вписанные
 * в квадратные боксы: несквадратные сжаты по горизонтали (у monitor масштаб
 * 0.48 по X против 0.6 по Y), поэтому берём исходные пропорции.
 */
const glyphs = {
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </>
  ),
  server: (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <path d="M6 6h.01" />
      <path d="M6 18h.01" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </>
  ),
  /* Журнал: квадрат 18 × 18 и три строки разной длины. Узел 45:7018 —
     не стоковый глиф Lucide, геометрия восстановлена из экспорта. */
  journal: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h8" />
      <path d="M7 12h10" />
      <path d="M7 16h6" />
    </>
  ),
  document: (
    <>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  /* В макете щит с галочкой: у экспорта две path — контур и «птичка». */
  'shield-check': (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 9.05a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
} as const;

type GlyphName = keyof typeof glyphs;

/* Обводка в макете задана в системе каждого глифа: у щита это 1.5 в сетке 24,
   у остальных — 1.65. При таком пересчёте отрисованная толщина совпадает
   с Figma с точностью до 0.1 px на всех размерах. */
const glyphStroke = (name: GlyphName) => (name === 'shield-check' ? 1.5 : 1.65);

function Glyph({ name, size }: { name: GlyphName; size: number }) {
  return (
    <svg
      className="si-glyph"
      viewBox="0 0 24 24"
      style={{
        width: u(size),
        height: u(size),
        '--si-stroke': (glyphStroke(name) * size / 24).toFixed(4),
      } as React.CSSProperties}
      fill="none"
      aria-hidden="true"
    >
      {glyphs[name]}
    </svg>
  );
}

/** Стеклянная плитка макета: один материал, размер и радиус — параметры. */
function Tile({
  left, top, size, radius, blur, glyph, glyphSize,
  lifted = false, depth = 0.6, pulse, delay = 0,
}: {
  left: number; top: number; size: number; radius: number; blur: number;
  glyph: GlyphName; glyphSize: number; lifted?: boolean; depth?: number;
  /** Момент цикла, когда плитка принимает импульс и вспыхивает. */
  pulse?: number;
  /** Доля хода наведения, которую план ждёт перед вступлением. */
  delay?: number;
}) {
  return (
    <div
      className={`si-tile${lifted ? ' si-tile--lifted' : ''}`}
      data-depth={depth}
      {...(pulse === undefined ? {} : { 'data-pulse-target': '', 'data-start': pulse })}
      style={{
        left: u(left),
        top: u(top),
        width: u(size),
        height: u(size),
        '--si-radius': u(radius),
        '--si-blur': u(blur),
        '--si-depth': depth,
        '--si-delay': delay,
      } as React.CSSProperties}
    >
      <Glyph name={glyph} size={glyphSize} />
    </div>
  );
}

/*
 * Ветвь связи: одна S-кривая, которую макет размножает отражениями.
 * Градиент плотный у щита и гаснет к внешнему концу; зеркальные копии
 * наследуют направление затухания вместе с CSS-трансформом.
 *
 * Поверх лежат слои импульса с pathLength="1": у всех общая голова, но разная
 * длина штриха, поэтому назад тянется след с затуханием. Отдельный широкий
 * слой под головой даёт свет. Сдвиг штриха — идиом `certification-motion`.
 */
const branches = {
  production: {
    width: 91,
    height: 49.5229,
    d: 'M0 49.2615H33.5C40.1274 49.2615 45.5 43.8889 45.5 37.2615V12.2615C45.5 5.63403 50.8726 0.26145 57.5 0.26145H91',
  },
  infrastructure: {
    width: 142.229,
    height: 55.9504,
    d: 'M0 55.6889H33.4656C41.5518 55.6889 48.1069 49.1338 48.1069 41.0477V10.8593C48.1069 4.5255 53.2414 0.26145 59.5752 0.26145H142.229',
  },
  straight: { width: 130.5871, height: 1, d: 'M0 .5H130.5871' },
} as const;

/* Слои импульса от хвоста к голове: длина штриха задаёт, насколько далеко
   назад тянется след, яркость и толщина — в CSS. */
const signalLayers = [
  { name: 'tail', dash: 0.44 },
  { name: 'mid', dash: 0.26 },
  { name: 'glow', dash: 0.13 },
  { name: 'head', dash: 0.13 },
] as const;

function Branch({
  variant, left, top, width, height, flip, signal, duration = 0.9,
}: {
  variant: keyof typeof branches;
  left: number; top: number; width: number; height: number;
  flip?: 'x' | 'y' | 'xy';
  /** Момент старта импульса внутри цикла, секунды. */
  signal?: number;
  duration?: number;
}) {
  const shape = branches[variant];
  return (
    <svg
      className="si-branch"
      data-flip={flip}
      data-depth="0.3"
      viewBox={`0 0 ${shape.width} ${shape.height}`}
      preserveAspectRatio="none"
      style={{
        left: u(left), top: u(top), width: u(width), height: u(height),
        '--si-depth': 0.3,
        '--si-delay': 0.05,
      } as React.CSSProperties}
      fill="none"
      aria-hidden="true"
    >
      <path d={shape.d} stroke={`url(#si-branch-${variant})`} />
      {signal !== undefined && signalLayers.map((layer) => (
        <path
          key={layer.name}
          className={`si-branch__signal si-branch__signal--${layer.name}`}
          d={shape.d}
          pathLength="1"
          data-signal
          data-dash={layer.dash}
          data-start={signal}
          data-duration={duration}
        />
      ))}
      <defs>
        <linearGradient
          id={`si-branch-${variant}`}
          x1="0"
          x2={shape.width}
          y1="0"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--si-line)" />
          <stop offset="1" stopColor="var(--si-line)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/*
 * Один щит и три системы, к которым он открывает доступ. Узел 45:6900.
 * При наведении доступ раздаётся по очереди: импульс уходит по ветви и
 * плитка на её конце принимает его вспышкой.
 */
function ProductionScene() {
  return (
    <>
      <Branch variant="production" left={89.9935} top={110.7419} width={101.5677} height={54.6903} signal={0.16} />
      <Branch variant="straight" left={84.4129} top={165.4324} width={130.5871} height={1} signal={0.32} />
      <Branch variant="production" left={89.9935} top={165.4324} width={101.5677} height={54.6903} flip="x" signal={0.48} />
      <Tile left={42} top={140.8775} size={49.1097} radius={5.5807} blur={4.0422} glyph="shield-check" glyphSize={22.3226} lifted depth={1} />
      <Tile left={178.1677} top={94} size={35.7161} radius={5.6923} blur={2.287} glyph="monitor" glyphSize={16.0723} depth={0.7} pulse={0.88} delay={0.08} />
      <Tile left={178.1677} top={147.5743} size={35.7161} radius={5.6923} blur={2.287} glyph="server" glyphSize={16.0723} depth={0.7} pulse={1.04} delay={0.14} />
      <Tile left={178.1677} top={201.1485} size={35.7161} radius={5.6923} blur={2.287} glyph="journal" glyphSize={16.0723} depth={0.7} pulse={1.2} delay={0.2} />
    </>
  );
}

/*
 * Узлы инфраструктуры вокруг защищённого центра. Узел 45:6929.
 * Импульсы расходятся из центра сразу во все четыре стороны — контур
 * охватывает узлы одновременно, а не по очереди.
 */
function InfrastructureScene() {
  return (
    <>
      <Branch variant="infrastructure" left={141.289} top={113.5496} width={142.229} height={55.4275} signal={0.2} duration={1} />
      <Branch variant="infrastructure" left={141.289} top={168.977} width={142.229} height={55.4275} flip="y" signal={0.28} duration={1} />
      <Branch variant="infrastructure" left={-21.5024} top={112.5496} width={142.229} height={55.4275} flip="x" signal={0.24} duration={1} />
      <Branch variant="infrastructure" left={-21.5024} top={167.977} width={142.229} height={55.4275} flip="xy" signal={0.32} duration={1} />
      <Tile left={57.5869} top={95.8245} size={32} radius={5.1} blur={2.049} glyph="server" glyphSize={14.4} depth={0.65} pulse={0.95} delay={0.1} />
      <Tile left={173.4043} top={201.1755} size={32} radius={5.1} blur={2.049} glyph="database" glyphSize={14.4} depth={0.65} pulse={1.05} delay={0.16} />
      <Tile left={102.5078} top={139.9314} size={56} radius={8} blur={3.586} glyph="shield-check" glyphSize={24} lifted depth={1} />
    </>
  );
}

/*
 * Персональные данные скрыты: значения заменены точками. Узел 45:6954.
 * При наведении по точкам идёт волна считывания — слева направо и сверху вниз.
 * Ведут себя сами значения, карточку ничто не пересекает: читается как аудит
 * доступа, а не как раскрытие. Точки — отдельные элементы, а не символы,
 * поэтому шагом и поведением каждой управляем явно.
 */
const personalDataFields = ['name', 'email', 'phone'];
const maskedDots = Array.from({ length: 14 }, (_, index) => index);

function PersonalDataScene() {
  return (
    <>
      <div className="si-record" data-depth="0.85" style={{ '--si-depth': 0.85, '--si-delay': 0.04 } as React.CSSProperties}>
        <div className="si-record__keys">
          {personalDataFields.map((field) => <span key={field}>{field}</span>)}
        </div>
        <div className="si-record__values" aria-hidden="true">
          {personalDataFields.map((field, row) => (
            <span key={field} className="si-record__row" style={{ '--si-row': row } as React.CSSProperties}>
              {maskedDots.map((dot) => (
                <i key={dot} style={{ '--si-dot': dot } as React.CSSProperties} />
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="si-record-fade" aria-hidden="true" />
    </>
  );
}

/*
 * Стопка государственных систем: одна плашка в трёх масштабах — 0.8, 0.9 и 1 —
 * с нарастающей плотностью стекла. Узел 45:6968. Прозрачность в макете задана
 * только подписи и иконке: рамка плашки остаётся во всю силу.
 *
 * При наведении стопка разворачивается: плашки расходятся по глубине, а их
 * подписи проявляются снизу вверх — от реестра к правилу доступа.
 */
const governmentSystems = [
  { label: 'Реестр', glyph: 'document', scale: 0.8, top: 125.5, width: 171.2, height: 37.664, glyphSize: 14.899, font: 12.416, blur: 11.77, density: 0.4, ink: 0.4, depth: 0.35, pulse: 0.62, delay: 0.16 },
  { label: 'СЭД', glyph: 'database', scale: 0.9, top: 150.752, width: 192.6, height: 42.372, glyphSize: 16.554, font: 13.243, blur: 17.12, density: 0.64, ink: 0.5, depth: 0.6, pulse: 0.38, delay: 0.08 },
  { label: 'Доступ по роли', glyph: 'shield-check', scale: 1, top: 178.572, width: 214, height: 47.08, glyphSize: 19.865, font: 14.899, blur: 11.77, density: 1, ink: 1, depth: 1, pulse: 0.14, delay: 0 },
] as const satisfies readonly {
  label: string; glyph: GlyphName; scale: number; top: number; width: number;
  height: number; glyphSize: number; font: number; blur: number;
  density: number; ink: number; depth: number; pulse: number; delay: number;
}[];

function GovernmentScene() {
  return <>
    {governmentSystems.map((system) => (
      <div
        key={system.label}
        className="si-pill"
        data-depth={system.depth}
        data-pulse-target=""
        data-start={system.pulse}
        data-flash="0.9"
        style={{
          top: u(system.top),
          width: u(system.width),
          height: u(system.height),
          paddingLeft: u(16.4194 * system.scale),
          paddingRight: u(13.2087 * system.scale),
          '--si-radius': u(8.56 * system.scale),
          '--si-blur': u(system.blur),
          '--si-glass-alpha': system.density,
          '--si-ink': system.ink,
          '--si-pill-font': u(system.font),
          '--si-depth': system.depth,
          '--si-delay': system.delay,
        } as React.CSSProperties}
      >
        <span className="si-pill__label">{system.label}</span>
        <Glyph name={system.glyph} size={system.glyphSize} />
      </div>
    ))}
  </>;
}

const scenes: Record<SectorSceneName, () => React.JSX.Element> = {
  production: ProductionScene,
  infrastructure: InfrastructureScene,
  'personal-data': PersonalDataScene,
  government: GovernmentScene,
};

export default function SectorIllustration({ scene }: { scene: SectorSceneName }) {
  const Scene = scenes[scene];
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sceneRef.current;
    const card = element?.closest<HTMLElement>('.figma-sector-card');
    if (element && card) return attachSectorHover(element, card);
  }, []);

  return (
    <div ref={sceneRef} className="si-scene" data-scene={scene} aria-hidden="true">
      <Scene />
    </div>
  );
}
