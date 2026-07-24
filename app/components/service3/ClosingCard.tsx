"use client";

import { useState } from "react";
import { Reveal } from "../ui/Reveal";
import styles from "./ClosingCard.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function ClosingCard() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section className={styles.section}>
      <Reveal className={styles.reveal}>
        <img
          className={styles.bgPoster}
          src={`${BASE_PATH}/service3/closing-bg.poster.jpg`}
          alt=""
          aria-hidden="true"
        />
        <video
          className={`${styles.bgVideo} ${videoReady ? styles.bgVideoReady : ""}`}
          src={`${BASE_PATH}/service3/closing-bg.mp4?v=20260723`}
          poster={`${BASE_PATH}/service3/closing-bg.poster.jpg`}
          preload="metadata"
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
        />
        <div className={styles.mediaDim} aria-hidden="true" />
        <div className={styles.textBlock}>
          <h2 className={styles.heading}>
            쓰면 쓸수록
            <br />
            사용자를 더 깊게
          </h2>
          <p className={styles.body}>
            사용자의 모든 경험은 더 나은 환경을 위한 데이터가 됩니다.
            <br />
            반복될수록 더 매끄러운 경험, 가장 나다운 SKEEP을 만나보세요!
          </p>
        </div>
      </Reveal>
    </section>
  );
}
