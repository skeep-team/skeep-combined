"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import styles from "./Detour.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const LINE_RANGES: [number, number][] = [
  [0.05, 0.22],
  [0.22, 0.39],
  [0.55, 0.72],
  [0.55, 0.72],
];

function clampedProgress([start, end]: [number, number], value: number) {
  if (end === start) return value >= end ? 1 : 0;
  return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

export function Detour() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [lineProgress, setLineProgress] = useState([0, 0, 0, 0]);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setLineProgress(LINE_RANGES.map((range) => clampedProgress(range, value)));
  });

  const lineStyle = (progress: number) => ({
    opacity: progress,
    transform: `translateY(${(1 - progress) * 24}px)`,
  });

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <section className={styles.section}>
        <video
          className={styles.bgVideo}
          src={`${BASE_PATH}/detour/bg.mp4`}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={styles.textBlock}>
          <h2 className={styles.heading}>
            <span style={lineStyle(lineProgress[0])}>우회하는 것 또한</span>
            <span style={lineStyle(lineProgress[1])}>여정의 일부</span>
          </h2>
          <p className={styles.body}>
            <span style={lineStyle(lineProgress[2])}>
              목적을 향한 길은 언제나 열려 있습니다. SKEEP은 변화하는 환경 속에서도,
            </span>
            <span style={lineStyle(lineProgress[3])}>
              당신의 의도를 끝까지 완수할 대안을 제시합니다.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
