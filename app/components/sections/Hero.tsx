"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Hero.module.css";

const KEYWORDS = ["Focus", "Meet", "Travel", "Rest"];

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const KEYWORD_VIDEOS: Record<string, string | null> = {
  Focus: `${BASE_PATH}/hero/focus.mp4`,
  Meet: `${BASE_PATH}/hero/meet.mp4`,
  Travel: `${BASE_PATH}/hero/travel.mp4`,
  Rest: `${BASE_PATH}/hero/rest.mp4`,
};

// 무빙스타일(무스, Tizen)에선 <video>가 재생/렌더되지 않아 빈 화면이 된다.
// poster 정지 프레임(실루엣)을 넣어 영상이 안 떠도 배경이 보이게 한다.
const KEYWORD_POSTERS: Record<string, string> = {
  Focus: `${BASE_PATH}/hero/focus.poster.jpg`,
  Meet: `${BASE_PATH}/hero/meet.poster.jpg`,
  Travel: `${BASE_PATH}/hero/travel.poster.jpg`,
  Rest: `${BASE_PATH}/hero/rest.poster.jpg`,
};

type VideoLayout = "full" | "inset";

const KEYWORD_LAYOUT: Record<string, VideoLayout> = {
  Focus: "full",
  Meet: "inset",
  Travel: "full",
  Rest: "full",
};

const KEYWORD_TILT_DEG: Record<string, number> = {};

const ENTER_TRANSITION = "scale 0.9s cubic-bezier(0.16, 1, 0.3, 1)";
const LEAVE_TRANSITION = "scale 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
const NO_TRANSITION = "none";

// Keyword pairs that should cut instantly with no scale/fade animation.
// Only Focus -> Meet keeps the smooth scale transition; every other pair cuts.
const SILENT_PAIRS: Array<[string, string]> = [
  ["Meet", "Travel"],
  ["Travel", "Rest"],
  ["Rest", "Focus"],
];

const TYPING_SPEED_MS = 90;
const DELETING_SPEED_MS = 50;
const PAUSE_AFTER_TYPE_MS = 1200;
const PAUSE_AFTER_DELETE_MS = 300;

const PRE_ROLL_MS = 1000;
const INTRO_HOLD_MS = 300;
const INTRO_SHRINK_MS = 900;
const INTRO_HANDOFF_MS = 140;

// How long each keyword stays "current" (typing + pause + deleting + gap),
// matching useTypewriter's own timing so the next clip can be pre-rolled.
const CYCLE_DURATION_MS: Record<string, number> = Object.fromEntries(
  KEYWORDS.map((word) => [
    word,
    word.length * TYPING_SPEED_MS +
      PAUSE_AFTER_TYPE_MS +
      word.length * DELETING_SPEED_MS +
      PAUSE_AFTER_DELETE_MS,
  ])
);

// Chromium can abort the network fetch for <video> elements that are still
// hidden (opacity: 0) shortly after they mount, leaving them in a permanent
// "no supported sources" error state. Recover by reloading the source and
// retrying once the browser reports it's ready to play.
function playVideo(el: HTMLVideoElement) {
  el.play().catch(() => {
    const onCanPlay = () => {
      el.removeEventListener("canplay", onCanPlay);
      el.play().catch(() => {});
    };
    el.addEventListener("canplay", onCanPlay);
    el.load();
  });
}

function useTypewriter(words: string[], enabled: boolean) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    if (!enabled) return;

    const word = words[wordIndex];

    if (phase === "typing") {
      if (text.length < word.length) {
        const id = setTimeout(() => setText(word.slice(0, text.length + 1)), TYPING_SPEED_MS);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setPhase("pausing"), PAUSE_AFTER_TYPE_MS);
      return () => clearTimeout(id);
    }

    if (phase === "pausing") {
      const id = setTimeout(() => setPhase("deleting"), 0);
      return () => clearTimeout(id);
    }

    if (text.length > 0) {
      const id = setTimeout(() => setText(word.slice(0, text.length - 1)), DELETING_SPEED_MS);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setWordIndex((i) => (i + 1) % words.length);
      setPhase("typing");
    }, PAUSE_AFTER_DELETE_MS);
    return () => clearTimeout(id);
  }, [enabled, phase, text, wordIndex, words]);

  return { text, wordIndex };
}

