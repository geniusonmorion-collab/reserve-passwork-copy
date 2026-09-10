'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import GlowBorder from "./card-glow";
import WhatYouGetVisual from "./what-you-get-visuals";
import "./what-you-get.css";

// Copy based on Passwork Figma node 584:11009; on-premise deployment and
// data isolation share the final card. Product visuals use Fora-style glass.
const content: {
  label: string; title: string; description: string; footnote: string;
  extra?: { title: string; description: string };
}[] = [
  {
    label: "Сертификация",
    title: "ФСТЭК России, 4 уровень доверия",
    description:
      "Подтверждает соответствие требованиям безопасности госсектора и критической инфраструктуры",
    extra: {
      title: "Российская разработка",
      description: "Пассворк разработан в России и включён в реестр отечественного программного обеспечения Минцифры.",
    },
    footnote: "Готов к проверке ФСБ",
  },
  {
    label: "Шифрование",
    title: "ГОСТ-шифрование",
    description:
      "Поддержка ГОСТ Р 34.10-2012 и ГОСТ Р 34.11-2012 — отечественные стандарты шифрования и подписи",
    extra: {
      title: "Защита в закрытом контуре",
      description: "Работа на серверах заказчика без телеметрии, внешних API и зависимости от зарубежных сервисов.",
    },
    footnote: "Без иностранных зависимостей",
  },
  {
    label: "Инфраструктура",
    title: "Размещение внутри инфраструктуры",
    description:
      "Полное on-premise развёртывание на серверах заказчика без зависимости от облачных провайдеров",
    extra: {
      title: "Отсутствие передачи данных",
      description: "Никакой телеметрии, внешних API и зависимостей от зарубежных сервисов — абсолютная изоляция",
    },
    footnote: "Без облачных провайдеров",
  },
];

const clamp = (x: number) => Math.max(0, Math.min(1, x));
// Framer's offsetTop traversal ignores the element's visual CSS transform.
function layoutTop(element: HTMLElement) {
  let y = 0;
  for (
    let el: HTMLElement | null = element;
    el;
    el = el.offsetParent as HTMLElement | null
  )
    y += el.offsetTop;
  return y;
}
function useMediaQuery(media: string) {
  const subscribe = useCallback((notify: () => void) => {
    const query = window.matchMedia(media);
    query.addEventListener("change", notify);
    return () => query.removeEventListener("change", notify);
  }, [media]);
  const snapshot = useCallback(() => window.matchMedia(media).matches, [media]);
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

function Reveal({
  children,
  delay = 0,
  className = "",
  reduced,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  reduced: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={
        reduced
          ? { duration: 0 }
          : { type: "spring", duration: 1, bounce: 0, delay }
      }
    >
      {children}
    </motion.div>
  );
}
function Marker() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 2v6m0 8v6M2 12h6m8 0h6" />
    </svg>
  );
}

