"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState, type CSSProperties } from "react";
import styles from "./Detour.module.css";

const LINE_RANGES: [number, number][] = [
  [0.05, 0.22],
  [0.22, 0.39],
  [0.55, 0.72],
  [0.55, 0.72],
];

// 경량화: bg.mp4(회전하는 나침반 바늘) 대신 CSS 애니메이션
// (무빙스타일 호환 + 항상 재생). 다이얼은 15도 간격 24개 눈금,
// 6개마다(0/90/180/270도) 굵은 방위 눈금.
const TICK_COUNT = 24;
const TICKS = Array.from({ length: TICK_COUNT }, (_, i) => ({
  angle: i * (360 / TICK_COUNT),
  major: i % 6 === 0,
}));

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
        <div className={styles.compassBg} aria-hidden="true">
          <div className={styles.dial}>
            {TICKS.map((tick, i) => (
              <span
                key={i}
                className={tick.major ? `${styles.tick} ${styles.tickMajor}` : styles.tick}
                style={{ "--tick-angle": `${tick.angle}deg` } as CSSProperties}
              />
            ))}
            <svg className={styles.needle} viewBox="0 0 131 477" aria-hidden="true">
              <defs>
                <linearGradient id="detourNeedleFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D4551" />
                  <stop offset="50%" stopColor="#3D4551" />
                  <stop offset="50%" stopColor="#262E3A" />
                  <stop offset="100%" stopColor="#262E3A" />
                </linearGradient>
              </defs>
              <path
                d="M 60.2 19.3 Q 65.5 0 70.8 19.3 L 131 238.5 L 70.8 457.7 Q 65.5 477 60.2 457.7 L 0 238.5 Z"
                fill="url(#detourNeedleFill)"
              />
            </svg>
          </div>
        </div>
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
