"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, type Variants } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./SkeepExperience.module.css";

const SNAP_IDLE_DELAY = 140;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LINES = [
  "사용자의 의도를 앞서 읽고",
  "기기의 경계를 넘어",
  "모든 순간을 매끄럽게 연결하는",
];

const STAGES = [
  {
    key: "intent",
    caption: ["사용자의 목적을 정교하게 추론하여,", "늘 준비된 경험을 보장합니다."],
  },
  {
    key: "beyond",
    caption: ["하드웨어와 상관없이,", "사용자만을 위한 SKEEP 경험을 제공합니다."],
  },
  {
    key: "seamless",
    caption: ["매 순간의 경험이 겹쳐져", "다음 사용을 더욱 매끄럽게 연결합니다."],
  },
] as const;

function clampedProgress(start: number, end: number, value: number) {
  if (end === start) return value >= end ? 1 : 0;
  return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

function IntentVisual() {
  return (
    <video
      className={styles.intentVideo}
      src={`${BASE_PATH}/service3/intent-bg.mp4`}
      autoPlay
      muted
      loop
      playsInline
    />
  );
}

function BeyondVisual() {
  return (
    <video
      className={styles.beyondVideo}
      src={`${BASE_PATH}/service3/beyond-bg.mp4`}
      autoPlay
      muted
      loop
      playsInline
    />
  );
}

// The source video is landscape but designed to play rotated 90deg inside
// this landscape box. Swapping the un-rotated element's width/height to the
// box's height/width means the rotation lands it back at the box's own
// footprint, so it fills (and is clipped by) the box instead of leaving
// letterboxing or spilling outside it.
function SeamlessVisual() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    const applySize = () => {
      const { offsetWidth: width, offsetHeight: height } = wrap;
      video.style.width = `${height}px`;
      video.style.height = `${width}px`;
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={styles.seamlessWrap}>
      <video
        ref={videoRef}
        className={styles.seamlessVideo}
        src={`${BASE_PATH}/service3/seamless-bg.mp4`}
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
}

const VISUALS = {
  intent: IntentVisual,
  beyond: BeyondVisual,
  seamless: SeamlessVisual,
};

const EASE = [0.16, 1, 0.3, 1] as const;

const visualVariants: Variants = {
  enter: (direction: number) => ({ y: direction > 0 ? "100%" : 0 }),
  center: { y: 0, transition: { duration: 0.6, ease: EASE } },
  exit: (direction: number) =>
    direction > 0
      ? { opacity: 0.9999, transition: { duration: 0.6 } }
      : { y: "100%", transition: { duration: 0.6, ease: EASE } },
};

export function SkeepExperience() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const prevIndexRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const progress = clampedProgress(0, 1, value);
    const next = Math.round(progress * (STAGES.length - 1));
    if (next !== prevIndexRef.current) {
      setDirection(next > prevIndexRef.current ? 1 : -1);
      prevIndexRef.current = next;
    }
    setActiveIndex(next);
  });

  // Once the scroll comes to rest while a stage is only partway crossfaded,
  // gently pull it the rest of the way to the nearest stage instead of
  // leaving the transition stuck in between.
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const scrollRange = wrapper.offsetHeight - window.innerHeight;
        if (scrollRange <= 0) return;
        const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
        const current = window.scrollY;
        if (current < wrapperTop || current > wrapperTop + scrollRange) return;

        const progress = (current - wrapperTop) / scrollRange;
        const nearestStage = Math.round(progress * (STAGES.length - 1));
        const targetY = wrapperTop + (nearestStage / (STAGES.length - 1)) * scrollRange;
        if (Math.abs(current - targetY) > 1) {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      }, SNAP_IDLE_DELAY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <section className={styles.section}>
        <div className={styles.textBlock}>
          <p className={styles.eyebrow}>Skeep Experience</p>
          <h2 className={styles.heading}>
            {LINES.map((line, i) => (
              <span
                key={line}
                style={{ color: i === activeIndex ? "rgba(14, 24, 37, 1)" : "rgba(14, 24, 37, 0.2)" }}
              >
                {line}
              </span>
            ))}
          </h2>
          <div className={styles.captionStack}>
            {STAGES.map((s, i) => (
              <div key={s.key} className={styles.caption} style={{ opacity: i === activeIndex ? 1 : 0 }}>
                {s.caption.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.box}>
          <AnimatePresence initial={false} custom={direction}>
            {STAGES.map((s, i) => {
              if (i !== activeIndex) return null;
              const Visual = VISUALS[s.key];
              return (
                <motion.div
                  key={s.key}
                  className={styles.visualLayer}
                  style={{ zIndex: i }}
                  custom={direction}
                  variants={visualVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <Visual />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
