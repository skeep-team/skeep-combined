"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScrambleText } from "../ui/ScrambleText";
import styles from "./ResetSequence.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// How long "패킷 회수 중..." holds, fully scrambled-in, before scrambling
// out into "다시, 처음처럼".
const HOLD_MS = 1400;

// Figma(node 8400:22615, "지켜주다" 패킷 회수 배치)의 좌표를 그대로 옮겼다.
// 원본 프레임은 3085x1494px — 그 프레임 대비 %로 환산해 반응형으로도 같은
// 구도가 나오게 했다. DOM 순서 = Figma 페인트 순서(뒤에서 앞으로)라 겹치는
// 카드도 같은 위/아래 관계로 렌더된다.
const PACKET_PHOTOS = [
  // 왼쪽 위 쌍 — 뒤 카드 (프로젝터 앞에 앉은 여성)
  { src: "reset-theater", left: "8.56%", top: "24.90%", width: "19.68%", height: "28.65%" },
  // 오른쪽 아래 (리클라이닝된 차량 뒷좌석)
  { src: "reset-car", left: "71.93%", top: "38.42%", width: "18.97%", height: "30.05%" },
  // 왼쪽 아래 (VR 모션 체어)
  { src: "reset-vr", left: "22.04%", top: "72.02%", width: "9.56%", height: "19.75%" },
  // 아래 중앙 (터치스크린 테이블)
  { src: "reset-touchscreen", left: "35.17%", top: "66.60%", width: "17.57%", height: "30.66%" },
  // 오른쪽 아래 (로퍼 걷는 발)
  { src: "reset-loafers", left: "64.80%", top: "59.97%", width: "13.39%", height: "18.54%" },
  // 위 중앙 (Zoox 로보택시)
  { src: "reset-zoox", left: "48.82%", top: "7.76%", width: "17.57%", height: "30.66%" },
  // 오른쪽 위 쌍 — 뒤 카드 (스팀 클로짓)
  { src: "reset-closet", left: "64.80%", top: "-3.28%", width: "9.69%", height: "28.18%" },
  // 왼쪽 위 쌍 — 앞 카드 (지하철 헤드폰, 뒤 카드의 우상단을 덮음)
  { src: "reset-subway", left: "21.65%", top: "11.45%", width: "10.37%", height: "21.90%" },
] as const;

function PacketPhotoField({ dissolve }: { dissolve: boolean }) {
  return (
    <div className={styles.photoField} aria-hidden="true">
      {PACKET_PHOTOS.map((photo, index) => (
        <div
          key={photo.src}
          className={styles.photo}
          data-dissolved={dissolve}
          style={{
            left: photo.left,
            top: photo.top,
            width: photo.width,
            height: photo.height,
            transitionDelay: `${index * 260}ms`,
          }}
        >
          <picture>
            <source srcSet={`${BASE_PATH}/service2/${photo.src}.webp`} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE_PATH}/service2/${photo.src}.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      ))}
    </div>
  );
}

function PacketRecallSequence({
  phase,
  setPhase,
  visible,
}: {
  phase: number;
  setPhase: (phase: number) => void;
  visible: boolean;
}) {
  const [dissolve, setDissolve] = useState(false);

  const advance = useCallback(() => {
    setTimeout(() => setPhase(1), HOLD_MS);
  }, [setPhase]);

  // ScrambleText는 자기가 화면에 들어와야 재생을 시작하는데, 사진은 전에
  // 컴포넌트가 마운트되자마자(=페이지 로드 즉시, 스크롤로 도착하기 한참
  // 전) 사라지기 시작해서 실제로 스크롤해 왔을 땐 이미 다 사라진 뒤였다.
  // 섹션이 실제로 보일 때부터 같은 300ms 뒤에 회수가 시작되게 맞춘다.
  useEffect(() => {
    if (phase !== 0 || !visible) {
      return;
    }

    const timer = setTimeout(() => setDissolve(true), 300);
    return () => clearTimeout(timer);
  }, [phase, visible]);

  return (
    <>
      {phase === 0 && <PacketPhotoField dissolve={dissolve} />}
      <ScrambleText
        key={phase}
        text={phase === 0 ? "패킷 회수 중..." : "다시, 처음처럼"}
        color={phase === 0 ? "#ffffff" : "#000000"}
        className={`${styles.scramble} ${phase === 1 ? styles.scrambleBold : ""}`}
        onEnterComplete={phase === 0 ? advance : undefined}
      />
    </>
  );
}

export function ResetSequence() {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} data-phase={phase}>
      <PacketRecallSequence phase={phase} setPhase={setPhase} visible={visible} />
    </section>
  );
}
