"use client";

// Dust text reveal, adapted from an Originkit/Framer component for plain
// React: particles sample the rendered glyphs off an offscreen canvas draw,
// then drift as noise until scrolled into view, when they converge into the
// word and hand off to a real (selectable) text node.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, type MotionValue } from "framer-motion";

type Tag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
type PlayMode = "hover" | "enter";
type EaseName = "linear" | "easeIn" | "easeOut" | "easeInOut";
type Ease = EaseName | [number, number, number, number];

type Particle = {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  color: string;
  opacity: number;
  sparkleOp: number;
  originalAlpha: number;
  floatingSpeed: number;
  floatingAngle: number;
  targetOpacity: number;
  sparkleSpeed: number;
  // Per-particle drift multiplier so the dispersed cloud has a soft, uneven
  // edge instead of every particle expanding the same amount (which reads as
  // a hard rectangle matching the sampled text's bounding box).
  radiusMult: number;
};

// Density slider (1..10) -> particle sampling multiplier (lower = denser).
const DENSITY_MAP = [6, 5.4, 4.9, 4.3, 3.8, 3.2, 2.7, 2.1, 1.6, 1];

const NAMED_EASES: Record<EaseName, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
};

function cubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (p: number) => {
    let t = p;
    for (let i = 0; i < 8; i++) {
      const x = sampleX(t) - p;
      const dd = dX(t);
      if (Math.abs(x) < 1e-4 || Math.abs(dd) < 1e-6) break;
      t -= x / dd;
    }
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return sampleY(t);
  };
}

function easeToFn(ease?: Ease) {
  const b = Array.isArray(ease) && ease.length === 4 ? ease : NAMED_EASES[(ease as EaseName) ?? "easeInOut"] ?? NAMED_EASES.easeInOut;
  return cubicBezierEase(b[0], b[1], b[2], b[3]);
}

// Hand-off points on the form timeline (p). The real text fades in from
// TEXT_IN and is fully opaque by FADE_OUT; the particles only start leaving
// at FADE_OUT — both draw the same glyphs in the same color, so the overlap
// is invisible.
const TEXT_IN = 0.7;
const FADE_OUT = 0.85;

