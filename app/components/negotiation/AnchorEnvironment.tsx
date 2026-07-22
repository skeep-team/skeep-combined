"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./AnchorEnvironment.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function AnchorEnvironment() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const ensurePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const rect = video.getBoundingClientRect();
    const isNearViewport = rect.bottom > -window.innerHeight && rect.top < window.innerHeight * 2;
    if (!isNearViewport || !video.paused) return;

    video.muted = true;
    void video.play().catch(() => {
      // The poster remains visible if an embedded browser still refuses
      // autoplay. A following scroll/visibility event retries playback.
    });
  }, []);

  useEffect(() => {
    const retry = window.setInterval(ensurePlayback, 1800);
    window.addEventListener("scroll", ensurePlayback, { passive: true });
    document.addEventListener("visibilitychange", ensurePlayback);
    ensurePlayback();

    return () => {
      window.clearInterval(retry);
      window.removeEventListener("scroll", ensurePlayback);
      document.removeEventListener("visibilitychange", ensurePlayback);
    };
  }, [ensurePlayback]);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Environment States</p>
      </div>
      <div className={styles.textBlock}>
        <h2 className={styles.heading}>
          앵커 지정
          <br />: Anchor on
        </h2>
        <p className={styles.body}>
          사용자가 소유한 환경을 앵커 환경으로 지정하면, 환경에 SKEEP을
          부여해 사용자의 규칙을 설정하고 관리할 수 있습니다. 만약 당신이
          카페 사장님이라면, 카페를 &apos;앵커 환경&apos;으로 지정해보세요.
          당신이 없는 순간에도 SKEEP이 공간의 규칙을 세심하게 관리합니다.
          당신은 온전히 당신의 시간에만 집중하세요.
        </p>
      </div>
      <div className={styles.box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.boxPoster}
          src={`${BASE_PATH}/negotiation/anchor-environment.poster.jpg`}
          alt="다양한 제품이 양쪽으로 흐르는 장면"
        />
        <video
          ref={videoRef}
          className={videoPlaying ? `${styles.boxVideo} ${styles.boxVideoPlaying}` : styles.boxVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={`${BASE_PATH}/negotiation/anchor-environment.poster.jpg`}
          onCanPlay={ensurePlayback}
          onPlaying={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
        >
          <source
            src={`${BASE_PATH}/negotiation/anchor-environment.mp4?v=tv-baseline-1`}
            type='video/mp4; codecs="avc1.42E028"'
          />
        </video>
      </div>
    </section>
  );
}
