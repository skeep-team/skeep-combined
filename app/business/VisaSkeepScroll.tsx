"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import styles from "./VisaSkeepScroll.module.css";

const pestelLetters = ["P", "E", "S", "T", "E", "L"];

export default function VisaSkeepScroll() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    let frame = 0;
    let activeScene: "visa" | "skeep" = "visa";

    const render = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const nextScene =
        activeScene === "visa"
          ? progress >= 0.46
            ? "skeep"
            : "visa"
          : progress <= 0.34
            ? "visa"
            : "skeep";

      if (nextScene !== activeScene) {
        activeScene = nextScene;
        section.dataset.scene = activeScene;
      }
    };

    const requestRender = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(render);
    };

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    render();

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.sequence}
      data-scene="visa"
      aria-label="VISA에서 Skeep으로 이어지는 에이전트 생태계"
    >
      <div className={styles.sticky}>
        <div className={`${styles.scene} ${styles.visaScene}`} aria-hidden="true">
          <div className={styles.pestelBars}>
            {pestelLetters.map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className={styles.pestelBar}
                style={
                  {
                    "--bar-color-alpha": (0.36 - index * 0.05).toFixed(2),
                    "--bar-bg-alpha": (0.78 - index * 0.1).toFixed(2),
                  } as CSSProperties
                }
              >
                {letter}
              </span>
            ))}
          </div>

          <div className={styles.visaCopy}>
            <h2 className={styles.headline}>
              에이전트 생태계에는
              <br />
              <em className={styles.visaWord}>VISA</em>가 필요합니다
            </h2>
            <p className={styles.visaDescription}>
              과거 각자도생하던 은행 카드를 단 하나의 네트워크로 통합한
              <br />
              비자처럼, AI 에이전트 시장 역시 기업과 프로덕트의 벽을 넘어
              <br />
              경험 데이터를 연결할 중립적 미들웨어가 요구되는 시점입니다.
            </p>
          </div>
        </div>

        <div className={`${styles.scene} ${styles.skeepScene}`} aria-hidden="true">
          <p className={styles.skeepStatement}>
            경험과 경험의 경계에서 포착한 기회.
            <br />
            스킵은 하드웨어와 기술의 경계를 허물고,
            <br />
            지속 가능한 연결의 새 기준을 제시합니다.
          </p>

          <h2 className={styles.headline}>
            에이전트 생태계에는
            <br />
            <em className={styles.skeepWord}>Skeep</em>이 필요합니다
          </h2>
        </div>
      </div>
    </section>
  );
}
