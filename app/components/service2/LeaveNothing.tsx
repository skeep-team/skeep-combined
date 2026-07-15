"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { DustText } from "../ui/DustText";
import styles from "./LeaveNothing.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function clampedProgress(start: number, end: number, value: number) {
  if (end === start) return value >= end ? 1 : 0;
  return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

// Card padding as a ratio of the content it wraps, derived from the Figma
// spec: the blob (the widest element) leaves 122.3px of margin on a
// 684.96px-wide blob inside a 929.555px card, and the card reserves 7.2%
// top / 6% bottom beyond the LEAVE-to-body content stack.
const CARD_WIDTH_RATIO = 929.555 / 684.96;
const CARD_HEIGHT_RATIO = 1 / (1 - 0.072 - 0.06);

export function LeaveNothing() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [fullSize, setFullSize] = useState({ width: 0, height: 0 });
  const [expandProgress, setExpandProgress] = useState(0);
  const [rockOpacity, setRockOpacity] = useState(0);

  useEffect(() => {
    const measure = () => {
      const section = sectionRef.current;
      const content = contentRef.current;
      if (!section || !content) return;
      // The expanded card should cover the section edge-to-edge (matching the
      // Figma reference, where the white background fills the full 1920x1080
      // frame), not just the padded content box the text/blob respect.
      setFullSize({
        width: section.clientWidth,
        height: section.clientHeight,
      });

      const contentRect = content.getBoundingClientRect();
      setNaturalSize({
        width: contentRect.width * CARD_WIDTH_RATIO,
        height: contentRect.height * CARD_HEIGHT_RATIO,
      });
    };
    measure();
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setExpandProgress(clampedProgress(0.1, 0.5, value));
    setRockOpacity(clampedProgress(0.55, 0.95, value));
  });

  const hasMeasured = fullSize.width > 0 && naturalSize.width > 0;
  const cardWidth = hasMeasured ? lerp(naturalSize.width, fullSize.width, expandProgress) : undefined;
  const cardHeight = hasMeasured ? lerp(naturalSize.height, fullSize.height, expandProgress) : undefined;
  const shadowAlpha = lerp(0.18, 0, expandProgress);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={sectionRef} className={styles.section}>
        <img
          className={styles.bgPhoto}
          src={`${BASE_PATH}/service2/leave-nothing-bg.jpg`}
          alt=""
        />
        <div
          className={styles.whiteCard}
          style={{
            width: cardWidth,
            height: cardHeight,
            boxShadow: `0 40px 90px rgba(14, 24, 37, ${shadowAlpha})`,
          }}
        />
        <div ref={contentRef} className={styles.content}>
          <DustText text="LEAVE" tag="p" className={styles.leave} playMode="enter" />
          <div className={styles.blobWrap}>
            <img
              className={styles.blobImage}
              src={`${BASE_PATH}/service2/leave-nothing-photo-blob.png`}
              alt=""
              style={{ opacity: 1 - rockOpacity }}
            />
            <img
              className={styles.blobImage}
              src={`${BASE_PATH}/service2/leave-nothing-rock-blob.png`}
              alt=""
              style={{ opacity: rockOpacity }}
            />
          </div>
          <DustText text="NOTHING." tag="p" className={styles.nothing} playMode="enter" />
          <p className={styles.body}>
            환경은 특정 순간에만 사용자를 알게 됩니다.
            <br />
            상호작용이 끝나면 패킷은 회수되어 환경은 사용자에 대한 정보를 잊게 되죠.
          </p>
        </div>
      </div>
    </div>
  );
}
