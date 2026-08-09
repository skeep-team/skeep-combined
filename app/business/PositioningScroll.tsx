"use client";

import { useEffect, useRef } from "react";
import styles from "./PositioningScroll.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* 단계: 한 장 → 두 장 → 세 장(접힘) → 세 장(펼침).
   마지막 전환은 가운데 카드 선택·확대·히어로 노출을 하나의 짧은 동작으로 묶는다. */
const forwardThresholds = [0.14, 0.28, 0.44];
const reverseThresholds = [0.08, 0.22, 0.38];
/* 세 장이 다 펼쳐진 장면을 충분히 보여준 뒤 히어로로 전환하되,
   검은 최종 장면도 약 한 화면 동안 sticky 상태로 머물게 한다. */
const morphRange = [0.7, 0.82];

function ramp(value: number, [start, end]: number[]) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

const VALUE_CARDS = [
  {
    label: "For Users",
    title: ["Migratable", "Agent"],
    body: [
      "사용자 맥락과 아이덴티티를 유지한 채, 환경",
      "사이를 이동하며 목적 달성을 돕는 에이전트",
    ],
    colorClass: styles.valueCardUsers,
  },
  {
    label: "For Partners",
    title: ["Universal", "Middleware"],
    body: [
      "서비스와 제품 공간, 그리고 각 기업 간 경계를",
      "넘어, 모든 접점의 경험을 연결짓는 미들웨어",
    ],
    colorClass: styles.valueCardPartners,
  },
  {
    label: "For Ecosystem",
    title: ["New", "Standard"],
    body: [
      "서로 다른 형태로 단절된 에이전트 생태계를",
      "공통 규격과 연결망으로 통합하는 국제 표준",
    ],
    colorClass: styles.valueCardEcosystem,
  },
] as const;

/* 라벨과 설명은 항상 넣어 두고 접어만 둔다. 펼치고 접는 건 섹션의 data-scene이 정하므로
   카드 쪽에서는 지금이 몇 단계인지 알 필요가 없다. */
