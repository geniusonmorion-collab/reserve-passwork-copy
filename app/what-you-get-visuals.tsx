/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MotionValue } from "framer-motion";
import BackgroundStars from "./background-stars";
import { DASHBOARD_ICONS } from "./dashboard-shared";
import { TERMINAL_COMMANDS, TERMINAL_COMPLETE, TERMINAL_TIMELINE } from "./terminal-typing";
import "./what-you-get-visuals.css";

function Icon({ name }: { name: string }) {
  return <span className="wy-ui-icon" dangerouslySetInnerHTML={{ __html: DASHBOARD_ICONS[name] }} />;
}

function Shield() {
  return <img className="wy-ui-shield" src="/assets/figma-15-3963/certification-shield.svg" alt="" width={24} height={24} />;
}

function BrandBar({ label }: { label: string }) {
  return <div className="wy-ui-brandbar">
    <span className="wy-ui-brand"><span className="wy-ui-brandmark"><Shield /></span>Пассворк</span>
    <span className="wy-ui-subtle">{label}</span>
  </div>;
}

const illustrationChips = [
  { primary: "Сертификат", secondary: "ФСТЭК", detail: "PDF" },
  { primary: "CLI", secondary: "Production", detail: "Ротация" },
  { primary: "Сервер", secondary: "On-premise", detail: "Локально" },
];

function IllustrationChips({ index }: { index: number }) {
  const chips = illustrationChips[index];
  return <div className="wy-ui-toolbar" aria-hidden="true">
    <div className="wy-ui-toolbar-group">
      <span className="wy-ui-toolbar-chip wy-ui-toolbar-icon">
        {index === 0 ? <Icon name="copy" /> : index === 1 ? <span className="wy-ui-cli-symbol">&gt;_</span> : <Shield />}
      </span>
      <span className="wy-ui-toolbar-chip wy-ui-toolbar-chip--active">{chips.primary}</span>
      <span className="wy-ui-toolbar-chip wy-ui-toolbar-chip--secondary">{chips.secondary}</span>
    </div>
    <span className="wy-ui-toolbar-chip">{chips.detail}</span>
  </div>;
}

function CertificationVisual() {
  return <div className="wy-ui-panel wy-ui-certificate">
    <div className="wy-ui-certificate-issuer"><span>ФСТЭК России</span><Shield /></div>
    <div className="wy-ui-certificate-heading">
      <span className="wy-ui-certificate-label">Сертификат соответствия</span>
      <strong className="wy-ui-certificate-product">Пассворк</strong>
      <span className="wy-ui-certificate-description">Корпоративный менеджер паролей</span>
    </div>
    <div className="wy-ui-certificate-level">
      <span className="wy-ui-certificate-number">4</span>
      <span>уровень<br />доверия</span>
    </div>
    <div className="wy-ui-certificate-footer"><Icon name="check" /><span>Соответствие подтверждено</span></div>
  </div>;
}

function CommandText({ text }: { text: string }) {
  // Keep the syntax colours as each token is being entered, including an open quote.
  return text.split(/("[^"]*"?|\\)/g).filter(Boolean).map((part, i) =>
    part.startsWith('"') ? <span className="wy-ui-command-value" key={i}>{part}</span>
      : part === "\\" ? <em key={i}>{part}</em> : <span key={i}>{part}</span>);
}

