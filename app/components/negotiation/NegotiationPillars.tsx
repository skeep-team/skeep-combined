"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState, type CSSProperties } from "react";
import styles from "./NegotiationPillars.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// 경량화: 세 배경 모두 <video>였지만 skip/skeep은 사실상 정지 화면이라 정적
// 배경으로, keep만 실제 움직이는 리플이라 CSS 애니메이션으로 대체했다
// (무빙스타일 호환 + 항상 재생).
const PILLARS = [
  {
    key: "skip",
    images: [
      `${BASE_PATH}/negotiation/skip-conditions-reduced.png`,
      `${BASE_PATH}/negotiation/skip-conditions-full.png`,
    ],
    lightText: true,
    title: ["본질만 남긴 채", "SKIP"],
    body: [
      "사용자의 SKEEP은 목적을 이루는 데",
      "필요한 조건만 전달합니다. 사적인 이유나",
      "불필요한 정보는 환경에 남기지 않죠.",
    ],
  },
  {
    key: "skeep",
    diagonal: true,
    title: ["경계를 존중하는", "SKEEP"],
    body: [
      "환경 운영 규칙과 물리적 한계,",
      "사용자가 정한 비용과 정보 공유 범위는",
      "협상하지 않고, 그 안에서 방법을 찾습니다.",
    ],
  },
  {
    key: "keep",
    ripple: true,
    lightText: true,
    title: ["모두의 흐름은", "KEEP"],
    body: [
      "SKEEP은 서로의 조건을 조율해,",
      "공간 안의 사람과 자원, 시간을 살피며",
      "모두의 목적이 이어질 방법을 찾습니다.",
    ],
  },
] as const;

// Weight window keyed to a scroll delay: delay=0 (container) reacts the
// instant this pillar becomes current, larger delays (title, then body)
// require the scroll position to be closer before they catch up — this is
// what produces the container -> title -> description reveal order. `hold`
// adds a flat plateau at full weight around the pillar's own stage instead
// of starting to fade the instant scroll moves past it.
function windowWeight(stage: number, index: number, delay: number, hold = 0) {
  const distance = Math.max(Math.abs(stage - index) - hold, 0);
  const span = 1 - delay - hold;
  return Math.min(Math.max(1 - distance / span, 0), 1);
}

// Text rises up into place as it fades in, instead of just crossfading flat.
function riseStyle(weight: number) {
  return {
    opacity: weight,
    transform: `translateY(${(1 - weight) * 28}px)`,
  };
}

export function NegotiationPillars() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const clamped = Math.min(Math.max(value, 0), 1);
    setStage(clamped * (PILLARS.length - 1));
  });

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* Invisible scroll-snap targets: the wrapper is 240vh for a 100vh
          viewport, so its 140vh of scrollable range maps stage 0/1/2 to
          scroll offsets 0/70vh/140vh — matching each pillar becoming fully
          current. `scroll-snap-type: y proximity` (set globally) gently
          pulls scroll to whichever of these is closest instead of leaving
          the section feeling like it drifts freely between pillars. */}
      <div className={styles.snapPoint} style={{ top: "0vh" }} />
      <div className={styles.snapPoint} style={{ top: "70vh" }} />
      <div className={styles.snapPoint} style={{ top: "140vh" }} />
      <section className={styles.section}>
        <div className={styles.box}>
          {PILLARS.map((pillar, i) => {
            const containerWeight = windowWeight(stage, i, 0, 0.35);
            const titleWeight = windowWeight(stage, i, 0.22, 0.35);
            const bodyWeight = windowWeight(stage, i, 0.44, 0.35);
            const hasImages = "images" in pillar;
            const hasDiagonal = "diagonal" in pillar && pillar.diagonal;
            const hasRipple = "ripple" in pillar && pillar.ripple;
            const lightText = "lightText" in pillar && pillar.lightText;
            return (
              <div
                key={pillar.key}
                className={styles.layer}
                style={{ "--pillar-opacity": containerWeight } as CSSProperties}
              >
                {hasImages && (
                  <div className={styles.dissolveBackground} aria-hidden="true">
                    {pillar.images.map((image, imageIndex) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={image}
                        className={`${styles.backgroundVideo} ${
                          imageIndex === 1 ? styles.backgroundVideoAlternate : ""
                        }`}
                        src={image}
                        alt=""
                      />
                    ))}
                  </div>
                )}
                {hasDiagonal && <div className={styles.pillarDiagonal} aria-hidden="true" />}
                {hasRipple && (
                  <div className={styles.pillarRipple} aria-hidden="true">
                    <span className={styles.pillarRippleRing} />
                    <span className={styles.pillarRippleRing} />
                    <span className={styles.pillarRippleRing} />
                  </div>
                )}
                <div className={styles.content}>
                  <div className={styles.textBlock}>
                    <h2
                      className={lightText ? `${styles.heading} ${styles.headingOnVideo}` : styles.heading}
                      style={riseStyle(titleWeight)}
                    >
                      {pillar.title.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h2>
                    <p
                      className={lightText ? `${styles.body} ${styles.bodyOnVideo}` : styles.body}
                      style={riseStyle(bodyWeight)}
                    >
                      {pillar.body.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
