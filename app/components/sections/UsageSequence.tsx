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

/* 넘어가는 지점. 되돌아오는 지점을 조금 앞에 둬서 경계에서 떨리지 않게 한다. */
const forwardThresholds = [0.34, 0.67];
const reverseThresholds = [0.28, 0.61];

type UsageArtworkPhase = "bubble" | "bubbleExit" | "watch" | "watchExit";

const MORE_SLIDES = [
  {
    frames: [
      "more-long-click.png",
      "more-long-click-1.png",
      "more-long-click-2.png",
      "more-long-click-3.png",
    ],
    alt: "Long click interaction",
  },
  {
    frames: [
      "more-long-touch.png",
      "more-long-touch-1.png",
      "more-long-touch-2.png",
      "more-long-touch-3.png",
    ],
    alt: "Long touch interaction",
  },
  { frames: ["more-voice.png"], alt: "Voice interaction" },
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
                    width={index === 0 || index === 1 ? 1924 : 2886}
                    height={index === 0 || index === 1 ? 1266 : 1899}
                    draggable={false}
                    key={frame}
                  />
                );
              })}
              {index === 0 && (
                /* voice 배지와 같은 위치·양식의 태그 — 프레임 이미지엔 더 이상
                   태그가 박혀 있지 않아 여기서 얹는다. */
                <div className={styles.moreVoiceHud} aria-hidden="true">
                  <span className={styles.moreVoicePill}>long click</span>
                </div>
              )}
              {index === 1 && (
                <div className={styles.moreVoiceHud} aria-hidden="true">
                  <span className={styles.moreVoicePill}>long touch</span>
                </div>
              )}
              {index === 2 && (
                <>
                  {/* 시안(Figma 8262-28287): voice 배지 + SKEEP 웨이브/로고는
                      말풍선과 달리 처음부터 계속 떠 있는 고정 장식이다. */}
                  <div className={styles.moreVoiceHud} aria-hidden="true">
                    <span className={styles.moreVoicePill}>voice</span>
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

/* 세 덩이를 같은 자리에 겹쳐 두고, 스크롤에 따라 한 번에 하나씩만 띄운다. */
export default function UsageSequence({
  sections,
}: {
  sections: UsageSection[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const watchVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeUsageIndex, setActiveUsageIndex] = useState(0);
  const [usageArtworkPhase, setUsageArtworkPhase] =
    useState<UsageArtworkPhase>("bubble");
  const conversationIndex = sections.findIndex(
    (section) => section.eyebrow === "Conversation",
  );

  /* "환경 사용 알람"(index 0) 판/카피가 아래에서 위로 떠오르며 한 번만 나타난다.
     이 셋은 usagePin 안에서 같은 칸에 겹쳐 있어(grid-area: 1/1) 화면에 보이는
     시점 = usageTrack이 스크롤로 뷰포트에 들어오는 시점과 같다. Reveal(프레임
     모션)의 1.2초 안전장치용 fallback 타이머를 썼더니, 페이지 로드 후 스크롤로
     여기 도착하기까지 항상 1.2초가 더 걸려서 도착했을 땐 이미 타이머가 먼저
     끝나 애니메이션 없이 다 켜져 있었다 — 그래서 순수 IntersectionObserver로
     실제로 뷰포트에 들어오는 순간에만 켠다. */
  const [environmentUsageShown, setEnvironmentUsageShown] = useState(false);
  const [environmentArtworkReady, setEnvironmentArtworkReady] = useState(false);
  const environmentUsageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = environmentUsageRef.current;

    if (!el) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const fallbackTimer = window.setTimeout(() => {
        setEnvironmentUsageShown(true);
      }, 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setEnvironmentUsageShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* 검은 패널이 먼저 자리를 잡은 뒤 내부 말풍선을 별도로 켠다. 패널과 내부
     그래픽이 같은 프레임에 visible이 되면 내부 상승 모션이 패널 페이드에
     가려지므로 짧은 시차를 둔다. */
  useEffect(() => {
    const shouldShow = environmentUsageShown && activeUsageIndex === 0;
    const timer = window.setTimeout(
      () => setEnvironmentArtworkReady(shouldShow),
      shouldShow ? 320 : 0,
    );

    return () => window.clearTimeout(timer);
  }, [activeUsageIndex, environmentUsageShown]);

  /* React의 muted 속성만으로는 DOM 프로퍼티가 제때 안 걸려서 브라우저가
     자동재생을 막는다. 직접 세워 둔다. */
  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.muted = true;
    }
  }, []);

  /* 말풍선과 워치 영상을 실제 상태로 교대한다. 워치 차례가 올 때마다 재생
     위치를 0초로 되돌리고, 3초 영상의 ended 이벤트가 온 뒤에만 다음
     말풍선 차례로 넘어간다. 두 상태 사이에는 짧은 퇴장 여백을 둔다. */
  useEffect(() => {
    const video = watchVideoRef.current;
    const isActive = environmentArtworkReady && activeUsageIndex === 0;

    if (!isActive) {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      const resetTimer = window.setTimeout(() => {
        setUsageArtworkPhase("bubble");
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    if (usageArtworkPhase === "bubble") {
      const timer = window.setTimeout(() => {
        setUsageArtworkPhase("bubbleExit");
      }, 1400);

      return () => window.clearTimeout(timer);
    }

    if (usageArtworkPhase === "bubbleExit") {
      const timer = window.setTimeout(() => {
        setUsageArtworkPhase("watch");
      }, 820);

      return () => window.clearTimeout(timer);
    }

    if (usageArtworkPhase === "watchExit") {
      const timer = window.setTimeout(() => {
        setUsageArtworkPhase("bubble");
      }, 820);

      return () => window.clearTimeout(timer);
    }

    if (video) {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
      video.play().catch(() => {
        window.setTimeout(() => {
          if (video.paused) {
            video.play().catch(() => {});
          }
        }, 160);
      });
    }
  }, [activeUsageIndex, environmentArtworkReady, usageArtworkPhase]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    let frame = 0;
    let step = 0;

    const render = () => {
      frame = 0;

      const rect = track.getBoundingClientRect();
      const distance = Math.max(1, track.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));

      while (
        step < forwardThresholds.length &&
        progress >= forwardThresholds[step]
      ) {
        step += 1;
      }

      while (step > 0 && progress <= reverseThresholds[step - 1]) {
        step -= 1;
      }

      const next = String(step);

      if (track.dataset.step !== next) {
        track.dataset.step = next;
        setActiveUsageIndex(step);
      }

      /* 안 보이는 동안 브라우저가 재생을 멈춰 버리므로, 해당 덩이가 떠 있을 때만
         돌린다. 보이지 않을 때 굳이 디코딩하지 않아 기기 부담도 준다. */
      const video = videoRef.current;

      if (video) {
        if (step === conversationIndex) {
          if (video.paused) {
            video.muted = true;
            /* 빠르게 스크롤하면 이 play()가 직전 pause()와 겹쳐 실패할 때가 있다.
               그대로 두면 다음 스크롤 이벤트 전까지 영영 정지 화면에 머문다 —
               같은 장면에 여전히 머물러 있을 때만 한 번 더 시도한다. */
            video.play().catch(() => {
              window.setTimeout(() => {
                if (step === conversationIndex && video.paused) {
                  video.play().catch(() => {});
                }
              }, 200);
            });
          }
        } else if (!video.paused) {
          video.pause();
        }
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
  }, [conversationIndex]);

  return (
    <div ref={trackRef} className={styles.usageTrack} data-step="0">
      <div className={styles.usagePin}>
        {sections.map((section, index) => (
          <article
            className={styles.usageBlock}
            key={section.eyebrow}
            data-index={index}
          >
            <div
              className={styles.usagePanel}
              ref={index === 0 ? environmentUsageRef : undefined}
              data-reveal={index === 0 ? (environmentUsageShown ? "shown" : "hidden") : undefined}
            >
              {/* 첫 덩이만 시안에 실제 화면이 그려져 있다. 나머지 둘은 빈 판이다. */}
              {index === 0 && (
                <div className={styles.usageStage} aria-hidden="true">
                  <video
                    ref={watchVideoRef}
                    className={`${styles.usageArtwork} ${styles.usageArtworkCard}`}
                    src={`${BASE_PATH}/blueprint/usage/luggage-arrival-watch.mp4`}
                    data-visible={environmentArtworkReady && usageArtworkPhase === "watch"}
                    muted
                    playsInline
                    preload="auto"
                    onEnded={() => setUsageArtworkPhase("watchExit")}
                    aria-hidden="true"
                  />
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
                  투명 WebM 레이어로 분리해 얹는다. */}
              {section.eyebrow === "Conversation" && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.usageConversationBackground}
                    src={`${BASE_PATH}/blueprint/usage/conversation-background-v4.png`}
                    alt=""
                    width={1924}
                    height={1266}
                    aria-hidden="true"
                  />
                  {/* 원본 영상에서 알파채널로 추출한 흰색 상태 모션만 재생한다. */}
                  <div className={styles.usageStatusMorph}>
                    <video
                      ref={videoRef}
                      className={styles.usageStatusMorphDot}
                      src={`${BASE_PATH}/blueprint/usage/conversation-icon-alpha.webm`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      aria-hidden="true"
                    />
                  </div>
                </>
              )}
              {section.eyebrow === "More" && <MoreCarousel />}
            </div>

            <div
              className={styles.usageCopy}
              data-reveal={index === 0 ? (environmentUsageShown ? "shown" : "hidden") : undefined}
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