export function Hero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [introSettled, setIntroSettled] = useState(false);
  const [cubeReady, setCubeReady] = useState(false);
  const [introHandedOff, setIntroHandedOff] = useState(false);
  const videoRefs = useRef<Partial<Record<string, HTMLVideoElement>>>({});
  // Stable per-word ref callbacks so React doesn't detach/reattach the video
  // refs on every re-render (this component re-renders on every typed
  // character, since typedText lives in the same tree).
  const videoRefCallbacks = useMemo(() => {
    const cache: Partial<Record<string, (el: HTMLVideoElement | null) => void>> = {};
    for (const word of KEYWORDS) {
      cache[word] = (el) => {
        videoRefs.current[word] = el ?? undefined;
      };
    }
    return cache;
  }, []);
  // Start the first "Focus" immediately. Cube readiness only gates the 3D
  // rotation; tying the typewriter to it delayed the first character until
  // the 1.2s intro shrink had completely finished.
  const { text: typedText, wordIndex } = useTypewriter(KEYWORDS, true);

  // Start with the Focus face filling the viewport, hold briefly, then shrink
  // into the resting cube size. Cube rotation stays paused until the intro
  // finishes, while the first keyword begins typing immediately.
  useEffect(() => {
    const shrinkTimer = window.setTimeout(
      () => setIntroSettled(true),
      INTRO_HOLD_MS
    );
    const cubeTimer = window.setTimeout(
      () => setCubeReady(true),
      INTRO_HOLD_MS + INTRO_SHRINK_MS
    );
    // Keep the shrunken Focus poster above the already-visible first cube face
    // for a few frames. Removing it in the same frame as cube activation can
    // expose a blank compositor frame on Samsung Moving Style/Tizen.
    const handoffTimer = window.setTimeout(
      () => setIntroHandedOff(true),
      INTRO_HOLD_MS + INTRO_SHRINK_MS + INTRO_HANDOFF_MS
    );

    return () => {
      window.clearTimeout(shrinkTimer);
      window.clearTimeout(cubeTimer);
      window.clearTimeout(handoffTimer);
    };
  }, []);

  // 배경 큐브: 타이핑 단어가 바뀔 때마다 옆으로(rotateY) -90° 회전. 4면 = 실루엣 4장.
  // 순수 CSS 3D transform → 무빙스타일(무스)에서도 렌더 (canvas/WebGL/framer-motion 없음).
  const [cubeRotY, setCubeRotY] = useState(0);
  const prevWordRef = useRef(wordIndex);
  useEffect(() => {
    if (!cubeReady) return;
    if (wordIndex !== prevWordRef.current) {
      prevWordRef.current = wordIndex;
      setCubeRotY((r) => r - 90);
    }
  }, [cubeReady, wordIndex]);

  useEffect(() => {
    const currentWord = KEYWORDS[wordIndex];
    const currentEl = videoRefs.current[currentWord];
    // Only cold-start from 0 if it wasn't already pre-rolling; otherwise let
    // it keep playing from wherever the pre-roll left off.
    if (currentEl && currentEl.paused) {
      currentEl.currentTime = 0;
      playVideo(currentEl);
    }

    const previousIndex = (wordIndex - 1 + KEYWORDS.length) % KEYWORDS.length;
    const previousWord = KEYWORDS[previousIndex];
    if (previousWord !== currentWord) {
      videoRefs.current[previousWord]?.pause();
    }

    const preRollDelay = Math.max(CYCLE_DURATION_MS[currentWord] - PRE_ROLL_MS, 0);
    const nextWord = KEYWORDS[(wordIndex + 1) % KEYWORDS.length];
    const timer = setTimeout(() => {
      const nextEl = videoRefs.current[nextWord];
      if (nextEl) {
        nextEl.currentTime = 0;
        playVideo(nextEl);
      }
    }, preRollDelay);

    return () => clearTimeout(timer);
  }, [wordIndex]);

  const [renderedIndex, setRenderedIndex] = useState(wordIndex);
  const [prevWordIndex, setPrevWordIndex] = useState(wordIndex);
  if (wordIndex !== renderedIndex) {
    setPrevWordIndex(renderedIndex);
    setRenderedIndex(wordIndex);
  }

  const previousWord = KEYWORDS[prevWordIndex];
  const currentWord = KEYWORDS[wordIndex];
  const isSilentTransition = SILENT_PAIRS.some(
    ([from, to]) => from === previousWord && to === currentWord
  );

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.section}>
        <div
          className={`${styles.introPoster} ${
            introSettled ? styles.introPosterShrunk : ""
          } ${introHandedOff ? styles.introPosterHandedOff : ""}`}
          aria-hidden="true"
        >
          <img
            className={styles.introPosterImg}
            src={KEYWORD_POSTERS.Focus}
            alt=""
            draggable={false}
            loading="eager"
            fetchPriority="high"
          />
        </div>
        {/* 배경: 옆으로 도는 3D 큐브 (실루엣 4면). 순수 CSS 3D → 무스 호환.
            영상 버전은 백업 레포(skeep-combined-video)에 보존. */}
        <div
          className={`${styles.cubeScene} ${
            cubeReady ? styles.cubeSceneReady : styles.cubeSceneHidden
          }`}
          aria-hidden="true"
        >
          <div
            className={styles.cube}
            style={{
              transform: `translateZ(calc(-1 * var(--cube-half))) rotateY(${cubeRotY}deg)`,
            }}
          >
            {KEYWORDS.map((word, i) => (
              <div
                key={word}
                className={styles.cubeFace}
                style={{
                  transform: `rotateY(${i * 90}deg) translateZ(var(--cube-half))`,
                }}
              >
                <img
                  className={styles.cubeImg}
                  src={KEYWORD_POSTERS[word]}
                  alt=""
                  draggable={false}
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              </div>
            ))}
          </div>
        </div>
        <motion.p className={styles.heading} style={{ opacity, scale }}>
          <span>{"When you need "}</span>
          <span className={styles.keyword}>{typedText}</span>
          <span className={styles.cursor}>|</span>
        </motion.p>
      </div>
    </div>
  );
}
