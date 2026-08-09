"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./VisaSkeepScroll.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* PESTEL 레일과 VISA/Skeep 장면은 원래 한 흐름이다. 레일을 두 섹션에 각각 그리면
   두 벌이 화면에 동시에 보여서 이어지는 인상이 깨지므로, 여기서 한 벌만 그리고
   그 레일이 그대로 접히면서 VISA 카피에 자리를 내준다. */
const items = [
  {
    letter: "P",
    category: "Political",
    image: `${BASE_PATH}/business/pestel/s-social-card.webp`,
    title: "빅테크 진영의\nAI 파이 나누기와\n폐쇄적 생태계 구축",
    description:
      "세상의 수많은 서비스와 제품 경험을 한 기업의 생태계로 독점하는 것은 불가능하죠. 독점적인 파이를 차지하려는 플랫폼 간의 폐쇄적인 진영 싸움은 기술의 유기적인 융합보다 사용자 경험의 파편화를 이끌어왔습니다.",
  },
  {
    letter: "E",
    category: "Economic",
    image: `${BASE_PATH}/business/pestel/e-economic-card.webp`,
    title: "AI 데이터 인프라\n중복 투자와\n고정비 지출 심화",
    description:
      "폐쇄적 생태계 확장의 이면에는 각 진영의 장벽 안에 고립된 데이터의 비효율이 자리하고 있죠. 기업들은 그들의 가치를 유지의 맥락 속에 매끄럽게 전달하지 못하고 비즈니스 기회와 고객 경험 혁신에서 한계를 느껴 왔습니다.",
  },
  {
    letter: "S",
    category: "Social",
    image: `${BASE_PATH}/business/pestel/s-background-card.webp`,
    title: "스크린을 넘어\n연속적 사용 경험을\n요구하는 사용자",
    description:
      "화면 속에 갇힌 인터랙션에 피로감을 느낀 유저들은 이제 스크린 밖 일상 자체를 소비하기 시작했습니다. 그러나 진영 간의 장벽에 가로막혀 일상의 동선마다 번번이 단절되는 불연속적인 경험은 유저들에게 깊은 피로감을 선사했죠.",
  },
  {
    letter: "T",
    category: "Technological",
    image: `${BASE_PATH}/business/pestel/t-background-card.webp`,
    title: "물리적 세계로\n확장하기 시작하는\nA2A 생태계",
    description:
      "멀티모달 AI와 에이전트 기술은 더 이상 화면 안에 머물지 않습니다. 다양한 기기와 환경을 넘나들며 자율적으로 이동하고 소통하는 A2A 생태계로의 전환이 이미 시작되었습니다.",
  },
  {
    letter: "E",
    category: "Environmental",
    image: `${BASE_PATH}/business/pestel/e-background-card.webp`,
    title: "AI가 촉발한\n데이터 센터의\n전력난과 과부하",
    description:
      "폭발적으로 증가하는 멀티모달 연산은 글로벌 데이터 인프라에 전례 없는 과부하를 유발해왔죠. 무분별한 클라우드 리소스의 낭비를 줄이고, 생태계 전체의 연산 효율을 극대화하는 지속 가능한 인프라로의 전환은 필수적입니다.",
  },
  {
    letter: "L",
    category: "Legal",
    image: `${BASE_PATH}/business/pestel/l-background-card.webp`,
    title: "에이전트 경험의\n독점 규제와 표준\n프로토콜의 필요성",
    description:
      "일부 빅테크가 사용자를 독점하는 것에 대한 제도적 규제가 전 세계적으로 강화되고 있습니다. 서로 다른 진영 간의 장벽을 허물고 데이터와 에이전트를 자유롭게 상호 호환시킬 표준 프로토콜 규격이 필연적으로 요구되는 시점입니다.",
  },
];

/* 처음에는 여섯 장이 나란히 접힌 채로 보이고(cardStepStart 전), 거기서부터
   한 구간씩 넘길 때마다 한 장씩 펼쳐진다. */
const cardStepStart = 0.14;
const cardStepEnd = 0.56;

/* 여섯 장을 다 본 뒤 접고, 그다음 Skeep 장면으로 넘어간다. */
const foldForward = 0.64;
const foldReverse = 0.58;
const skeepForward = 0.84;
const skeepReverse = 0.76;

function cardIndexAt(progress: number) {
  /* 아직 첫 구간에 닿지 않았으면 아무것도 열지 않는다 — 여섯 장이 그대로 접혀 있다. */
  if (progress < cardStepStart) {
    return null;
  }

  const span = (cardStepEnd - cardStepStart) / items.length;
  const step = Math.floor((progress - cardStepStart) / span);

  return Math.min(items.length - 1, Math.max(0, step));
}