function CryptoVisual({ reduced, visibility, imageProgress }: { reduced: boolean; visibility: MotionValue<number>; imageProgress: MotionValue<number> }) {
  const terminal = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(TERMINAL_COMPLETE);

  useEffect(() => {
    if (reduced) return;
    const element = terminal.current!;
    const { frames, duration } = TERMINAL_TIMELINE;
    let elapsed = 0, index = 0, previous = 0, raf = 0;
    let inView = false, active = false;
    setFrame(frames[0]);

    function tick(now: number) {
      raf = 0;
      if (!active) return;
      elapsed += previous ? Math.min(now - previous, 80) : 0;
      previous = now;
      if (elapsed >= duration) {
        elapsed %= duration;
        index = 0;
        setFrame(frames[0]);
      }
      let next = index;
      while (next + 1 < frames.length && frames[next + 1].at <= elapsed) next++;
      if (next !== index) {
        index = next;
        setFrame(frames[index]);
      }
      raf = requestAnimationFrame(tick);
    }

    function sync() {
      // Sticky cards can remain geometrically in view after fading under the next
      // card. Follow both scroll opacity values as well as actual intersection.
      const shouldPlay = inView && !document.hidden && visibility.get() > .55 && imageProgress.get() > .4;
      if (active === shouldPlay) return;
      active = shouldPlay;
      element.dataset.playing = String(active);
      previous = 0;
      if (active) raf = requestAnimationFrame(tick);
      else { cancelAnimationFrame(raf); raf = 0; }
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= .35;
      sync();
    }, { threshold: [0, .35] });
    observer.observe(element);
    const stopVisibility = visibility.on("change", sync);
    const stopImage = imageProgress.on("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      stopVisibility();
      stopImage();
      document.removeEventListener("visibilitychange", sync);
      element.dataset.playing = "false";
    };
  }, [reduced, visibility, imageProgress]);

  const current = reduced ? TERMINAL_COMPLETE : frame;
  const firstDone = ["updated", "logged", "done", "clearing"].includes(current.phase);
  const secondDone = ["logged", "done", "clearing"].includes(current.phase);
  const complete = current.phase === "done" || current.phase === "clearing";

  return <div ref={terminal} className="wy-ui-panel wy-ui-terminal" data-phase={current.phase} data-reduced={reduced}>
      <div className="wy-ui-terminal-bar"><span className="wy-ui-window-dots"><i /><i /><i /></span><span>passwork-cli</span><span className="wy-ui-subtle">Production</span></div>
      <div className="wy-ui-terminal-body">
        <div className="wy-ui-code-group">
          {TERMINAL_COMMANDS.map((command, line) => <code key={line} className={`wy-ui-code-line${line > 0 ? " wy-ui-indent" : ""}`}>
            <span className="wy-ui-code-reserve">{line === 0 && <b>$ </b>}<CommandText text={command} /><i className="wy-ui-text-caret" /></span>
            <span className="wy-ui-code-ink">{line === 0 && <b>$ </b>}<CommandText text={current.lines[line]} />{current.caretLine === line && <i key={current.lines[line].length} className="wy-ui-text-caret" />}</span>
          </code>)}
        </div>
        <div className="wy-ui-code-group wy-ui-code-muted">
          <code className="wy-ui-output" data-visible={current.phase !== "typing"}>
            {firstDone ? <><span className="wy-ui-success">✓</span> Пароль обновлён</> : <><span className="wy-ui-terminal-spinner" /> Обновление пароля…</>}
          </code>
          <code className="wy-ui-output" data-visible={secondDone}><span className="wy-ui-success">✓</span> Действие записано в журнал</code>
        </div>
        <div className="wy-ui-terminal-result wy-ui-output" data-visible={complete}><Icon name="check" /><span>Password rotated successfully</span></div>
      </div>
    </div>;
}

function Setting({ title, detail, value }: { title: string; detail: string; value: string }) {
  return <div className="wy-ui-setting"><div><strong>{title}</strong><small>{detail}</small></div><span>{value}</span></div>;
}

function InfrastructureVisual() {
  return <div className="wy-ui-panel wy-ui-infrastructure">
    <BrandBar label="Администрирование" />
    <div className="wy-ui-content">
      <div className="wy-ui-title-row"><strong>Размещение</strong><span className="wy-ui-tag">On-premise</span></div>
      <div className="wy-ui-tabs"><span className="is-selected">Инфраструктура</span><span>Подключения</span></div>
      <div className="wy-ui-server"><span className="wy-ui-square"><Shield /></span><div><strong>passwork.internal</strong><small>Сервер организации</small></div><span className="wy-ui-online">В сети</span></div>
      <div className="wy-ui-settings">
        <Setting title="Хранилище" detail="Пароли, файлы и вложения" value="Локально" />
        <Setting title="Резервные копии" detail="Внутри инфраструктуры" value="Локально" />
      </div>
      <div className="wy-ui-local-note"><Icon name="check" />Данные остаются в вашей сети</div>
    </div>
  </div>;
}

const descriptions = [
  "Стилизованный стеклянный документ: ФСТЭК России, сертификат соответствия Пассворка, 4-й уровень доверия.",
  "Стеклянное окно терминала Пассворка: команда обновления пароля и подтверждение успешной ротации.",
  "Настройки Пассворка: пароли, файлы и резервные копии на сервере организации. Данные остаются во внутренней сети.",
];

export default function WhatYouGetVisual({ index, reduced, visibility, imageProgress }: { index: number; reduced: boolean; visibility: MotionValue<number>; imageProgress: MotionValue<number> }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const subscribe = useCallback((notify: () => void) => {
    const stopVisibility = visibility.on("change", notify);
    const stopImage = imageProgress.on("change", notify);
    return () => { stopVisibility(); stopImage(); };
  }, [visibility, imageProgress]);
  const starsActive = useSyncExternalStore(subscribe,
    () => visibility.get() > 0.05 && imageProgress.get() > 0.05,
    () => false);

  return <div ref={sceneRef} className={`wy-ui-scene wy-ui-scene-${index + 1}`} role="img" aria-label={descriptions[index]}>
    <BackgroundStars occlusionRef={sceneRef} occlusionSelector=".wy-ui-panel" className="wy-ui-stars" active={starsActive} starSize={8} />
    {index !== 1 && <IllustrationChips index={index} />}
    <div className="wy-ui-composition" aria-hidden="true">
      {index === 0 ? <CertificationVisual /> : index === 1 ? <CryptoVisual reduced={reduced} visibility={visibility} imageProgress={imageProgress} /> : <InfrastructureVisual />}
    </div>
  </div>;
}
