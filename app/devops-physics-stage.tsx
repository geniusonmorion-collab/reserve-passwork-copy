/* eslint-disable @next/next/no-img-element */

'use client';

import { type ReactNode, useEffect, useRef } from 'react';

import HeroCursorTrail from './hero-cursor-trail';

const LOGOS = [
  {
    id: 'php',
    src: '/assets/devops-php.svg',
    alt: 'PHP',
    width: 198,
    height: 84,
  },
  {
    id: 'mongodb',
    src: '/assets/devops-mongodb.svg',
    alt: 'MongoDB',
    width: 236,
    height: 56,
  },
  {
    id: 'linux',
    src: '/assets/devops-linux.svg',
    alt: 'Linux',
    width: 129,
    height: 129,
  },
  {
    id: 'pangolin',
    src: '/assets/devops-pangolin.svg',
    alt: 'Pangolin DB',
    width: 322,
    height: 72,
  },
  {
    id: 'docker',
    src: '/assets/devops-docker.svg',
    alt: 'Docker',
    width: 103,
    height: 90,
  },
  {
    id: 'postgresql',
    src: '/assets/devops-platform-b.svg',
    alt: 'PostgreSQL',
    width: 218,
    height: 39,
  },
] as const;

const REFERENCE_STAGE_WIDTH = 1545;
const SPRING_STRENGTH = 0.72;
const AIR_DAMPING = 1.15;
const RESTITUTION = 0.74;
const SOLVER_ITERATIONS = 4;

type Body = {
  element: HTMLElement;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  inverseMass: number;
};

type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PointerSample = {
  x: number;
  y: number;
  time: number;
};

type PendingPointerKick = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
};

