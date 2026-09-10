/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { easedBlackGradient } from "./header-gradient";
import "./passwork-header.css";

/** Fora header geometry and motion, adapted to the Passwork navigation. */
const HEADER_SPRING = { type: "spring", duration: 0.6, bounce: 0.1 } as const;
const ICON_SPRING = { type: "spring", duration: 0.4, bounce: 0.2 } as const;
const APPEAR = {
  type: "tween",
  duration: 1,
  ease: [0.44, 0, 0.56, 1],
} as const;
const gradient = easedBlackGradient();
const links = [
  ["Компания", "#company"],
  ["Сценарии", "#features"],
  ["Ресурсы", "https://manuals.passwork.ru/"],
  ["Цены", "https://passwork.ru/#prices"],
] as const;
const supportHref = "https://passwork.ru/help/";

export type HeaderProps = {
  /** Element whose top determines the scroll variant. Fora home uses #scroll. */
  scrollTarget?: string;
  /** Prefix for home-page anchors if this header is mounted on another route. */
  homeHref?: string;
};

function useHeaderPosition(selector: string) {
  // Keep the first client render consistent with the server-rendered header.
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width: 1279.98px)");
    const target = document.querySelector(selector);
    let frame = 0;
    let disposed = false;
    const update = () => {
      frame = 0;
      setMobile(media.matches);
      // The 1px tolerance reproduces the observed 158 -> 159px boundary
      // for Fora's marker at document y=160. This replaces Framer's runtime.
      setScrolled(
        target ? target.getBoundingClientRect().top <= 1 : scrollY > 0,
      );
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    update();
    document.fonts.ready.then(schedule);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, [selector]);
  return { mobile, scrolled };
}

function DemoAction({ desktop = false, onClick }: { desktop?: boolean; onClick?: () => void }) {
  const reduced = useReducedMotion();
  return (
    <motion.a
      className={`fh-signup ${desktop ? "fh-signup-desktop" : ""}`}
      href={supportHref}
      onClick={onClick}
      initial={false}
      animate={{ backgroundColor: "rgba(255,255,255,0.1)" }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.25)" }}
      transition={reduced ? { duration: 0 } : ICON_SPRING}
    >
      Запросить демо
    </motion.a>
  );
}

export default function PassworkHeader({
  scrollTarget = "#header-scroll-marker",
  homeHref = "",
}: HeaderProps) {
  const { mobile, scrolled } = useHeaderPosition(scrollTarget);
  const [open, setOpen] = useState(false);
  const [closedSolid, setClosedSolid] = useState(false);
  const reduced = useReducedMotion();
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const solid = mobile && (scrolled || open || closedSolid);
  const transition = reduced ? { duration: 0 } : HEADER_SPRING;
  const close = () => {
    setOpen(false);
    setClosedSolid(true);
  };

  // A changed scroll/breakpoint variant resets the local menu variant.
  useEffect(() => {
    setOpen(false);
    setClosedSolid(false);
  }, [mobile, scrolled]);
  // Accessibility addition to the adaptation: original has no Escape handler.
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        toggle.current?.focus();
      }
    };
    addEventListener("keydown", escape);
    return () => removeEventListener("keydown", escape);
  }, [open]);

  const variant = mobile
    ? open
      ? "mobile-open"
      : solid
        ? "mobile-scroll"
        : "mobile-top"
    : scrolled
      ? "desktop-scroll"
      : "desktop-top";
  return (
    <motion.header
      className="fh-fixed"
      data-variant={variant}
      initial={reduced ? false : { opacity: 0.001, y: -36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : APPEAR}
    >
      <motion.nav
        className="fh-nav"
        aria-label="Основная навигация"
        initial={false}
        animate={{
          backgroundColor: solid ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0)",
          backdropFilter: solid ? "blur(8px)" : "none",
        }}
        transition={transition}
      >
        {!mobile && (
          <motion.div
            className="fh-gradient"
            aria-hidden="true"
            style={{ backgroundImage: gradient }}
            initial={false}
            animate={{ opacity: scrolled ? 1 : 0 }}
            transition={transition}
          />
        )}
        <div className="fh-inner">
          <div className="fh-row">
            <div className="fh-logo-slot">
              <a
                className="fh-logo"
                href={`${homeHref}#top`}
                aria-label="Пассворк — на главную"
                onClick={() => {
                  if (open) close();
                }}
              >
                <img className="fh-logo-symbol" src="/assets/passwork-symbol.svg" alt="" width="24" height="24" />
                <img className="fh-logo-wordmark" src="/assets/passwork-wordmark.svg" alt="Пассворк" width="82" height="17" />
              </a>
            </div>
            {!mobile && (
              <div className="fh-links">
                {links.map(([label, href]) => (
                  <a
                    key={label}
                    className="fh-link"
                    href={href.startsWith("#") ? homeHref + href : href}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
            <div className="fh-actions">
              {mobile ? (
                <button
                  ref={toggle}
                  type="button"
                  className="fh-menu-toggle"
                  aria-controls={menuId}
                  aria-expanded={open}
                  aria-label={open ? "Закрыть меню" : "Открыть меню"}
                  onClick={() => {
                    if (open) close();
                    else setOpen(true);
                  }}
                >
                  {[0, 1].map((i) => (
                    <motion.span
                      key={i}
                      initial={false}
                      animate={{
                        top: open ? 17 : i === 0 ? 11 : 23,
                        rotate: open ? (i === 0 ? 45 : -45) : 0,
                      }}
                      transition={reduced ? { duration: 0 } : ICON_SPRING}
                    />
                  ))}
                </button>
              ) : (
                <DemoAction desktop />
              )}
            </div>
          </div>
          {mobile && (
            <motion.div
              id={menuId}
              className="fh-menu"
              inert={!open}
              aria-hidden={!open}
              initial={false}
              animate={{
                height: open ? "auto" : 1,
                opacity: open ? 1 : 0,
                padding: open ? "24px" : "0px",
                gap: open ? "36px" : "0px",
              }}
              transition={transition}
            >
              {links.map(([label, href]) => (
                <a
                  key={label}
                  className="fh-link fh-menu-link"
                  href={href.startsWith("#") ? homeHref + href : href}
                  onClick={close}
                >
                  {label}
                </a>
              ))}
              <div className="fh-menu-cta">
                <DemoAction onClick={close} />
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>
    </motion.header>
  );
}
