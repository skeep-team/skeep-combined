"use client";

import { useEffect, useRef } from "react";
import styles from "./PositioningScroll.module.css";

const forwardThresholds = [0.22, 0.48, 0.74];
const reverseThresholds = [0.14, 0.4, 0.66];

export default function PositioningScroll() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    let frame = 0;
    let activeScene = 0;

    const render = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));

      while (
        activeScene < forwardThresholds.length &&
        progress >= forwardThresholds[activeScene]
      ) {
        activeScene += 1;
      }

      while (
        activeScene > 0 &&
        progress <= reverseThresholds[activeScene - 1]
      ) {
        activeScene -= 1;
      }

      const nextScene = String(activeScene);

      if (section.dataset.scene !== nextScene) {
        section.dataset.scene = nextScene;
      }
    };

    const requestRender = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(render);
      }
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
      data-scene="0"
      aria-label="스킵의 코어 포지셔닝"
    >
      <div className={styles.sticky}>
        <article className={`${styles.scene} ${styles.sceneOne}`}>
          <header className={styles.sectionHeader}>
            <strong>Core<br />Positioning</strong>
            <span>스킵의<br />포지셔닝 전략</span>
            <i className={styles.headerMark} aria-hidden="true" />
          </header>

          <div className={styles.splitLayout}>
            <div className={styles.termCard}>
              <strong>Migratable<br />Agent</strong>
            </div>
            <h2>하드웨어와 클라우드 사이<br />사람과 경험 사이</h2>
          </div>
        </article>

        <article className={`${styles.scene} ${styles.sceneTwo}`}>
          <div className={styles.splitLayout}>
            <div className={styles.termGrid}>
              <div className={styles.termCard}>
                <strong>Migratable<br />Agent</strong>
              </div>
              <div className={styles.termCard}>
                <strong>Universal<br />Middleware</strong>
              </div>
            </div>
            <h2>스킵은 어디에도<br />속하지 않기에</h2>
          </div>
        </article>

        <article className={`${styles.scene} ${styles.sceneThree}`}>
          <div className={styles.valueGrid}>
            <div className={styles.valueCard}>
              <span>For Users</span>
              <h3>Migratable<br />Agent</h3>
              <p>사용자 맥락과 아이덴티티를 유지한 채, 환경<br />사이를 이동하며 목적 달성을 돕는 에이전트</p>
            </div>
            <div className={styles.valueCard}>
              <span>For Partners</span>
              <h3>Universal<br />Middleware</h3>
              <p>서비스와 제품 공간, 그리고 각 기업 간 경계를<br />넘어, 모든 접점의 경험을 연결짓는 미들웨어</p>
            </div>
            <div className={styles.valueCard}>
              <span>For Ecosystem</span>
              <h3>New<br />Standard</h3>
              <p>서로 다른 형태로 단절된 에이전트 생태계를<br />공통 규격과 연결망으로 통합하는 국제 표준</p>
            </div>
          </div>
        </article>

        <article className={`${styles.scene} ${styles.sceneFour}`}>
          <div className={styles.heroPanel}>
            <div className={styles.heroVisual}>Skeep Hero Image</div>
            <div className={styles.heroCopy}>
              <h2>세상 모든 경험을<br />연결합니다</h2>
              <strong>사용자에게는 끊김 없는 일상의 사용 경험을<br />기업에게는 경계 없는 비즈니스 확장을.</strong>
              <p>물리적 세계를 이해하는 스킵은 모든 생태계를<br />관통하는 에이전트로서 비즈니스와 일상이 만나는<br />가장 완벽한 접점을 제공합니다.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