function ValueCard({ index }: { index: 0 | 1 | 2 }) {
  const card = VALUE_CARDS[index];

  return (
    <div className={`${styles.valueCard} ${card.colorClass}`}>
      <div className={styles.valueCardTop}>
        <div className={styles.valueCollapse}>
          <span className={styles.valueLabel}>{card.label}</span>
        </div>
        <h3>
          {card.title.map((line) => (
            <span className={styles.valueTitleLine} key={line}>
              {line}
            </span>
          ))}
        </h3>
      </div>
      <div className={styles.valueCollapse}>
        <p>
          {card.body.map((line) => (
            <span className={styles.valueBodyLine} key={line}>
              {line}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export default function PositioningScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  /* 진행도는 헤더를 뺀 핀 구간(.track)에서만 재야 한다. 헤더는 앞선 두 섹션처럼
     그냥 스크롤되어 사라지고, 핀은 그다음부터 걸린다. */
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!section || !track) {
      return;
    }

    let frame = 0;
    let activeScene = 0;
    let targetMorph = 0;
    let currentMorph = 0;
    let lastTime = 0;
    let initialized = false;

    const updateTarget = () => {
      const rect = track.getBoundingClientRect();
      const distance = Math.max(1, track.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      targetMorph = ramp(progress, morphRange);

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

      if (!initialized) {
        currentMorph = targetMorph;
        initialized = true;
      }
    };

    const renderMorph = () => {
      /* 양옆 카드와 가운데 카드의 기존 문구를 거의 동시에 정리한다.
         가운데 카드만 덩그러니 남는 별도 장면을 만들지 않는다. */
      const sideFade = ramp(currentMorph, [0.08, 0.34]);
      const centerFade = ramp(currentMorph, [0.14, 0.4]);
      /* 확대가 시작된 직후부터 새 콘텐츠가 이어서 나타나 한 번의 모핑처럼 보인다. */
      const heroReveal = ramp(currentMorph, [0.34, 0.84]);

      section.style.setProperty("--side-fade", sideFade.toFixed(4));
      section.style.setProperty("--center-fade", centerFade.toFixed(4));
      section.style.setProperty("--hero-reveal", heroReveal.toFixed(4));
      section.dataset.expanded = currentMorph >= 0.3 ? "true" : "false";
    };

    const animate = (time: number) => {
      const elapsed = lastTime ? Math.min(48, time - lastTime) : 16;
      /* 너무 짧게 감쇠하면 히어로로 넘어가는 게 급하게 느껴진다. 조금 길게 뒤따르게 한다. */
      const easing = 1 - Math.exp(-elapsed / 320);

      lastTime = time;
      currentMorph += (targetMorph - currentMorph) * easing;

      if (Math.abs(targetMorph - currentMorph) < 0.0005) {
        currentMorph = targetMorph;
      }

      renderMorph();

      if (currentMorph !== targetMorph) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = 0;
        lastTime = 0;
      }
    };

    const requestRender = () => {
      updateTarget();

      if (!frame) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    updateTarget();
    renderMorph();

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
      id="core-positioning"
      ref={sectionRef}
      className={styles.sequence}
      data-scene="0"
      data-expanded="false"
      aria-label="스킵의 코어 포지셔닝"
    >
      <header className={styles.sectionHeader}>
        <strong>Core<br />Positioning</strong>
        <span>스킵의<br />포지셔닝 전략</span>
        <i className={styles.headerMark} aria-hidden="true" />
      </header>

      <div className={styles.track} ref={trackRef}>
      <div className={styles.sticky}>
        <article className={styles.sceneCards}>
          <div className={styles.progressGrid}>
            {/* 첫 번째 카드는 처음부터 끝까지 이 자리 하나뿐이다 — scene이
                넘어가도 다시 마운트되거나 페이드하지 않는다. */}
            <ValueCard index={0} />

            {/* 두 번째 칸: 처음엔 헤드라인(2~3열을 가로질러) 하나뿐이다가,
                두 번째 카드가 나타날 때 헤드라인은 사라지고 카드가 오른쪽에서
                슬라이드-인하며 2열 자리를 차지한다. */}
            <div className={styles.secondSlot}>
              <h2 className={`${styles.progressHeadline} ${styles.secondSlotHeadline}`}>
                하드웨어와 클라우드 사이<br />사람과 경험 사이
              </h2>
              <div className={styles.secondSlotCard}>
                {/* 가운데 카드는 마지막 단계에서 그대로 자라 히어로 패널이 된다.
                    양옆 카드는 접히고, 카드 얼굴과 패널 얼굴이 자리에서 교대한다. */}
                <div className={styles.morphSlot}>
                  <ValueCard index={1} />

                  <div className={styles.heroPanel}>
            <strong className={styles.heroLede}>
              사용자에게는 끊김 없는 일상의 사용 경험을,
              <br />
              기업에게는 경계 없는 비즈니스 확장을.
            </strong>
            <div className={styles.heroVisual}>
              {/* 콜라주 아래쪽은 배경으로 녹아들어야 해서 그라데이션을 겹쳐 덮는다. */}
              <picture>
                <source
                  srcSet={`${BASE_PATH}/business/hero-connect.webp`}
                  type="image/webp"
                />
                <img
                  src={`${BASE_PATH}/business/hero-connect.png`}
                  width={2104}
                  height={1070}
                  alt="스킵으로 연결된 일상의 장면들 — 업무, 러닝, 결제, 커피, 쇼핑, 드라이브"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <div className={styles.heroCopy}>
              <h2>세상 모든 경험을 연결합니다</h2>
              <p>
                물리적 세계를 이해하는 스킵은 모든 생태계를 관통하는
                에이전트로서 비즈니스와 일상이 만나는 가장 완벽한 접점을
                제공합니다.
              </p>
            </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 세 번째 칸: 처음엔 헤드라인만 있다가, 세 번째 카드가 나타날 때
                기존 두 카드는 그대로 둔 채 이 칸에서만 오른쪽에서
                슬라이드-인하며 헤드라인과 자리를 바꾼다. */}
            <div className={styles.thirdSlot}>
              <h2 className={`${styles.progressHeadline} ${styles.thirdSlotHeadline}`}>
                스킵은 어디에도<br />속하지 않기에
              </h2>
              <div className={styles.thirdSlotCard}>
                <ValueCard index={2} />
              </div>
            </div>
          </div>
        </article>
      </div>
      </div>
    </section>
  );
}
