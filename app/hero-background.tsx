'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react';

const SCENE_LOOP_SECONDS = 16;

const VERTEX_SHADER = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uMotion;

float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

  float z0 = mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y);
  float z1 = mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y);
  return mix(z0, z1, f.z);
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.62;
  mat3 turn = mat3(
     0.00,  0.80,  0.60,
    -0.80,  0.36, -0.48,
    -0.60, -0.48,  0.64
  );

  for (int octave = 0; octave < 2; octave++) {
    value += amplitude * noise3(p);
    p = turn * p * 2.01 + vec3(1.7, 9.2, 2.4);
    amplitude *= 0.50;
  }

  return value;
}

float densityAt(vec3 p, vec3 flow, float cycle, float motion) {
  vec3 q = p * 0.80 + flow * motion;
  q.xy += motion * vec2(
    0.42 * sin(q.z * 1.08 + cycle * 2.0),
    0.30 * cos(q.z * 0.82 - cycle * 3.0)
  );

  float cloud = fbm(q);
  float billow = 1.0 - abs(2.0 * cloud - 1.0);
  cloud = mix(cloud, billow, 0.28);

  vec2 volumeCenter = vec2(
    0.14 * sin(cycle + 0.7) * motion,
    -0.34 + 0.07 * cos(cycle * 2.0) * motion
  );
  vec2 volumeShape = (p.xy - volumeCenter) * vec2(0.62, 0.86);
  float envelope = 1.0 - smoothstep(1.14, 3.18, length(volumeShape));
  return smoothstep(0.39, 0.64, cloud) * envelope;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;

  float lower = 1.0 - smoothstep(0.10, 0.96, uv.y);
  vec3 topNavy = vec3(0.004, 0.020, 0.058);
  vec3 deepBlue = vec3(0.006, 0.095, 0.285);
  vec3 cobalt = vec3(0.040, 0.250, 0.650);
  vec3 electric = vec3(0.105, 0.405, 0.930);
  vec3 sky = vec3(0.330, 0.610, 0.960);

  float cycle = uTime * 0.392699082;
  vec3 flow = vec3(
    1.12 * cos(cycle) + 0.30 * cos(cycle * 2.0 + 1.1),
    0.62 * sin(cycle) + 0.18 * sin(cycle * 3.0 + 0.6),
    0.90 * sin(cycle + 0.4) + 0.24 * cos(cycle * 2.0)
  );

  vec3 color = mix(topNavy, deepBlue, smoothstep(0.02, 0.72, lower));
  color = mix(color, cobalt, smoothstep(0.38, 1.0, lower) * 0.54);

  vec2 lightDrift = uMotion * vec2(
    0.36 * sin(cycle) + 0.10 * sin(cycle * 3.0),
    0.060 * cos(cycle * 2.0)
  );
  float horizonX = p.x - lightDrift.x;
  float wideHorizon = exp(
    -5.2 * pow(abs(uv.y - (0.23 + lightDrift.y)), 2.0)
  ) * exp(-0.16 * horizonX * horizonX);
  float centerX = p.x + lightDrift.x * 0.72;
  float centerBloom = exp(
    -14.0 * pow(abs(uv.y - (0.17 - lightDrift.y * 0.55)), 2.0)
  ) * exp(-0.54 * centerX * centerX);
  float breathing = 0.80 + 0.20 * sin(cycle * 2.0 + 0.35);
  color += electric * wideHorizon * 0.29 * breathing;
  color += sky * centerBloom * 0.14 * (1.95 - breathing);

  vec3 rayOrigin = vec3(
    0.40 * sin(cycle) * uMotion,
    -0.22 + 0.14 * cos(cycle * 2.0) * uMotion,
    -3.08 + 0.17 * sin(cycle * 2.0 + 0.7) * uMotion
  );
  vec3 target = vec3(
    0.20 * sin(cycle * 2.0 + 1.2) * uMotion,
    -0.10 + 0.095 * cos(cycle * 3.0) * uMotion,
    0.58
  );
  vec3 forward = normalize(target - rayOrigin);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  vec3 rayDirection = normalize(
    forward + right * p.x * 0.58 + up * p.y * 0.49
  );

  float copyQuietZone = 1.0 - 0.48 * exp(
    -pow(abs((uv.x - 0.5) / 0.36), 4.0)
    -pow(abs((uv.y - 0.71) / 0.15), 4.0)
  );
  float headerQuietZone = mix(
    0.28,
    1.0,
    1.0 - smoothstep(0.70, 0.88, uv.y)
  );
  float screenDensity = mix(0.42, 1.0, smoothstep(0.44, 0.59, uv.y));
  float densityMask = copyQuietZone * headerQuietZone * screenDensity;

  float jitter = hash31(vec3(gl_FragCoord.xy, 0.0));
  float travel = 0.66 + jitter * 0.035;
  float transmittance = 1.0;
  vec3 scattering = vec3(0.0);
  float previousDensity = 0.0;
  const float stepLength = 0.26;

  vec3 lightOne = vec3(
    1.28 * sin(cycle),
    -0.40 + 0.32 * cos(cycle * 2.0),
    -1.08 + 0.48 * cos(cycle)
  );
  vec3 lightTwo = vec3(
    -1.38 * sin(cycle + 0.9),
    -0.12 + 0.34 * sin(cycle * 2.0 + 0.4),
    -0.45 + 0.40 * sin(cycle * 3.0)
  );

  for (int stepIndex = 0; stepIndex < 12; stepIndex++) {
    vec3 samplePosition = rayOrigin + rayDirection * travel;
    float density = densityAt(samplePosition, flow, cycle, uMotion);
    density *= mix(0.22, 1.0, lower);
    density *= densityMask;
    density *= smoothstep(0.64, 1.03, travel);
    density *= 1.0 - smoothstep(3.18, 3.82, travel);

    vec3 toLightOne = (samplePosition - lightOne) * vec3(0.64, 0.92, 0.82);
    vec3 toLightTwo = (samplePosition - lightTwo) * vec3(0.70, 0.88, 0.90);
    float rawMovingLight = exp(-dot(toLightOne, toLightOne) * 0.58)
      + 0.84 * exp(-dot(toLightTwo, toLightTwo) * 0.66);
    float movingLight = smoothstep(0.06, 1.25, rawMovingLight);
    float frontEdge = clamp(
      (density - previousDensity) * 3.0 + 0.54,
      0.28,
      1.12
    );

    float depthLight = float(stepIndex) / 11.0;
    float brightness = smoothstep(
      0.14,
      0.92,
      density * 1.18 + depthLight * 0.20 + movingLight * 0.76
    );
    vec3 localColor = mix(deepBlue, electric, brightness);
    localColor = mix(localColor, sky, centerBloom * 0.17);
    localColor *= 0.66 + 0.52 * frontEdge;

    float sampleAlpha = 1.0 - exp(
      -density * stepLength * (1.55 + movingLight * 0.38)
    );
    scattering += transmittance * localColor * sampleAlpha;
    transmittance *= 1.0 - sampleAlpha * 0.82;
    previousDensity = density;
    travel += stepLength;
  }

  color = color * mix(0.66, 1.0, transmittance) + scattering * 1.20;

  float vignette = 1.0 - smoothstep(
    0.30,
    1.68,
    length(p * vec2(0.54, 0.82))
  );
  color *= 0.78 + vignette * 0.22;
  color *= mix(0.72, 1.0, 1.0 - smoothstep(0.30, 1.0, uv.y));

  color = 1.0 - exp(-color * 1.10);
  color = pow(color, vec3(0.94));
  gl_FragColor = vec4(color, 1.0);
}
`;

type RenderResources = {
  program: WebGLProgram;
  buffer: WebGLBuffer;
  resolution: WebGLUniformLocation;
  time: WebGLUniformLocation;
  motion: WebGLUniformLocation;
};

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Unable to create WebGL shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Shader compilation failed';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createResources(gl: WebGLRenderingContext): RenderResources {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  let fragment: WebGLShader;

  try {
    fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  } catch {
    fragment = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER.replace('precision highp float;', 'precision mediump float;'),
    );
  }

  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error('Unable to create WebGL program');
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Program link failed';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  const buffer = gl.createBuffer();
  const position = gl.getAttribLocation(program, 'aPosition');
  const resolution = gl.getUniformLocation(program, 'uResolution');
  const time = gl.getUniformLocation(program, 'uTime');
  const motion = gl.getUniformLocation(program, 'uMotion');

  if (!buffer || position < 0 || !resolution || !time || !motion) {
    if (buffer) gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    throw new Error('Unable to initialize WebGL scene');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  gl.useProgram(program);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.BLEND);

  return { program, buffer, resolution, time, motion };
}

function deleteResources(
  gl: WebGLRenderingContext,
  resources: RenderResources | null,
) {
  if (!resources) return;
  gl.deleteBuffer(resources.buffer);
  gl.deleteProgram(resources.program);
}

type HeroBackgroundProps = {
  variant?: 'hero' | 'closing';
};

export default function HeroBackground({
  variant = 'hero',
}: HeroBackgroundProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) return;

    let resources: RenderResources | null = null;

    try {
      resources = createResources(gl);
    } catch {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 720px)');
    let animationFrame = 0;
    let lastTick = 0;
    let nextPaint = 0;
    let phase = 0;
    let inView = true;
    let contextLost = false;
    let needsResize = true;
    let disposed = false;

    const stop = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastTick = 0;
      nextPaint = 0;
    };

    const canRender = () =>
      !disposed && !contextLost && inView && !document.hidden && resources;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return false;

      const dpr = Math.min(window.devicePixelRatio || 1, reducedMotion.matches ? 1 : 1.25);
      let width = Math.max(1, Math.round(bounds.width * dpr));
      let height = Math.max(1, Math.round(bounds.height * dpr));
      const pixelBudget = mobile.matches ? 380_000 : 700_000;
      const budgetScale = Math.min(1, Math.sqrt(pixelBudget / (width * height)));
      const gpuLimit = Math.min(
        gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number,
        gl.getParameter(gl.MAX_VIEWPORT_DIMS)[0] as number,
        gl.getParameter(gl.MAX_VIEWPORT_DIMS)[1] as number,
      );
      const dimensionScale = Math.min(1, gpuLimit / Math.max(width, height));
      const scale = Math.min(budgetScale, dimensionScale);

      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      needsResize = false;
      return true;
    };

    const draw = (now: number) => {
      animationFrame = 0;
      if (!canRender()) return;

      const frameInterval = reducedMotion.matches ? 1000 / 24 : 1000 / 30;
      if (nextPaint && now < nextPaint - 1.5) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      if (!nextPaint) nextPaint = now;
      nextPaint += frameInterval;
      if (now - nextPaint > frameInterval) nextPaint = now + frameInterval;

      const delta = lastTick ? Math.min(now - lastTick, 120) : 0;
      lastTick = now;
      phase =
        (phase + (delta / 1000) * (reducedMotion.matches ? 0.48 : 1)) %
        SCENE_LOOP_SECONDS;

      if (needsResize && !resize()) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      if (!resources) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(resources.program);
      gl.uniform2f(resources.resolution, canvas.width, canvas.height);
      gl.uniform1f(resources.time, phase);
      gl.uniform1f(resources.motion, reducedMotion.matches ? 0.60 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (
        canvas.dataset.ready !== 'true' &&
        gl.getError() === gl.NO_ERROR
      ) {
        canvas.dataset.ready = 'true';
        wrapper.dataset.ready = 'true';
      }

      animationFrame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (animationFrame || !canRender()) return;
      lastTick = performance.now();
      animationFrame = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      needsResize = true;
      start();
    };
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      resources = null;
      delete canvas.dataset.ready;
      delete wrapper.dataset.ready;
      stop();
    };
    const handleContextRestored = () => {
      contextLost = false;
      try {
        resources = createResources(gl);
        needsResize = true;
        start();
      } catch {
        resources = null;
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        if (inView) start();
        else stop();
      },
      { rootMargin: '120px 0px' },
    );
    const resizeObserver = new ResizeObserver(handleResize);

    intersectionObserver.observe(canvas);
    resizeObserver.observe(canvas);
    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    reducedMotion.addEventListener('change', handleResize);
    mobile.addEventListener('change', handleResize);

    start();

    return () => {
      disposed = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      reducedMotion.removeEventListener('change', handleResize);
      mobile.removeEventListener('change', handleResize);
      delete wrapper.dataset.ready;
      if (!contextLost) deleteResources(gl, resources);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`hero-background hero-background--${variant}`}
      aria-hidden="true"
    >
      <img
        className="hero-background__fallback"
        src="/assets/hero-bg.png"
        alt=""
        width="1920"
        height="1259"
      />
      <canvas ref={canvasRef} className="hero-background__canvas" />
    </div>
  );
}
