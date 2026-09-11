'use client';

/*
 * Движок наведения для иллюстраций карточек применения.
 *
 * Один цикл requestAnimationFrame на сцену, как в `attachBorderGlow`:
 * цели интерполируются экспоненциально каждый кадр, поэтому вход и выход
 * курсора не дают рывка, а сцена продолжает досматриваться после ухода.
 *
 * Сцены не содержат своей логики — движок читает разметку:
 *   [data-depth]         — план: насколько элемент участвует в подъёме
 *   [data-signal]        — путь с pathLength="1", по которому бежит импульс
 *   [data-dash]          — длина штриха слоя импульса в долях пути
 *   [data-start]         — момент старта внутри цикла, в секундах
 *   [data-duration]      — длительность прохода
 *   [data-pulse-target]  — элемент, который вспыхивает, когда импульс доходит
 *
 * Наружу движок отдаёт на сцену `--si-h` (глубина наведения) и `--si-t` (фаза
 * цикла), а на слои импульса — `--si-signal`; остальное считает CSS.
 *
 * Бегущий импульс повторяет идиом `certification-motion`: нормализованный
 * pathLength и сдвиг штриха, а не анимация длины пути.
 */

/*
 * Сглаживание задано временем, а не долей за кадр: фиксированная доля (как .05
 * у подсветки рамки) зависит от частоты кадров — на 120 Гц сходится вдвое
 * быстрее, а на просадке даёт заметный рывок. Здесь шаг считается от delta,
 * поэтому движение одинаково на любом дисплее и переживает пропуск кадров.
 *
 * Постоянная времени: за tau проходится 63 % пути до цели.
 */
const TAU_HOVER = 0.16;
/*
 * Длина хвоста импульса в долях пути. Голова у всех слоёв общая, а назад они
 * тянутся на свою длину — так получается след с затуханием. Импульс уходит
 * за конец пути ровно на самый длинный хвост.
 */
const TRAIL = 0.44;
/** Длина цикла импульсов, секунды. Хвост цикла — пауза перед повтором. */
const CYCLE = 2.8;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function attachSectorHover(scene: HTMLElement, card: HTMLElement) {
  // Тот же гейт, что у вращения иконок: точный курсор и разрешённая анимация.
  const allowed = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  const signals = Array.from(scene.querySelectorAll<SVGPathElement>('[data-signal]'));
  const targets = Array.from(scene.querySelectorAll<HTMLElement>('[data-pulse-target]'));

  let frame = 0;
  let visible = false;
  let previous = 0;
  let elapsed = 0;

  let hoverTarget = 0;
  let hover = 0;

  function paintPulses(time: number, intensity: number) {
    for (const signal of signals) {
      const start = Number(signal.dataset.start ?? 0);
      const duration = Number(signal.dataset.duration ?? 1);
      const dash = Number(signal.dataset.dash ?? 0.16);
      const progress = clamp01((time - start) / duration);
      const inFlight = time >= start && time <= start + duration;
      // Гасим оба конца прохода, чтобы импульс не появлялся и не исчезал резко.
      const fade = inFlight
        ? Math.min(clamp01(progress * 6), clamp01((1 - progress) * 6))
        : 0;
      // Голова одна для всех слоёв; слой тянется назад на свою длину.
      const head = progress * (1 + TRAIL);
      signal.style.strokeDashoffset = String(dash - head);
      signal.style.setProperty('--si-signal', String(fade * intensity));
    }
    for (const target of targets) {
      const start = Number(target.dataset.start ?? 0);
      const span = Number(target.dataset.flash ?? 0.55);
      const progress = clamp01((time - start) / span);
      const flash = time >= start && time <= start + span
        ? Math.sin(progress * Math.PI)
        : 0;
      target.style.setProperty('--si-flash', String(flash * intensity));
    }
  }

  function write() {
    scene.style.setProperty('--si-h', hover.toFixed(4));
    scene.style.setProperty('--si-t', (elapsed / CYCLE).toFixed(4));
  }

  function animate(now: number) {
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now;

    hover += (hoverTarget - hover) * (1 - Math.exp(-delta / TAU_HOVER));

    // Часы импульсов идут, пока сцена под курсором, и замирают после ухода.
    if (hover > 0.01) elapsed = (elapsed + delta) % CYCLE;
    write();
    paintPulses(elapsed, hover);

    if (hover < 0.001 && hoverTarget === 0) {
      // Пришли в покой: снимаем нагрузку до следующего наведения.
      stop();
      rest();
      return;
    }
    frame = requestAnimationFrame(animate);
  }

  function start() {
    if (frame || !visible || document.hidden) return;
    previous = 0;
    frame = requestAnimationFrame(animate);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  /** Полный покой: сцена в исходном положении, импульсы погашены. */
  function rest() {
    hover = 0;
    elapsed = 0;
    write();
    paintPulses(0, 0);
  }

  function enter() {
    hoverTarget = 1;
    // Цикл всегда начинается с нуля, даже если курсор вернулся сразу: иначе
    // сцена подхватывает середину прошлой последовательности и читается как
    // случайная. Одно наведение — один и тот же рассказ от начала.
    elapsed = 0;
    start();
  }

  function leave() {
    hoverTarget = 0;
    start();
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) {
      hoverTarget = 0;
      stop();
      rest();
    } else if (hoverTarget) start();
  }, { threshold: 0 });

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (hoverTarget) start();
  };

  function bind() {
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(card);
  }

  function unbind() {
    card.removeEventListener('pointerenter', enter);
    card.removeEventListener('pointerleave', leave);
    card.removeEventListener('pointercancel', leave);
    document.removeEventListener('visibilitychange', onVisibility);
    observer.disconnect();
    hoverTarget = 0;
    stop();
    rest();
  }

  // Смена условий на ходу: подключаем или снимаем эффект, не перезагружая страницу.
  const sync = () => (allowed.matches ? bind() : unbind());
  allowed.addEventListener('change', sync);
  rest();
  if (allowed.matches) bind();

  return () => {
    allowed.removeEventListener('change', sync);
    unbind();
  };
}
