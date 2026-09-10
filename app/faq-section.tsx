'use client';

import { useCallback, useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "framer-motion";
import { GlowBorder } from "./faq-glow-border";
import { faqCategories as categories } from "./faq-content";
import "./faq-section.css";

const spring = { type: "spring" as const, duration: 0.6, bounce: 0 };
function useMediaQuery(query: string) {
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", notify);
    return () => media.removeEventListener("change", notify);
  }, [query]);
  const snapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

function Reveal({
  children,
  delay = 0,
  amount = 0.5,
  reduced,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  amount?: number;
  reduced: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
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

function Question({
  item,
  index,
  mobile,
  reduced,
}: {
  item: (typeof categories)[number]["items"][number];
  index: number;
  mobile: boolean;
  reduced: boolean;
}) {
  // State belongs to each item. Changing category unmounts the previous items.
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const id = useId();
  const duration = reduced ? { duration: 0 } : spring;
  const circleFill =
    mobile && !open
      ? "rgba(255,255,255,.05)"
      : !mobile && hover
        ? "rgba(38,38,38,.85)"
        : "rgba(23,23,23,.85)";

  return (
    <Reveal
      reduced={reduced}
      delay={index * 0.1}
      amount={0}
      className="fq-item-reveal"
    >
      <article
        className={`fq-question ${open ? "is-open" : ""}`}
        onClick={() => {
          // Let readers select and copy an answer without closing the card.
          if (!window.getSelection()?.toString()) setOpen((value) => !value);
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="fq-card-glow">
          <GlowBorder
            radius={16}
            baseColor="rgba(255,255,255,.1)"
            surface="rgba(15,15,15,.85)"
            proximity={open ? 490 : 300}
            color={[255, 255, 255, open ? 0.8 : 0.25]}
          />
        </div>
        <div className="fq-question-content">
          <button
            type="button"
            className="fq-question-button"
            id={`${id}-button`}
            aria-expanded={open}
            aria-controls={`${id}-answer`}
          >
            <span>{item.question}</span>
            <motion.span
              className="fq-chevron-circle"
              aria-hidden="true"
              initial={false}
              animate={{
                rotate: open ? 0 : 180,
                backgroundColor: circleFill,
                borderColor:
                  mobile && !open
                    ? "rgba(255,255,255,0)"
                    : "rgba(255,255,255,.1)",
              }}
              transition={duration}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m4 16 8-8 8 8" />
              </svg>
            </motion.span>
          </button>
          {/* Only this height drives the card and every following card in normal flow. */}
          <motion.div
            className="fq-answer-box"
            initial={false}
            animate={{ height: open ? "auto" : 4 }}
            transition={duration}
            id={`${id}-answer`}
            role="region"
            aria-labelledby={`${id}-button`}
            aria-hidden={!open}
            inert={!open}
          >
            <motion.p
              initial={false}
              animate={{ opacity: open ? 1 : 0 }}
              transition={duration}
            >
              {item.answer}
            </motion.p>
          </motion.div>
        </div>
      </article>
    </Reveal>
  );
}

/** Fora FAQ layout and motion, adapted to the Passwork page and its typography. */
export default function FaqSection() {
  const [active, setActive] = useState<(typeof categories)[number]['id']>(categories[0].id);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const mobile = useMediaQuery("(max-width:809.98px)");
  const reduced = useMediaQuery("(prefers-reduced-motion:reduce)");
  const selected = categories.find((category) => category.id === active)!;
  const group = useId();

  return (
    <section
      className="fq-section"
      id="faq"
      aria-labelledby={`${group}-heading`}
    >
      <div className="fq-content">
        <header className="fq-header">
          <div className="fq-heading-column">
            <Reveal reduced={reduced}>
              <span className="fq-chip">
                <i aria-hidden="true" />
                FAQ
              </span>
            </Reveal>
            <Reveal reduced={reduced} delay={0.1}>
              <h2 id={`${group}-heading`}>
                Ответы на вопросы,<br />которые возникают чаще
              </h2>
            </Reveal>
          </div>
          <div className="fq-intro">
            <Reveal reduced={reduced} delay={0.2}>
              <p>
                О внедрении Пассворка, совместной работе с паролями
                и защите корпоративных данных.
              </p>
            </Reveal>
          </div>
        </header>

        <div className="fq-columns">
          <aside className="fq-sidebar">
            <div className="fq-nav-space">
              <nav className="fq-nav" aria-label="Темы вопросов">
                {!mobile && (
                  <GlowBorder className="fq-outer-glow" radius={28} />
                )}
                <div className="fq-tabs">
                  {categories.map((category) => {
                    const isActive = category.id === active;
                    return (
                      <motion.button
                        type="button"
                        key={category.id}
                        className="fq-tab"
                        aria-pressed={isActive}
                        onClick={() => setActive(category.id)}
                        onMouseEnter={() => setHoveredTab(category.id)}
                        onMouseLeave={() => setHoveredTab(null)}
                        animate={{
                          backgroundColor: isActive
                            ? "rgba(23,23,23,.85)"
                            : "rgba(0,0,0,0)",
                          color:
                            isActive || hoveredTab === category.id
                              ? "#fff3f0"
                              : "rgba(255,255,255,.8)",
                        }}
                        initial={false}
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { type: "spring", duration: 1, bounce: 0 }
                        }
                      >
                        <motion.span
                          className="fq-tab-glow"
                          initial={false}
                          animate={{ opacity: isActive ? 1 : 0 }}
                          transition={
                            reduced
                              ? { duration: 0 }
                              : { type: "spring", duration: 1, bounce: 0 }
                          }
                        >
                          <GlowBorder
                            radius={66}
                            proximity={130}
                            color={[255, 255, 255, 0.65]}
                            baseColor="rgba(255,255,255,.1)"
                            surface="rgba(23,23,23,.85)"
                          />
                        </motion.span>
                        <span className="fq-tab-label">
                          {category.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </nav>
            </div>
            {!mobile && (
              <div className="fq-contact">
                <GlowBorder
                  className="fq-outer-glow"
                  radius={24}
                  surface="#000"
                />
                <GlowBorder
                  radius={16}
                  baseColor="rgba(255,255,255,.1)"
                  surface="rgba(15,15,15,.85)"
                />
                <div className="fq-contact-copy">
                  <Reveal reduced={reduced}>
                    <h3>Остались вопросы?</h3>
                  </Reveal>
                  <Reveal reduced={reduced} delay={0.1}>
                    <p>
                      Поможем разобраться в возможностях Пассворка и обсудить внедрение.
                    </p>
                  </Reveal>
                </div>
                <Reveal reduced={reduced} delay={0.2}>
                  <a href="https://passwork.ru/help/">Связаться с нами →</a>
                </Reveal>
              </div>
            )}
          </aside>

          <div
            className="fq-list"
            role="region"
            aria-label={selected.label}
          >
            {selected.items.map((item, index) => (
              <Question
                key={item.id}
                item={item}
                index={index}
                mobile={mobile}
                reduced={reduced}
              />
            ))}
            {!mobile && (
              <GlowBorder
                className="fq-outer-glow"
                radius={24}
                surface="#000"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
