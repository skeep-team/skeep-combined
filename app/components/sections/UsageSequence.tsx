"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./InteractionBlueprint.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type UsageSection = {
  eyebrow: string;
  title: string;
  body: string;
  note?: string;
};

type UsageArtworkPhase = "bubble" | "bubbleExit" | "watch" | "watchExit";

/* "watch" 단계는 예전엔 3초짜리 mp4였다 — 무빙스타일에서 버퍼링이 밀려
   빈 원으로 보이거나 반복이 멈추는 문제가 반복돼서 정지 이미지로 바꿨다.
   영상 길이와 비슷하게, 이 이미지를 보여주는 시간만 타이머로 잡아준다. */
const WATCH_HOLD_MS = 2600;

const MORE_SLIDES = [
  {
    frames: [
      "more-carousel-1-1.png",
      "more-carousel-1-2.png",
      "more-carousel-1-3.png",
      "more-carousel-1-4.png",
    ],
    alt: "Long click interaction",
    badge: "long click",
  },
  {
    frames: [
      "more-carousel-2-1.png",
      "more-carousel-2-2.png",
      "more-carousel-2-3.png",
      "more-carousel-2-4.png",
    ],
    alt: "Long touch interaction",
    badge: "long touch",
  },
  {
    frames: ["more-voice.png"],
    alt: "Voice interaction",
    badge: "voice",
  },
];

function MoreCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFrame, setActiveFrame] = useState(0);
  const [voicePhase, setVoicePhase] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    const frameCount = MORE_SLIDES[activeIndex].frames.length;

    if (frameCount <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveFrame((frame) => (frame + 1) % frameCount);
    }, 1400);

    return () => window.clearInterval(timer);
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex !== 2) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVoicePhase(2);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  const moveTo = (nextIndex: number) => {
    const normalizedIndex =
      (nextIndex + MORE_SLIDES.length) % MORE_SLIDES.length;

    setActiveFrame(0);
    setVoicePhase(normalizedIndex === 2 ? 1 : 0);
    setActiveIndex(normalizedIndex);
  };

  return (
    <div
      className={styles.moreCarousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="자세히 보기 인터랙션"
    >
      <div
        className={styles.moreCarouselViewport}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            moveTo(activeIndex - 1);
          } else if (event.key === "ArrowRight") {
            moveTo(activeIndex + 1);
          }
        }}
        onPointerDown={(event) => {
          pointerStartX.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          const startX = pointerStartX.current;
          pointerStartX.current = null;

          if (startX === null) {
            return;
          }

          const distance = event.clientX - startX;

          if (Math.abs(distance) >= 44) {
            moveTo(activeIndex + (distance < 0 ? 1 : -1));
          }
        }}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        <div
          className={styles.moreCarouselTrack}
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {MORE_SLIDES.map((slide, index) => (
            <div
              className={styles.moreCarouselSlide}
              key={slide.frames[0]}
              aria-hidden={index !== activeIndex}
              data-voice-phase={index === 2 ? voicePhase : undefined}
            >
              {slide.frames.map((frame, frameIndex) => {
                const isActiveFrame =
                  frameIndex === (index === activeIndex ? activeFrame : 0);

                return (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    className={styles.moreCarouselFrame}
                    data-active={isActiveFrame}
                    src={`${BASE_PATH}/blueprint/usage/${frame}`}
                    alt={isActiveFrame ? slide.alt : ""}
                    width={index < 2 ? 1924 : 2886}
                    height={index < 2 ? 1266 : 1899}
                    draggable={false}
                    key={frame}
                  />
                );
              })}
              {index === 2 && (
                <>
                  {/* SKEEP 웨이브/로고는 말풍선과 달리 처음부터 계속 떠 있는
                      고정 장식이다. 캐러셀 상태 배지는 프레임 바깥에서 공통 렌더링한다. */}
                  <div className={styles.moreVoiceHud} aria-hidden="true">
                    <div className={styles.moreSkeepBadge}>
                      <div className={styles.moreSkeepIcon}>
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className={styles.moreSkeepLogo}
                        src={`${BASE_PATH}/blueprint/usage/skeep-logo.png`}
                        alt=""
                        width={325}
                        height={150}
                      />
                    </div>
                  </div>
                  <p
                    className={`${styles.moreVoiceMessage} ${styles.moreVoiceMessageFirst}`}
                    data-visible={voicePhase >= 1}
                  >
                    스킵, 재설정 할게.
                  </p>
                  <p
                    className={`${styles.moreVoiceMessage} ${styles.moreVoiceMessageSecond}`}
                    data-visible={voicePhase >= 2}
                  >
                    환경리스트와 앵커리스트 중에 무엇을 설정하시겠어요?
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <span className={styles.moreInteractionBadge} aria-hidden="true">
        {MORE_SLIDES[activeIndex].badge}
      </span>

      <div className={styles.moreCarouselDots} aria-label="캐러셀 페이지">
        {MORE_SLIDES.map((slide, index) => (
          <button
            type="button"
            className={styles.moreCarouselDot}
            data-active={index === activeIndex}
            aria-label={`${index + 1}번째 이미지 보기`}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => moveTo(index)}
            key={slide.frames[0]}
          />
        ))}
      </div>
    </div>
  );
}

/* 예전엔 세 덩이를 같은 자리에 겹쳐 두고(300vh sticky 핀) 스크롤 진행도로
   한 번에 하나씩만 띄웠다 — 무빙스타일에서 스크롤마다 재계산이 버벅이는
   원인이라 걷어냈다. 이제는 그냥 세로로 순서대로 쌓아 두고, 각 덩이는 자기가
   화면에 보이는 동안에만(IntersectionObserver) 애니메이션·영상이 돈다. */
export default function UsageSequence({
  sections,
}: {
  sections: UsageSection[];
}) {
  const blockRefs = useRef<(HTMLElement | null)[]>([]);
  const [usageArtworkPhase, setUsageArtworkPhase] =
    useState<UsageArtworkPhase>("bubble");

  /* revealed: 한 번 보이면 계속 true(등장 모션은 한 번만). visible: 지금
     실제로 화면에 보이는지(연속 추적 — 영상·타이머 애니메이션은 이걸로 켜고 끈다). */
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    sections.map(() => false),
  );
  const [visible, setVisible] = useState<boolean[]>(() =>
    sections.map(() => false),
  );

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(sections.map(() => true));
      setVisible(sections.map(() => true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setVisible((previous) => {
          const next = [...previous];
          let changed = false;

          for (const entry of entries) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            const isVisible = entry.isIntersecting;

            if (next[index] !== isVisible) {
              next[index] = isVisible;
              changed = true;
            }
          }

          return changed ? next : previous;
        });

        setRevealed((previous) => {
          const next = [...previous];
          let changed = false;

          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }

            const index = Number((entry.target as HTMLElement).dataset.index);

            if (!next[index]) {
              next[index] = true;
              changed = true;
            }
          }

          return changed ? next : previous;
        });
      },
      { threshold: 0.4 },
    );

    for (const el of blockRefs.current) {
      if (el) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, [sections]);

  /* 검은 패널이 먼저 자리를 잡은 뒤 내부 말풍선을 별도로 켠다. 패널과 내부
     그래픽이 같은 프레임에 visible이 되면 내부 상승 모션이 패널 페이드에
     가려지므로 짧은 시차를 둔다. */
  const [environmentArtworkReady, setEnvironmentArtworkReady] = useState(false);

  useEffect(() => {
    const shouldShow = visible[0];
    const timer = window.setTimeout(
      () => setEnvironmentArtworkReady(shouldShow),
      shouldShow ? 320 : 0,
    );

    return () => window.clearTimeout(timer);
  }, [visible]);

  /* 말풍선과 워치 장면(정지 이미지)을 번갈아 보여준다. 워치 차례가 오면
     WATCH_HOLD_MS만큼 머문 뒤 다음 말풍선 차례로 넘어간다. 두 상태
     사이에는 짧은 퇴장 여백을 둔다. */
  useEffect(() => {
    const isActive = environmentArtworkReady && visible[0];

    if (!isActive) {
      const resetTimer = window.setTimeout(() => {
        setUsageArtworkPhase("bubble");
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    if (usageArtworkPhase === "bubble") {
      const timer = window.setTimeout(() => {
        setUsageArtworkPhase("bubbleExit");
      }, 550);

      return () => window.clearTimeout(timer);
    }

    if (usageArtworkPhase === "bubbleExit") {
      const timer = window.setTimeout(() => {
        setUsageArtworkPhase("watch");
      }, 300);

      return () => window.clearTimeout(timer);
    }

    if (usageArtworkPhase === "watchExit") {
      const timer = window.setTimeout(() => {
        setUsageArtworkPhase("bubble");
      }, 820);

      return () => window.clearTimeout(timer);
    }

    // "watch"는 이제 영상이 아니라 정지 이미지라 ended 이벤트가 없다 —
    // 영상이 재생되던 시간만큼(WATCH_HOLD_MS) 보여준 뒤 그냥 다음 단계로
    // 넘어간다. 무빙스타일의 영상 버퍼링/재생 실패 문제 자체가 없어졌다.
    const holdTimer = window.setTimeout(() => {
      setUsageArtworkPhase("watchExit");
    }, WATCH_HOLD_MS);

    return () => window.clearTimeout(holdTimer);
  }, [environmentArtworkReady, visible, usageArtworkPhase]);

  return (
    <div className={styles.usageTrack}>
      <div className={styles.usagePin}>
        {sections.map((section, index) => (
          <article
            className={`${styles.usageBlock} ${
              section.eyebrow === "Conversation"
                ? styles.usageBlockConversation
                : section.eyebrow === "More" ||
                    section.eyebrow === "Environmental Usage"
                  ? styles.usageBlockMore
                  : ""
            }`}
            key={section.eyebrow}
            data-index={index}
            ref={(el) => {
              blockRefs.current[index] = el;
            }}
          >
            <div
              className={
                section.eyebrow === "More"
                  ? `${styles.usagePanel} ${styles.usagePanelMore}`
                  : styles.usagePanel
              }
              data-reveal={revealed[index] ? "shown" : "hidden"}
            >
              {/* 첫 덩이만 시안에 실제 화면이 그려져 있다. 나머지 둘은 빈 판이다. */}
              {index === 0 && (
                <div className={styles.usageStage} aria-hidden="true">
                  {/* 예전엔 3초짜리 mp4였다 — 무빙스타일에서 버퍼링이 밀려 빈
                      원으로 보이거나 반복이 멈추는 문제가 있어 정지 이미지로
                      바꿨다. 말풍선↔이 장면이 번갈아 뜨는 인터랙션(단계 전환)
                      자체는 그대로 유지된다, WATCH_HOLD_MS 타이머로 대체됐을 뿐. */}
                  {/* width:%(+ aspect-ratio)를 img(대체 요소)에 직접 걸면 브라우저에
                      따라 세로로 길쭉해지는 경우가 있어, 정사각형 강제는 일반
                      div(비대체 요소)로 옮기고 img는 그 안을 100% 채우기만 한다 —
                      이 조합은 aspect-ratio 관련 예외 케이스가 없다. */}
                  <div
                    className={`${styles.usageArtwork} ${styles.usageArtworkCard}`}
                    data-visible={environmentArtworkReady && usageArtworkPhase === "watch"}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={styles.usageArtworkCardImg}
                      src={`${BASE_PATH}/blueprint/usage/luggage-arrival-watch-poster.webp`}
                      alt=""
                      width={640}
                      height={640}
                    />
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={`${styles.usageArtwork} ${styles.usageArtworkBubble}`}
                    src={`${BASE_PATH}/blueprint/usage/luggage-message.png`}
                    alt=""
                    width={1274}
                    height={267}
                    data-visible={environmentArtworkReady && usageArtworkPhase === "bubble"}
                  />
                </div>
              )}
              {/* 대화 덩이는 제공된 완성 프레임을 배경으로 쓰고, 흰색 상태 모션만
                  투명 배경 애니메이션 WebP로 분리해 얹는다. 예전엔 영상(mp4)
                  이었는데, 영상 코덱의 색공간/레인지 처리 때문에 배경(#181818)이
                  SVG 배경과 미묘하게 다른 값으로 렌더링돼 사각형 테두리가 층져
                  보이는 문제가 있었다 — 아예 배경을 투명하게 키잉해서(알파
                  채널) 색을 맞출 필요 자체를 없앴다. 정적 이미지라 재생 상태
                  관리(뷰포트 진입 시 play/pause)도 필요 없다. */}
              {section.eyebrow === "Conversation" && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.usageConversationBackground}
                    src={`${BASE_PATH}/blueprint/usage/conversation-background-v6.svg`}
                    alt=""
                    width={1924}
                    height={1266}
                    aria-hidden="true"
                  />
                  {/* 새 프레임의 화면 중앙 하단에 작은 상태 모션을 재생한다.
                      애니메이션 WebP를 못 읽는(오래된 TV/임베디드 브라우저 등)
                      환경을 위해 같은 배경-투명 PNG 정지 프레임을 폴백으로 둔다
                      — 애니메이션은 없어도 최소한 안 보이거나 깨져 보이진 않는다. */}
                  <div className={styles.usageStatusMorph}>
                    <picture>
                      <source
                        srcSet={`${BASE_PATH}/blueprint/usage/conversation-icon-dark.webp`}
                        type="image/webp"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className={styles.usageStatusMorphDot}
                        src={`${BASE_PATH}/blueprint/usage/conversation-icon-dark-fallback.png`}
                        alt=""
                        width={780}
                        height={780}
                        aria-hidden="true"
                      />
                    </picture>
                  </div>
                </>
              )}
              {section.eyebrow === "More" && <MoreCarousel />}
            </div>

            <div
              className={styles.usageCopy}
              data-reveal={revealed[index] ? "shown" : "hidden"}
            >
              <span>{section.eyebrow}</span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              {section.note && <small className={styles.usageNote}>* {section.note}</small>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
