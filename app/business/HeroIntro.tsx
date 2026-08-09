"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroIntro.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* 넘어가는 지점. 되돌아오는 지점을 조금 앞에 둬서 경계에서 떨리지 않게 한다.
   0단계는 원래 카피, 1단계는 한글↔영문 크기가 뒤바뀌는 카피 스왑, 2단계에서
   히어로가 블러로 흩어지며 밴드 장면으로 넘어간다. */
const forwardThresholds = [0.08, 0.34];
const reverseThresholds = [0.04, 0.26];

/* 세 단어를 겹쳐 두고 폭을 맞추는 대신, 매 순간 하나만 그린다.
   폭을 재서 맞출 필요가 없어져 "을" 앞에 뜨는 빈틈이 아예 생기지 않는다. */
const ROTATING_WORDS = ["경험", "공간", "시간"] as const;

export default function HeroIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWordIndex(ROTATING_WORDS.length - 1);
      return;
    }

    const timer = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % ROTATING_WORDS.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    let frame = 0;
    let step = 0;
    let bandPlayed = false;
    let initialized = false;
    let revealTimer = 0;
    let exitTimer = 0;
    let swapTimer = 0;
    /* 카피가 뒤바뀐 1단계는 최소 1초는 머물러야 한다 — 가만히 있어도, 빠르게
       더 스크롤해도 마찬가지다. 1초를 채우기 전에는 2단계(밴드)로 못 넘어간다. */
    let swapReady = false;

    const armSwapTimer = () => {
      if (swapTimer || swapReady) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      swapTimer = window.setTimeout(
        () => {
          swapTimer = 0;
          swapReady = true;
          requestRender();
        },
        reduceMotion ? 0 : 1000,
      );
    };

    const playBandOnce = () => {
      if (bandPlayed) {
        return;
      }

      bandPlayed = true;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      section.dataset.bandState = "ready";
      revealTimer = window.setTimeout(() => {
        section.dataset.bandState = "playing";
      }, reduceMotion ? 0 : 80);

      exitTimer = window.setTimeout(
        () => {
          section.dataset.bandState = "done";

          /* 모프가 충분히 끝난 뒤에만 다음 섹션으로 넘긴다. 재생 중 사용자가 이미
             내려갔으면 현재 위치를 다시 끌어올리지 않는다. */
          const rect = section.getBoundingClientRect();

          if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
            return;
          }

          section.nextElementSibling?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        },
        reduceMotion ? 220 : 2100,
      );
    };

    const render = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));

      while (
        step < forwardThresholds.length &&
        progress >= forwardThresholds[step]
      ) {
        /* 1단계에서 2단계로 넘어가려는 순간마다 걸린다 — 가만히 있어도, 빠르게
           스크롤해서 한 번에 지나치려 해도 최소 1초는 채워야 한다. */
        if (step === 1 && !swapReady) {
          armSwapTimer();
          break;
        }

        step += 1;
      }

      while (step > 0 && progress <= reverseThresholds[step - 1]) {
        step -= 1;
      }

      if (step < 1) {
        swapReady = false;

        if (swapTimer) {
          window.clearTimeout(swapTimer);
          swapTimer = 0;
        }
      } else if (step === 1) {
        armSwapTimer();
      }

      const next = String(step);

      if (section.dataset.step !== next) {
        section.dataset.step = next;
      }

      /* 브라우저가 스크롤 위치를 복원하거나 앵커로 들어오면 첫 계산부터 진행도가 1이라
         곧바로 마지막 장면으로 판정되고, 그 끝의 자동 스크롤이 사용자를 페이지 맨 위로
         끌어올려 버렸다. 처음부터 지나쳐 있었으면 재생한 것으로 치고 넘어간다. */
      if (!initialized) {
        initialized = true;

        if (step === 2) {
          swapReady = true;
          bandPlayed = true;
          section.dataset.bandState = "done";
        }
      }

      if (step === 2) {
        playBandOnce();
      }
    };

    const requestRender = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(render);
      }
    };

    /* 밴드 모션("끊 ▮ 임없는 도전 정신")이 다 펼쳐지기 전에 스크롤로 이 구간을
       지나쳐 버리면, sticky가 풀리며 모션이 끝나기도 전에 다음 섹션이 밀고
       올라온다 — 그래서 재생 중(step 2, bandState가 done이 아닐 때)에는
       아래 방향 스크롤만 막는다. 위로 되돌아가는 건 그대로 둔다. */
    const isBandLocked = () =>
      section.dataset.step === "2" && section.dataset.bandState !== "done";

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && isBandLocked()) {
        event.preventDefault();
      }
    };

    let touchStartY: number | null = null;

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY == null) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? touchStartY;

      if (touchStartY - currentY > 0 && isBandLocked()) {
        event.preventDefault();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const down =
        event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ";

      if (down && isBandLocked()) {
        event.preventDefault();
      }
    };

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    render();

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.clearTimeout(revealTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(swapTimer);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.sequence}
      data-step="0"
      data-band-state="idle"
      aria-label="Skeep 소개"
    >
      <div className={styles.sticky}>
        <div className={`${styles.scene} ${styles.hero}`}>
          {/* 프린시플 히어로의 회전 큐브와 같은 방식이되 축만 세로다.
              단어 하나에 사진 하나가 고정으로 붙도록 여섯 면짜리 기둥에 세 장을
              두 번씩 돌려 붙였다. 한 박자(2초)마다 60도씩 돈다. */}
          <div className={styles.backdrop} aria-hidden="true">
            <div className={styles.cube}>
              {[1, 2, 3, 1, 2, 3].map((source, face) => (
                <div key={face} className={styles.cubeFace} data-face={face}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${BASE_PATH}/business/hero-words/word-${source}.webp`}
                    alt=""
                    loading="eager"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.copy}>
            <h2>
              세상 모든
              <span
                key={wordIndex}
                className={styles.rotatingWord}
                aria-label="경험, 공간, 시간"
              >
                {ROTATING_WORDS[wordIndex]}
              </span>
              을 연결해온
            </h2>
            <p>Migratable Agent, Skeep</p>
          </div>
        </div>

        <div className={`${styles.scene} ${styles.band}`}>
          <p>
            <strong>끊</strong>
            <span className={styles.mediaSlot} aria-hidden="true" />
            <strong>임없는 도전 정신</strong>
          </p>
          <span className={styles.bandHint}>다음으로 넘어갑니다</span>
        </div>
      </div>
    </section>
  );
}
