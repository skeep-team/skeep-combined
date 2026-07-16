"use client";

// Flashlight/spotlight text reveal, adapted from an Originkit/Framer
// component: a dim base layer sits under a bright layer whose visibility is
// clipped to a soft circle that follows the cursor, like sweeping a torch
// across text in the dark.
import { useEffect, useRef } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, type Transition } from "framer-motion";

type FlashlightTextProps = {
  text: string;
  brightColor?: string;
  dimColor?: string;
  maskSize?: number;
  intensity?: number;
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
};

export function FlashlightText({
  text,
  brightColor = "#ffffff",
  dimColor = "#000000",
  maskSize = 150,
  intensity = 10,
  transition = { type: "tween", duration: 0.3, ease: "easeInOut" },
  className,
  style,
}: FlashlightTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const interactive = !prefersReducedMotion;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const maskX = useMotionValue(0);
  const maskY = useMotionValue(0);
  const maskSizeMV = useMotionValue(0);

  // Intensity 10-100 = the solid core %. 100 -> fully solid disc; 10 -> a
  // small solid center with a long fade out to the edge.
  const core = Math.max(10, Math.min(100, intensity));
  const maskImage = useMotionTemplate`radial-gradient(circle ${maskSizeMV}px at ${maskX}px ${maskY}px, black, black ${core}%, transparent 100%)`;

  useEffect(() => {
    if (!interactive) return;
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = (contentRef.current ?? el).getBoundingClientRect();
      maskX.set(e.clientX - rect.left);
      maskY.set(e.clientY - rect.top);
    };
    const onEnter = () => {
      animate(maskSizeMV, maskSize, transition);
    };
    const onLeave = () => {
      animate(maskSizeMV, 0, transition);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [interactive, maskSize, transition, maskX, maskY, maskSizeMV]);

  // Reduced-motion: show the spotlight centered and open, no cursor tracking.
  useEffect(() => {
    if (interactive) return;
    const el = contentRef.current;
    const w = el?.clientWidth ?? 720;
    const h = el?.clientHeight ?? 240;
    maskX.set(w / 2);
    maskY.set(h / 2);
    maskSizeMV.set(maskSize);
  }, [interactive, maskSize, maskX, maskY, maskSizeMV]);

  const textTypography: React.CSSProperties = {
    margin: 0,
    boxSizing: "border-box",
    width: "100%",
    whiteSpace: "pre-wrap",
    wordBreak: "keep-all",
    userSelect: "none",
  };

  const rootStyle: React.CSSProperties = {
    ...style,
    position: "relative",
    boxSizing: "border-box",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    cursor: interactive ? "none" : undefined,
  };

  return (
    <div ref={containerRef} className={className} style={rootStyle}>
      <div ref={contentRef} style={{ position: "relative", width: "100%" }}>
        {/* BASE layer: dim text, always visible. */}
        <p aria-label={text} style={{ ...textTypography, position: "relative", color: dimColor }}>
          {text}
        </p>

        {/* OVERLAY layer: bright text, revealed only inside the cursor spotlight. */}
        <motion.p
          aria-hidden
          style={{
            ...textTypography,
            position: "absolute",
            top: 0,
            left: 0,
            color: brightColor,
            pointerEvents: "none",
            WebkitMaskImage: maskImage,
            maskImage,
            WebkitMaskSize: "100%",
            maskSize: "100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          {text}
        </motion.p>
      </div>
    </div>
  );
}
