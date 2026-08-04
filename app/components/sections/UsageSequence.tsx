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
    frames: ["more-long-touch.png", "more-long-touch-1.png"],
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
                    width={2886}
                    height={1899}
                    draggable={false}
                    key={frame}
                  />
                );
              })}
              {index === 2 && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={`${styles.moreVoiceMessage} ${styles.moreVoiceMessageFirst}`}
                    data-visible={voicePhase >= 1}
                    src={`${BASE_PATH}/blueprint/usage/more-voice-message-1.png`}
                    alt="스킵, 재설정 할게. 스킵, 자세히 보기 알려줘."
                    width={1806}
                    height={578}
                    draggable={false}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={`${styles.moreVoiceMessage} ${styles.moreVoiceMessageSecond}`}
                    data-visible={voicePhase >= 2}
                    src={`${BASE_PATH}/blueprint/usage/more-voice-message-2.png`}
                    alt="앵커리스트와 환경리스트중에 무엇부터 설정하시겠어요?"
                    width={1779}
                    height={578}
                    draggable={false}
                  />
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const conversationIndex = sections.findIndex(
    (section) => section.eyebrow === "Conversation",
  );

  /* React의 muted 속성만으로는 DOM 프로퍼티가 제때 안 걸려서 브라우저가
     자동재생을 막는다. 직접 세워 둔다. */
  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.muted = true;
    }
  }, []);

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
            <div className={styles.usagePanel}>
              {/* 첫 덩이만 시안에 실제 화면이 그려져 있다. 나머지 둘은 빈 판이다. */}
              {index === 0 && (
                <div className={styles.usageStage} aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={`${styles.usageArtwork} ${styles.usageArtworkCard}`}
                    src={`${BASE_PATH}/blueprint/usage/luggage-arrival.png`}
                    alt=""
                    width={1271}
                    height={1271}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={`${styles.usageArtwork} ${styles.usageArtworkBubble}`}
                    src={`${BASE_PATH}/blueprint/usage/luggage-message.png`}
                    alt=""
                    width={1274}
                    height={267}
                  />
                </div>
              )}
              {/* 대화 덩이에는 화면 녹화 영상이 들어간다. */}
              {section.eyebrow === "Conversation" && (
                <video
                  ref={videoRef}
                  className={styles.usageVideo}
                  src={`${BASE_PATH}/blueprint/usage/conversation.mp4`}
                  poster={`${BASE_PATH}/blueprint/usage/conversation-poster.jpg`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />
              )}
              {section.eyebrow === "More" && <MoreCarousel />}
            </div>

            <div className={styles.usageCopy}>
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