function Card({
  index,
  exitProgress,
  imageProgress,
  reduced,
}: {
  index: number;
  exitProgress: MotionValue<number>;
  imageProgress: MotionValue<number>;
  reduced: boolean;
}) {
  const data = content[index];
  const opacity = useTransform(exitProgress, [0, 1], [1, 0]);
  const scale = useTransform(exitProgress, [0, 1], [1, 0.9]);
  const y = useTransform(exitProgress, [0, 1], [0, -24]);
  const imageScale = useTransform(imageProgress, [0, 1], [1.1, 1]);
  const exitStyle = { opacity, scale, y };

  return (
    <motion.article
      className={`wy-card wy-card-${index + 1}`}
      // Original asymmetry: card 1 animates its inner face; card 2 animates the sticky node.
      style={index === 1 ? exitStyle : undefined}
      aria-label={data.label}
    >
      {index === 0 && <GlowBorder className="wy-outer-glow" radius={24} />}
      <motion.div
        className="wy-face"
        style={index === 0 ? exitStyle : undefined}
      >
        <GlowBorder
          radius={16}
          baseColor="rgba(255,255,255,.1)"
          surface="rgba(15,15,15,.85)"
        />
        <div className="wy-row">
          <div className="wy-copy">
            <Reveal reduced={reduced}>
              <span className="wy-label">
                <i />
                {data.label}
              </span>
            </Reveal>
            <div className="wy-body">
              <Reveal reduced={reduced} delay={0.1}>
                <h3>{data.title}</h3>
              </Reveal>
              <Reveal reduced={reduced} delay={0.2}>
                <p>{data.description}</p>
              </Reveal>
              {data.extra && <Reveal reduced={reduced} delay={0.2} className="wy-extra">
                <h4>{data.extra.title}</h4>
                <p>{data.extra.description}</p>
              </Reveal>}
            </div>
            <Reveal reduced={reduced} delay={0.2} className="wy-footnote">
              <Marker />
              <p>{data.footnote}</p>
            </Reveal>
          </div>
          <div className="wy-media">
            <motion.div
              className="wy-image"
              data-image-index={index}
              style={{
                opacity: imageProgress,
                scale: reduced ? 1 : imageScale,
              }}
            >
              <WhatYouGetVisual index={index} reduced={reduced} visibility={opacity} imageProgress={imageProgress} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

/** Port of the user-supplied Fora What you get study and its local preview. */
export default function WhatYouGet() {
  const section = useRef<HTMLElement>(null);
  const cards = useRef<HTMLDivElement>(null);
  const exit1 = useMotionValue(0),
    exit2 = useMotionValue(0),
    exit3 = useMotionValue(0);
  const image1 = useMotionValue(0),
    image2 = useMotionValue(0),
    image3 = useMotionValue(0);
  const mobile = useMediaQuery("(max-width: 809.98px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const root = section.current!,
      stack = cards.current!;
    let frame: number | null = null;
    const exits = [exit1, exit2],
      images = [image1, image2, image3];
    function update() {
      frame = null;
      const scroll = window.scrollY,
        H = window.innerHeight;
      const targets = stack.querySelectorAll<HTMLElement>(".wy-trigger");
      exits.forEach((value, i) => {
        const target = targets[i + 1];
        const start = layoutTop(target) - 1 - H * 0.5;
        value.set(
          mobile || reduced
            ? 0
            : clamp((scroll - start) / Math.max(1, target.clientHeight)),
        );
      });
      // The third original exit references an unbound ref16, so it has no effective exit.
      exit3.set(0);
      root.querySelectorAll<HTMLElement>(".wy-image").forEach((el, i) => {
        // Original onInView transform uses offsets ["start end", "end end"].
        images[i].set(
          reduced
            ? 1
            : clamp(
                (scroll + H - layoutTop(el)) / Math.max(1, el.clientHeight),
              ),
        );
      });
    }
    function schedule() {
      if (frame === null) frame = requestAnimationFrame(update);
    }
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    resize.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    root.addEventListener("load", schedule, true);
    schedule();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.removeEventListener("load", schedule, true);
    };
  }, [
    mobile,
    reduced,
    exit1,
    exit2,
    exit3,
    image1,
    image2,
    image3,
  ]);

  return (
    <section
      id="what-you-get"
      lang="ru"
      className="wy-section"
      ref={section}
      aria-labelledby="wy-heading"
    >
      <div className="wy-container">
        <header className="wy-header">
          <div className="wy-heading-column">
            <Reveal reduced={reduced} delay={0.1}>
              <h2 id="wy-heading">
                Российское решение
                <br />
                <span>для корпоративной безопасности</span>
              </h2>
            </Reveal>
          </div>
          <div className="wy-intro">
            <Reveal reduced={reduced} delay={0.2}>
              <p>
                Пассворк разработан в России и включён в реестр отечественного программного обеспечения Минцифры.
              </p>
            </Reveal>
          </div>
        </header>
        <div className="wy-cards" ref={cards}>
          <div className="wy-triggers" aria-hidden="true">
            <div className="wy-trigger" />
            <div className="wy-trigger" />
            <div className="wy-trigger" />
          </div>
          <Card
            index={0}
            exitProgress={exit1}
            imageProgress={image1}
            reduced={reduced}
          />
          <Card
            index={1}
            exitProgress={exit2}
            imageProgress={image2}
            reduced={reduced}
          />
          <Card
            index={2}
            exitProgress={exit3}
            imageProgress={image3}
            reduced={reduced}
          />
        </div>
      </div>
    </section>
  );
}