type DevOpsPhysicsStageProps = {
  children: ReactNode;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function limitVector(x: number, y: number, maximum: number) {
  const length = Math.hypot(x, y);
  if (!length || length <= maximum) return { x, y };
  const scale = maximum / length;
  return { x: x * scale, y: y * scale };
}

function resolveBodyPair(first: Body, second: Body) {
  const overlapX =
    Math.min(first.x + first.width, second.x + second.width) -
    Math.max(first.x, second.x);
  const overlapY =
    Math.min(first.y + first.height, second.y + second.height) -
    Math.max(first.y, second.y);

  if (overlapX <= 0 || overlapY <= 0) return;

  const inverseMassTotal = first.inverseMass + second.inverseMass;
  if (!inverseMassTotal) return;

  let normalX = 0;
  let normalY = 0;
  let penetration = 0;

  if (overlapX < overlapY) {
    normalX =
      first.x + first.width / 2 < second.x + second.width / 2 ? 1 : -1;
    penetration = overlapX;
  } else {
    normalY =
      first.y + first.height / 2 < second.y + second.height / 2 ? 1 : -1;
    penetration = overlapY;
  }

  const firstShare = first.inverseMass / inverseMassTotal;
  const secondShare = second.inverseMass / inverseMassTotal;
  first.x -= normalX * penetration * firstShare;
  first.y -= normalY * penetration * firstShare;
  second.x += normalX * penetration * secondShare;
  second.y += normalY * penetration * secondShare;

  const relativeVelocity =
    (second.velocityX - first.velocityX) * normalX +
    (second.velocityY - first.velocityY) * normalY;
  if (relativeVelocity >= 0) return;

  const impulse =
    (-(1 + RESTITUTION) * relativeVelocity) / inverseMassTotal;
  first.velocityX -= impulse * normalX * first.inverseMass;
  first.velocityY -= impulse * normalY * first.inverseMass;
  second.velocityX += impulse * normalX * second.inverseMass;
  second.velocityY += impulse * normalY * second.inverseMass;
}

function resolveStaticObstacle(body: Body, obstacle: Rectangle) {
  const overlapX =
    Math.min(body.x + body.width, obstacle.x + obstacle.width) -
    Math.max(body.x, obstacle.x);
  const overlapY =
    Math.min(body.y + body.height, obstacle.y + obstacle.height) -
    Math.max(body.y, obstacle.y);

  if (overlapX <= 0 || overlapY <= 0) return;

  let normalX = 0;
  let normalY = 0;
  let penetration = 0;

  if (overlapX < overlapY) {
    normalX =
      body.x + body.width / 2 < obstacle.x + obstacle.width / 2 ? -1 : 1;
    penetration = overlapX;
  } else {
    normalY =
      body.y + body.height / 2 < obstacle.y + obstacle.height / 2 ? -1 : 1;
    penetration = overlapY;
  }

  body.x += normalX * penetration;
  body.y += normalY * penetration;

  const normalVelocity =
    body.velocityX * normalX + body.velocityY * normalY;
  if (normalVelocity < 0) {
    body.velocityX -= (1 + RESTITUTION) * normalVelocity * normalX;
    body.velocityY -= (1 + RESTITUTION) * normalVelocity * normalY;
  }
}

function resolveStageBounds(body: Body, width: number, height: number) {
  if (body.x < 0) {
    body.x = 0;
    if (body.velocityX < 0) body.velocityX *= -RESTITUTION;
  } else if (body.x + body.width > width) {
    body.x = width - body.width;
    if (body.velocityX > 0) body.velocityX *= -RESTITUTION;
  }

  if (body.y < 0) {
    body.y = 0;
    if (body.velocityY < 0) body.velocityY *= -RESTITUTION;
  } else if (body.y + body.height > height) {
    body.y = height - body.height;
    if (body.velocityY > 0) body.velocityY *= -RESTITUTION;
  }
}

export default function DevOpsPhysicsStage({
  children,
}: DevOpsPhysicsStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia(
      '(any-hover: hover) and (any-pointer: fine)',
    );
    const mobile = window.matchMedia('(max-width: 720px)');

    let bodies: Body[] = [];
    let obstacle: Rectangle | null = null;
    let stageWidth = 0;
    let stageHeight = 0;
    let animationFrame = 0;
    let lastFrameTime = 0;
    let lastPointer: PointerSample | null = null;
    let pendingPointerKick: PendingPointerKick | null = null;
    let observedTerminal: HTMLElement | null = null;
    let inView = true;
    let disposed = false;

    const isEnabled = () =>
      !disposed &&
      inView &&
      !document.hidden &&
      !reducedMotion.matches &&
      finePointer.matches &&
      !mobile.matches;

    const renderBodies = () => {
      bodies.forEach((body) => {
        body.element.style.setProperty(
          '--devops-physics-x',
          `${body.x - body.homeX}px`,
        );
        body.element.style.setProperty(
          '--devops-physics-y',
          `${body.y - body.homeY}px`,
        );
      });
    };

    const resetBodies = () => {
      bodies.forEach((body) => {
        body.x = body.homeX;
        body.y = body.homeY;
        body.velocityX = 0;
        body.velocityY = 0;
        body.element.style.removeProperty('--devops-physics-x');
        body.element.style.removeProperty('--devops-physics-y');
      });
      lastPointer = null;
      pendingPointerKick = null;
      lastFrameTime = 0;
      delete stage.dataset.physicsActive;
    };

    const measure = () => {
      const elements = Array.from(
        stage.querySelectorAll<HTMLElement>('[data-devops-body]'),
      );
      elements.forEach((element) => {
        element.style.removeProperty('--devops-physics-x');
        element.style.removeProperty('--devops-physics-y');
      });

      stageWidth = stage.clientWidth;
      stageHeight = stage.clientHeight;
      bodies = elements.map((element) => {
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const mass = clamp(Math.sqrt(width * height) / 90, 0.8, 2.4);

        return {
          element,
          homeX: element.offsetLeft,
          homeY: element.offsetTop,
          x: element.offsetLeft,
          y: element.offsetTop,
          width,
          height,
          velocityX: 0,
          velocityY: 0,
          inverseMass: 1 / mass,
        };
      });

      const terminal = stage.querySelector<HTMLElement>('.terminal-demo');
      if (observedTerminal && observedTerminal !== terminal) {
        resizeObserver.unobserve(observedTerminal);
        observedTerminal = null;
      }
      if (terminal && observedTerminal !== terminal) {
        resizeObserver.observe(terminal);
        observedTerminal = terminal;
      }
      obstacle = terminal
        ? {
            x: terminal.offsetLeft - 4,
            y: terminal.offsetTop - 4,
            width: terminal.offsetWidth + 8,
            height: terminal.offsetHeight + 8,
          }
        : null;

      lastPointer = null;
      lastFrameTime = 0;
      renderBodies();
    };

    const simulationIsActive = () =>
      bodies.some((body) => {
        const displacement = Math.hypot(
          body.x - body.homeX,
          body.y - body.homeY,
        );
        const speed = Math.hypot(body.velocityX, body.velocityY);
        return displacement > 0.35 || speed > 0.35;
      });

    const stepSimulation = (deltaSeconds: number) => {
      const substeps = 3;
      const step = deltaSeconds / substeps;
      const scale = stageWidth / REFERENCE_STAGE_WIDTH;
      const maximumSpeed = Math.max(220, 680 * scale);

      for (let substep = 0; substep < substeps; substep += 1) {
        const damping = Math.exp(-AIR_DAMPING * step);

        bodies.forEach((body) => {
          body.velocityX += (body.homeX - body.x) * SPRING_STRENGTH * step;
          body.velocityY += (body.homeY - body.y) * SPRING_STRENGTH * step;
          body.velocityX *= damping;
          body.velocityY *= damping;

          const limited = limitVector(
            body.velocityX,
            body.velocityY,
            maximumSpeed,
          );
          body.velocityX = limited.x;
          body.velocityY = limited.y;
          body.x += body.velocityX * step;
          body.y += body.velocityY * step;
        });

        for (
          let iteration = 0;
          iteration < SOLVER_ITERATIONS;
          iteration += 1
        ) {
          for (let first = 0; first < bodies.length; first += 1) {
            for (let second = first + 1; second < bodies.length; second += 1) {
              resolveBodyPair(bodies[first], bodies[second]);
            }
          }

          bodies.forEach((body) => {
            if (obstacle) resolveStaticObstacle(body, obstacle);
            resolveStageBounds(body, stageWidth, stageHeight);
          });
        }
      }

      bodies.forEach((body) => {
        const displacement = Math.hypot(
          body.x - body.homeX,
          body.y - body.homeY,
        );
        const speed = Math.hypot(body.velocityX, body.velocityY);
        if (displacement < 0.35 && speed < 1.1) {
          body.x = body.homeX;
          body.y = body.homeY;
          body.velocityX = 0;
          body.velocityY = 0;
        }
      });
    };

    const schedule = () => {
      if (animationFrame || !isEnabled()) return;
      stage.dataset.physicsActive = 'true';
      animationFrame = requestAnimationFrame(draw);
    };

    function draw(now: number) {
      animationFrame = 0;
      if (!isEnabled()) return;

      const deltaSeconds = lastFrameTime
        ? Math.min((now - lastFrameTime) / 1000, 1 / 30)
        : 1 / 60;
      lastFrameTime = now;

      const pointerKick = pendingPointerKick;
      pendingPointerKick = null;
      if (pointerKick) {
        applyPointerKick(
          pointerKick.x,
          pointerKick.y,
          pointerKick.velocityX,
          pointerKick.velocityY,
        );
      }

      stepSimulation(deltaSeconds);
      renderBodies();

      if (simulationIsActive()) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        lastFrameTime = 0;
        delete stage!.dataset.physicsActive;
      }
    }

    const applyPointerKick = (
      pointerX: number,
      pointerY: number,
      pointerVelocityX: number,
      pointerVelocityY: number,
    ) => {
      const scale = stageWidth / REFERENCE_STAGE_WIDTH;
      const pointerRadius = clamp(stageWidth * 0.03, 24, 48);
      const pointerSpeed = limitVector(
        pointerVelocityX,
        pointerVelocityY,
        1600,
      );
      bodies.forEach((body) => {
        const closestX = clamp(pointerX, body.x, body.x + body.width);
        const closestY = clamp(pointerY, body.y, body.y + body.height);
        const deltaX = closestX - pointerX;
        const deltaY = closestY - pointerY;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > pointerRadius) return;

        let normalX = 0;
        let normalY = 0;
        if (distance > 0.001) {
          normalX = deltaX / distance;
          normalY = deltaY / distance;
        } else {
          const centerX = body.x + body.width / 2;
          const centerY = body.y + body.height / 2;
          const centerDistance = Math.hypot(centerX - pointerX, centerY - pointerY);
          if (centerDistance > 0.001) {
            normalX = (centerX - pointerX) / centerDistance;
            normalY = (centerY - pointerY) / centerDistance;
          } else {
            const speed = Math.hypot(pointerSpeed.x, pointerSpeed.y) || 1;
            normalX = pointerSpeed.x / speed;
            normalY = pointerSpeed.y / speed;
          }
        }

        const influence = 1 - distance / pointerRadius;
        const radialImpulse = 230 * scale * influence;
        body.velocityX +=
          (pointerSpeed.x * 0.34 * influence + normalX * radialImpulse) *
          body.inverseMass;
        body.velocityY +=
          (pointerSpeed.y * 0.34 * influence + normalY * radialImpulse) *
          body.inverseMass;

      });
    };

    const pointerCoordinates = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      return {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isEnabled() || (event.pointerType && event.pointerType !== 'mouse')) {
        return;
      }

      const point = pointerCoordinates(event);
      const now = performance.now();
      const previous = lastPointer;
      lastPointer = { ...point, time: now };
      if (!previous || now - previous.time > 140) return;

      const elapsedSeconds = Math.max((now - previous.time) / 1000, 1 / 120);
      const velocityX = (point.x - previous.x) / elapsedSeconds;
      const velocityY = (point.y - previous.y) / elapsedSeconds;
      if (Math.hypot(velocityX, velocityY) < 30) return;

      pendingPointerKick = {
        x: point.x,
        y: point.y,
        velocityX,
        velocityY,
      };
      schedule();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!isEnabled() || (event.pointerType && event.pointerType !== 'mouse')) {
        return;
      }
      if (!event.isPrimary || event.button !== 0) return;

      const point = pointerCoordinates(event);
      const scale = stageWidth / REFERENCE_STAGE_WIDTH;
      const radius = clamp(210 * scale, 92, 210);
      let kicked = false;

      bodies.forEach((body) => {
        const centerX = body.x + body.width / 2;
        const centerY = body.y + body.height / 2;
        const deltaX = centerX - point.x;
        const deltaY = centerY - point.y;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance > radius) return;

        const influence = 1 - distance / radius;
        const impulse = 460 * scale * influence * body.inverseMass;
        const normalX = distance > 0.001 ? deltaX / distance : 1;
        const normalY = distance > 0.001 ? deltaY / distance : 0;
        body.velocityX += normalX * impulse;
        body.velocityY += normalY * impulse;
        kicked = true;
      });

      if (kicked) schedule();
    };

    const handlePointerLeave = () => {
      lastPointer = null;
      pendingPointerKick = null;
    };

    const handlePreferenceChange = () => {
      if (!isEnabled()) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        resetBodies();
      } else if (simulationIsActive()) {
        schedule();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        lastFrameTime = 0;
        delete stage.dataset.physicsActive;
      } else if (simulationIsActive()) {
        schedule();
      }
    };

    let resizeFrame = requestAnimationFrame(measure);
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      resizeFrame = requestAnimationFrame(measure);
    });
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        if (!inView) {
          if (animationFrame) cancelAnimationFrame(animationFrame);
          animationFrame = 0;
          lastFrameTime = 0;
          lastPointer = null;
          pendingPointerKick = null;
          delete stage.dataset.physicsActive;
        } else if (simulationIsActive()) {
          schedule();
        }
      },
      { rootMargin: '120px 0px' },
    );

    resizeObserver.observe(stage);
    intersectionObserver.observe(stage);
    stage.addEventListener('pointermove', handlePointerMove, { passive: true });
    stage.addEventListener('pointerdown', handlePointerDown, { passive: true });
    stage.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    reducedMotion.addEventListener('change', handlePreferenceChange);
    finePointer.addEventListener('change', handlePreferenceChange);
    mobile.addEventListener('change', handlePreferenceChange);

    return () => {
      disposed = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerdown', handlePointerDown);
      stage.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reducedMotion.removeEventListener('change', handlePreferenceChange);
      finePointer.removeEventListener('change', handlePreferenceChange);
      mobile.removeEventListener('change', handlePreferenceChange);
      resetBodies();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="devops-stage"
      aria-describedby="devops-stage-instructions"
    >
      <span id="devops-stage-instructions" className="sr-only">
        Проведите мышью рядом с логотипами, чтобы толкнуть их внутри сцены.
      </span>
      <HeroCursorTrail variant="stage" />

      {LOGOS.map((logo) => (
        <span
          className={`devops-body devops-body--${logo.id}`}
          data-devops-body
          key={logo.id}
        >
          <img
            className="devops-logo"
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            draggable={false}
          />
        </span>
      ))}

      {children}
    </div>
  );
}
