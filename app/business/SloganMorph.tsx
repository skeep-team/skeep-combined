"use client";

import { useEffect, useRef } from "react";
import styles from "./SloganMorph.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* 한 줄이 네 박자로 변한다.
   0  SKIP THE INTRO, KEEP THE FLOW
   1  the intro / the flow 가 윤곽선으로 빠짐 (SKIP·KEEP만 남아 보임)
   2  IP·K와 빠진 말이 폭 0으로 접히며 SK + EEP = SKEEP, to the future가 열림
   3  to the future도 채워져 SKEEP TO THE FUTURE

   SKIP의 "SK"와 KEEP의 "EEP"이 그대로 이어붙어 SKEEP이 되는 게 이 연출의 핵심이라,
   두 단어를 남는 조각과 사라지는 조각으로 쪼개 두었다. */
const CHUNKS = [
  { key: "sk", text: "SK" },
  { key: "ip", text: "IP", drop: true },
  { key: "intro", text: " THE INTRO,", fade: true, drop: true },
  { key: "k", text: " K", drop: true },
  { key: "eep", text: "EEP" },
  { key: "flow", text: " THE FLOW", fade: true, drop: true },
  { key: "future", text: " TO THE FUTURE", future: true },
] as const;

/* 스크롤을 굴려 넘기는 게 아니라, 화면에 들어오면 알아서 순서대로 넘어간다.
   앞 박자의 전환(폭 720ms / 페이드 420ms)이 끝난 뒤 다음 박자가 시작되도록 잡았다. */
const beats = [700, 1600, 2500];

export default function SloganMorph() {
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);

  /* 조각을 폭 0으로 접으려면 원래 폭을 px로 알아야 한다(auto → 0은 전환되지 않는다).
     지금 접혀 있든 아니든 정확히 재도록 잠깐 auto로 되돌려 재고 곧바로 물린다.
     같은 동기 블록 안이라 중간 프레임이 그려지지 않아 깜빡이지 않는다. */
  useEffect(() => {
    const line = lineRef.current;

    if (!line) {
      return;
    }

    const measure = () => {
      const chunks = line.querySelectorAll<HTMLElement>("[data-chunk]");

      for (const chunk of chunks) {
        chunk.style.width = "auto";
        const width = chunk.getBoundingClientRect().width;
        chunk.style.removeProperty("width");
        /* .chunk는 overflow:hidden이라, 잰 폭이 실제 글자 잉크보다 아주 조금이라도
           좁으면(서브픽셀 반올림 등) 마지막 글자가 잘려 보인다. 여유를 살짝 더 준다. */
        chunk.style.setProperty("--w", `${(width + 3).toFixed(2)}px`);
      }

      line.dataset.measured = "true";
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);

    /* 폰트가 늦게 붙으면 폭이 달라진다. */
    document.fonts?.ready.then(measure).catch(() => {});

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const line = lineRef.current;

    if (!stage || !line) {
      return;
    }

    let frame = 0;
    let played = false;
    const timers: number[] = [];

    /* 한 번 시작하면 끝까지 재생하고 되돌리지 않는다. */
    const play = () => {
      if (played) {
        return;
      }

      played = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        stage.dataset.step = "3";
        return;
      }

      beats.forEach((delay, index) => {
        timers.push(
          window.setTimeout(() => {
            stage.dataset.step = String(index + 1);
          }, delay),
        );
      });
    };

    const sync = () => {
      frame = 0;

      const rect = stage.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      const middle = window.innerHeight / 2;

      /* 글줄이 화면 한가운데에 왔을 때 시작한다. 화면에 걸치자마자 시작하면
         아직 올라오는 동안 재생이 다 끝나서, 정작 도착했을 때는 마지막 문장만 남는다. */
      if (
        Math.abs(lineRect.top + lineRect.height / 2 - middle) <
        window.innerHeight * 0.22
      ) {
        play();
      }

      /* 목차 바는 이 구간이 화면을 다 덮는 동안만 감춘다 — 여긴 글줄 하나만 남긴다. */
      const covered = rect.top <= 0 && rect.bottom >= window.innerHeight;
      const root = document.documentElement;

      if (covered) {
        root.dataset.businessTabs = "hidden";
      } else if (root.dataset.businessTabs) {
        delete root.dataset.businessTabs;
      }
    };

    const requestSync = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(sync);
      }
    };

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    sync();

    return () => {
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      for (const timer of timers) {
        window.clearTimeout(timer);
      }

      delete document.documentElement.dataset.businessTabs;
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.stage} data-step="0">
      <div className={styles.pin}>
        <div className={styles.bg} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_PATH}/business/slogan/business-future-rocket.png`}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <p
          ref={lineRef}
          className={styles.line}
          aria-label="Skip the intro, Keep the flow. Skeep to the future."
        >
          {CHUNKS.map((chunk) => (
            <span
              key={chunk.key}
              data-chunk={chunk.key}
              data-drop={"drop" in chunk ? "true" : undefined}
              data-fade={"fade" in chunk ? "true" : undefined}
              data-future={"future" in chunk ? "true" : undefined}
              className={styles.chunk}
              aria-hidden="true"
            >
              {chunk.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