function createParticles(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string,
  font: string,
  color: string,
  letterSpacing: string,
  densityMult: number
): Particle[] {
  const particles: Particle[] = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.letterSpacing = letterSpacing;
  ctx.textBaseline = "middle";
  ctx.imageSmoothingEnabled = true;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const currentDPR = canvas.width / parseInt(canvas.style.width || `${canvas.width}`, 10);
  const baseSampleRate = Math.max(2, Math.round(currentDPR));
  const sampleRate = Math.max(1, Math.round(baseSampleRate * densityMult));

  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 0) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const spreadRadius = Math.max(maxX - minX, maxY - minY) * 0.1;

  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const index = (y * canvas.width + x) * 4;
      const alpha = data[index + 3];
      if (alpha > 0) {
        const originalAlpha = alpha / 255;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * spreadRadius;
        particles.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          originalX: x,
          originalY: y,
          color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${originalAlpha})`,
          opacity: originalAlpha * 0.3,
          sparkleOp: originalAlpha * 0.3,
          originalAlpha,
          floatingSpeed: Math.random() * 2 + 1,
          floatingAngle: Math.random() * Math.PI * 2,
          targetOpacity: Math.random() * originalAlpha * 0.5,
          sparkleSpeed: Math.random() * 2 + 1,
          // Skewed toward small values (squared) so most particles drift a
          // modest amount and a minority drift much further — a soft,
          // wispy edge rather than every particle hitting the same radius.
          radiusMult: 0.25 + Math.pow(Math.random(), 2) * 2.1,
        });
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return particles;
}

function updateParticles(
  particles: Particle[],
  deltaTime: number,
  p: number,
  noise: number,
  speed: number,
  showTextRef: { current: boolean },
  setShowText: (v: boolean) => void
) {
  const FLOAT_RADIUS = noise;
  const NOISE_SCALE = 0.6;
  const CHAOS_FACTOR = 1.3;
  const time = Date.now() * 0.001;
  const inv = 1 - p;

  particles.forEach((particle) => {
    particle.floatingAngle += deltaTime * particle.floatingSpeed * (1 + Math.random() * CHAOS_FACTOR);
    const uniqueOffset = particle.floatingSpeed * 2e3;
    const noiseX =
      (Math.sin(time * particle.floatingSpeed + particle.floatingAngle) * 1.2 +
        Math.sin((time + uniqueOffset) * 0.5) * 0.8 +
        (Math.random() - 0.5) * CHAOS_FACTOR) *
      NOISE_SCALE;
    const noiseY =
      (Math.cos(time * particle.floatingSpeed + particle.floatingAngle * 1.5) * 0.6 +
        Math.cos((time + uniqueOffset) * 0.5) * 0.4 +
        (Math.random() - 0.5) * CHAOS_FACTOR) *
      NOISE_SCALE;
    const floatX = particle.originalX + FLOAT_RADIUS * particle.radiusMult * noiseX;
    const floatY = particle.originalY + FLOAT_RADIUS * particle.radiusMult * noiseY;
    const targetX = floatX + (particle.originalX - floatX) * p;
    const targetY = floatY + (particle.originalY - floatY) * p;
    const dx = targetX - particle.x;
    const dy = targetY - particle.y;
    const follow = 6 + p * 10;
    const jitterX = (Math.random() - 0.5) * speed * inv;
    const jitterY = (Math.random() - 0.5) * speed * inv;
    particle.x += dx * follow * deltaTime + jitterX;
    particle.y += dy * follow * deltaTime + jitterY;
    if (p >= 0.999) {
      particle.x = particle.originalX;
      particle.y = particle.originalY;
    }

    const opacityDiff = particle.targetOpacity - particle.sparkleOp;
    particle.sparkleOp += opacityDiff * particle.sparkleSpeed * deltaTime * 3;
    if (Math.abs(opacityDiff) < 0.01) {
      particle.targetOpacity =
        Math.random() < 0.5 ? Math.random() * 0.1 * particle.originalAlpha : particle.originalAlpha * 3;
      particle.sparkleSpeed = Math.random() * 3 + 1;
    }
    const idleOp = Math.max(0, Math.min(particle.originalAlpha, particle.sparkleOp));
    const formFade = p < FADE_OUT ? 1 : Math.max(0, 1 - (p - FADE_OUT) / (1 - FADE_OUT));
    particle.opacity = (idleOp + (particle.originalAlpha - idleOp) * p) * formFade;
  });

  const formed = p > TEXT_IN;
  if (formed !== showTextRef.current) {
    showTextRef.current = formed;
    setShowText(formed);
  }
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[], dpr: number) {
  ctx.save();
  ctx.scale(dpr, dpr);
  const byColor = new Map<string, { x: number; y: number }[]>();
  particles.forEach((particle) => {
    if (particle.opacity <= 0) return;
    const color = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
    if (!byColor.has(color)) byColor.set(color, []);
    byColor.get(color)!.push({ x: particle.x / dpr, y: particle.y / dpr });
  });
  byColor.forEach((positions, color) => {
    ctx.fillStyle = color;
    positions.forEach(({ x, y }) => ctx.fillRect(x, y, 1, 1));
  });
  ctx.restore();
}

type DustTextProps = {
  text: string;
  tag?: Tag;
  className?: string;
  noise?: number;
  density?: number;
  duration?: number;
  ease?: Ease;
  playMode?: PlayMode;
  startAlign?: "top" | "center" | "bottom";
  replay?: boolean;
  resetOnMouseLeave?: boolean;
  // When set, the form/dissolve timeline is driven directly by this value
  // (e.g. a scroll-linked useTransform output, 1 = formed, 0 = dispersed)
  // instead of the internal hover/enter chase — for scroll-scrubbed effects.
  progress?: MotionValue<number>;
};

export function DustText({
  text,
  tag = "span",
  className,
  noise = 100,
  density = 8,
  duration = 1,
  ease = "easeInOut",
  playMode = "enter",
  startAlign = "center",
  replay = true,
  resetOnMouseLeave = true,
  progress,
}: DustTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Untyped: the ref target's element type varies with `tag`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());
  const formProgressRef = useRef(0);
  const showTextRef = useRef(false);

  const [fontReady, setFontReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [entered, setEntered] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [showText, setShowText] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const active = playMode === "enter" ? entered : isHovered;
  const densityMult = DENSITY_MAP[Math.max(1, Math.min(10, Math.round(density))) - 1];
  const derivedSpeed = Math.min(3, Math.max(0.1, 0.5 / Math.max(0.1, duration)));
  const easeFn = useMemo(() => easeToFn(ease), [ease]);
  const isInView = useInView(wrapperRef);
  const dpr = useMemo(() => (typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio * 1.5 || 1) : 1), []);

  useEffect(() => {
    document.fonts.ready.then(() => setFontReady(true));
  }, []);

  const readFontSpec = useCallback(() => {
    const el = textRef.current;
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      font: `${cs.fontWeight} ${parseFloat(cs.fontSize) * dpr}px ${cs.fontFamily}`,
      color: cs.color,
      letterSpacing: cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing,
    };
  }, [dpr]);

  const buildParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const spec = readFontSpec();
    if (!canvas || !wrapper || !spec || !size.width || !size.height) return;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    particlesRef.current = createParticles(ctx, canvas, text, spec.font, spec.color, spec.letterSpacing, densityMult);
    renderParticles(ctx, particlesRef.current, dpr);
  }, [text, densityMult, dpr, readFontSpec, size]);

  // Measure wrapper size (drives canvas resolution + particle field bounds).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!fontReady) return;
    buildParticles();
  }, [fontReady, buildParticles]);

  // Animation loop.
  useEffect(() => {
    if (!isInView) return;
    const animate = (now: number) => {
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !particlesRef.current.length) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      let p: number;
      if (progress) {
        // Controlled: the caller's motion value (e.g. scroll progress) is the
        // single source of truth, already continuous — no chase/ease needed.
        p = Math.min(1, Math.max(0, progress.get()));
        formProgressRef.current = p;
      } else {
        const target = active ? 1 : 0;
        const rate = deltaTime / Math.max(0.05, duration);
        const cur = formProgressRef.current;
        formProgressRef.current = cur < target ? Math.min(target, cur + rate) : Math.max(target, cur - rate);
        p = easeFn(formProgressRef.current);
      }
      updateParticles(particlesRef.current, deltaTime, p, noise, derivedSpeed, showTextRef, setShowText);
      renderParticles(ctx, particlesRef.current, dpr);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isInView, active, duration, easeFn, noise, derivedSpeed, dpr, progress]);

  // Scroll-triggered reveal (ignored when `progress` drives the timeline directly).
  useEffect(() => {
    if (progress || playMode !== "enter") return;
    const el = wrapperRef.current;
    if (!el) return;
    setEntered(false);
    let has = false;
    const threshold = startAlign === "top" ? 0 : startAlign === "center" ? 0.5 : 1;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!has) {
            has = true;
            setEntered(true);
            if (!replay) io.disconnect();
          }
        } else if (replay) {
          has = false;
          setEntered(false);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [playMode, startAlign, replay]);

  const handleMouseEnter = useCallback(() => {
    if (playMode !== "hover") return;
    setIsHovered(true);
    setHasBeenShown(true);
  }, [playMode]);
  const handleMouseLeave = useCallback(() => {
    if (playMode !== "hover") return;
    if (resetOnMouseLeave || !hasBeenShown) setIsHovered(false);
  }, [playMode, resetOnMouseLeave, hasBeenShown]);

  const MotionTag = motion[tag];
  const inDuration = duration * (FADE_OUT - TEXT_IN);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MotionTag
        ref={textRef}
        initial="hidden"
        animate={showText ? "visible" : "hidden"}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{
          duration: showText ? inDuration : duration * 0.4,
          type: "tween",
          ease: showText ? "linear" : "easeOut",
        }}
        style={{ margin: 0, userSelect: "text" }}
      >
        {text}
      </MotionTag>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