export default function VisaSkeepScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const firstCardRectsRef = useRef<Array<DOMRect | null>>([]);
  const cardAnimationsRef = useRef<Animation[]>([]);
  const activeIndexRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hasUserInteractedRef = useRef(false);
  const isOpen = activeIndex !== null;

  /* 카드의 실제 폭은 상태가 바뀌는 순간 한 번만 계산한다. 이전/다음 위치의
     차이는 transform으로 되감아 재생하므로, 무스가 매 프레임 여섯 카드의
     레이아웃과 이미지 크롭을 다시 계산하지 않아도 된다. */
  const updateActiveIndex = useCallback((next: number | null) => {
    if (next === activeIndexRef.current) return;

    firstCardRectsRef.current = cardRefs.current.map((card) =>
      card ? card.getBoundingClientRect() : null,
    );
    activeIndexRef.current = next;
    setActiveIndex(next);
  }, []);

  useLayoutEffect(() => {
    const firstRects = firstCardRectsRef.current;
    if (!firstRects.some(Boolean)) return;
    firstCardRectsRef.current = [];

    cardAnimationsRef.current.forEach((animation) => animation.cancel());
    cardAnimationsRef.current = [];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    cardRefs.current.forEach((card, index) => {
      const first = firstRects[index];
      if (!card || !first || first.width <= 0) return;

      const last = card.getBoundingClientRect();
      if (last.width <= 0) return;

      const deltaX = first.left - last.left;
      const scaleX = first.width / last.width;

      if (Math.abs(deltaX) < 0.5 && Math.abs(scaleX - 1) < 0.002) return;

      const animation = card.animate(
        [
          {
            transformOrigin: "left center",
            transform: `translate3d(${deltaX}px, 0, 0) scaleX(${scaleX})`,
          },
          {
            transformOrigin: "left center",
            transform: "translate3d(0, 0, 0) scaleX(1)",
          },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "none",
        },
      );

      cardAnimationsRef.current.push(animation);
    });
  }, [activeIndex]);

  /* 직접 누르면 그때부터는 스크롤이 선택을 바꾸지 않는다. */
  const handleSelect = (index: number) => {
    hasUserInteractedRef.current = true;
    updateActiveIndex(index);
  };

  const handleBack = () => {
    hasUserInteractedRef.current = true;
    updateActiveIndex(null);
  };

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    let frame = 0;
    let folded = false;
    let cardIndex: number | null | undefined;
    let scene: "visa" | "skeep" = "visa";

    const render = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));

      /* 사용자가 카드를 직접 누른 뒤에는 스크롤이 선택을 뺏지 않는다. */
      if (!hasUserInteractedRef.current) {
        const next = cardIndexAt(progress);

        if (next !== cardIndex) {
          cardIndex = next;
          updateActiveIndex(next);
        }
      }

      if (!folded && progress >= foldForward) {
        folded = true;
      } else if (folded && progress <= foldReverse) {
        folded = false;
      }

      /* 접는 건 CSS 전환에 맡기고, 여기서는 접힘 여부만 넘긴다. */
      const foldValue = folded ? "1" : "0";

      if (section.style.getPropertyValue("--fold") !== foldValue) {
        section.style.setProperty("--fold", foldValue);
        section.dataset.folded = folded ? "true" : "false";
      }

      const next =
        scene === "visa"
          ? progress >= skeepForward
            ? "skeep"
            : "visa"
          : progress <= skeepReverse
            ? "visa"
            : "skeep";

      if (next !== scene) {
        scene = next;
        section.dataset.scene = scene;
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
  }, [updateActiveIndex]);

  return (
    <section
      ref={sectionRef}
      className={styles.sequence}
      data-scene="visa"
      data-folded="false"
      aria-label="시장 환경 분석과 에이전트 생태계의 필요성"
    >
      <div ref={stickyRef} className={styles.sticky}>
        <div className={`${styles.scene} ${styles.visaScene}`}>
          <div className={`${styles.rail} ${isOpen ? styles.railOpen : ""}`}>
            {items.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <article
                  key={`${item.category}-${index}`}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className={`${styles.card} ${item.image ? styles.cardWithImage : ""} ${isActive ? styles.cardActive : ""}`}
                >
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.cardImage}
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <button
                    className={styles.selectButton}
                    type="button"
                    aria-expanded={isActive}
                    aria-label={`${item.category} 상세 내용 보기`}
                    onClick={() => handleSelect(index)}
                  >
                    <span className={styles.letter} aria-hidden="true">
                      {item.letter}
                    </span>

                    {!isOpen && (
                      <span className={styles.summary}>
                        <span className={styles.category}>{item.category}</span>
                        <strong className={styles.title}>{item.title}</strong>
                      </span>
                    )}
                  </button>

                  {isActive && (
                    <>
                      <button
                        className={styles.backButton}
                        type="button"
                        aria-label="전체 PESTEL 카드로 돌아가기"
                        onClick={handleBack}
                      >
                        <span aria-hidden="true">←</span>
                      </button>

                      <div className={styles.detailFade}>
                        <div className={styles.detail}>
                          <div className={styles.detailHeading}>
                            <span className={styles.category}>
                              {item.category}
                            </span>
                            <h2 className={styles.detailTitle}>{item.title}</h2>
                          </div>
                          <p className={styles.description}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>

          <div className={styles.visaCopy} aria-live="polite">
            {/* 헤드라인은 하나만 계속 떠 있는다 — "에이전트 생태계에는"과
                "필요합니다"는 그대로 두고, VISA/Skeep 단어만 아래에서 위로
                올라오며 자리를 바꾼다. */}
            <h2 className={styles.headline}>
              에이전트 생태계에는
              <br />
              <span className={styles.wordSwap}>
                <span className={styles.wordVisa}>
                  <em className={styles.visaWord}>VISA</em>가
                </span>
                <span className={styles.wordSkeep}>
                  <em className={styles.skeepWord}>Skeep</em>이
                </span>
              </span>{" "}
              필요합니다
            </h2>

            <div className={styles.descStack}>
              <p className={`${styles.visaDescription} ${styles.descVisa}`}>
                과거 각자도생하던 은행 카드를 단 하나의 네트워크로 통합한
                <br />
                비자처럼, AI 에이전트 시장 역시 기업과 프로덕트의 벽을 넘어
                <br />
                경험 데이터를 연결할 중립적 미들웨어가 요구되는 시점입니다.
              </p>
              <p
                className={`${styles.visaDescription} ${styles.skeepDescription} ${styles.descSkeep}`}
              >
                경험과 경험의 경계에서 포착한 기회.
                <br />
                스킵은 하드웨어와 기술의 경계를 허물고,
                <br />
                지속 가능한 연결의 새 기준을 제시합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
