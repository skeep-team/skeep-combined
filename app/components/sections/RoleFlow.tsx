"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./RoleFlow.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function clampedProgress(start: number, end: number, value: number) {
  if (end === start) return value >= end ? 1 : 0;
  return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

export function RoleFlow() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [fullBleedScale, setFullBleedScale] = useState(1.35);
  const [shrinkProgress, setShrinkProgress] = useState(0);
  const [textProgress, setTextProgress] = useState(0);

  useEffect(() => {
    const measure = () => {
      const box = boxRef.current;
      if (!box || box.offsetWidth === 0 || box.offsetHeight === 0) return;
      const scaleX = window.innerWidth / box.offsetWidth;
      const scaleY = window.innerHeight / box.offsetHeight;
      setFullBleedScale(Math.max(scaleX, scaleY));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setShrinkProgress(clampedProgress(0, 0.5, value));
    setTextProgress(clampedProgress(0.45, 0.7, value));
  });

  const scale = lerp(fullBleedScale, 1, shrinkProgress);
  const borderRadius = lerp(0, 33.75, shrinkProgress);
  const dimOpacity = lerp(0, 0.15, shrinkProgress);
  const textOpacity = textProgress;
  const textY = lerp(60, 0, textProgress);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.section}>
        <div
          ref={boxRef}
          className={styles.box}
          style={{ transform: `scale(${scale})`, borderRadius }}
        >
          <video
            className={styles.bgVideo}
            style={{ borderRadius }}
            src={`${BASE_PATH}/roleflow/bg.mp4`}
            autoPlay
            muted
            loop
            playsInline
          />
          <div
            className={styles.dimOverlay}
            style={{ opacity: dimOpacity, borderRadius }}
          />
          <div
            className={styles.textLayer}
            style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}
          >
            <p className={styles.heading}>
              각자의 역할을 모아
              <br />
              하나의 흐름으로
            </p>
            <p className={styles.body}>
              SKEEP은 연결된 환경의 능력을 읽고,
              <br />
              각 환경이 가장 잘할 수 있는 일을 선별해 맡깁니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
