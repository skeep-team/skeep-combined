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
  const advancedRef = useRef(false);

  const advance = useCallback(() => {
    if (advancedRef.current) {
      return;
    }
    advancedRef.current = true;
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

  // 안전장치: ScrambleText의 onEnterComplete는 ResizeObserver/폰트 로딩
  // 타이밍에 기대는 복잡한 애니메이션이라, 무빙스타일처럼 약한/오래된
  // 브라우저 엔진에서 드물게 콜백이 아예 안 걸려 "패킷 회수 중..." 검정
  // 화면에서 다음 단계로 영영 못 넘어가는 문제가 있었다 — 스크램블 애니메이션이
  // 정상적으로 끝나는 데 걸리는 시간보다 넉넉히 긴 시간이 지나도 넘어가지
  // 않았다면, 애니메이션 콜백과 무관하게 강제로 다음 단계로 넘긴다.
  // (예전엔 6000ms였다 — ScrambleText 트리거 자체가 내부 옵저버에 기대던
  // 시절엔 그 옵저버까지 실패할 여지를 감안해 넉넉히 잡았지만, 이제 위에서
  // active={visible}로 트리거를 직접 넘겨주면서 그 경로의 실패 가능성이
  // 없어졌다. 실제 애니메이션(~1.6~2초)보다만 여유 있으면 되므로 줄여서,
  // 폴백이 걸리더라도 "흰 화면 나오기까지 공백이 너무 길다"는 느낌을 없앤다.)
  useEffect(() => {
    if (phase !== 0 || !visible) {
      return;
    }

    const fallback = setTimeout(advance, 3200);
    return () => clearTimeout(fallback);
  }, [phase, visible, advance]);

  return (
    <>
      {phase === 0 && <PacketPhotoField dissolve={dissolve} />}
      {/* ScrambleText는 기본적으로 자기 안에서 또 하나의 IntersectionObserver로
         "화면에 들어왔는지"를 따로 판단하는데, phase 1로 넘어갈 때는 이미
         화면에 떠 있는 섹션 안에서 key만 바뀌며 재마운트되는 거라 그 내부
         옵저버가 안 걸리면(무빙스타일에서 실제로 보고된 증상) 글자가 전부
         투명한 채로 영영 안 나타난다("흰 배경만 보이고 문구가 안 나옴").
         위에서 이미 폴백까지 갖춰 훨씬 안정적으로 판정해 둔 visible을
         그대로 넘겨써서 내부 옵저버 자체를 안 쓰게 한다. */}
      <ScrambleText
        key={phase}
        text={phase === 0 ? "패킷 회수 중..." : "다시, 처음처럼"}
        color={phase === 0 ? "#ffffff" : "#000000"}
        className={`${styles.scramble} ${phase === 1 ? styles.scrambleBold : ""}`}
        onEnterComplete={phase === 0 ? advance : undefined}
        active={visible}
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

  // 안전장치: 일부 기기(무빙스타일 등)에서 IntersectionObserver 콜백이 아예
  // 안 걸리는 경우가 있어(원인 불명, 재현은 안 되지만 사용자 보고 기준),
  // "패킷 회수 중..." 검정 화면에서 영영 안 넘어가는 문제가 생겼다.
  // observer와 무관하게 스크롤/리사이즈 때마다 실제 위치를 직접 재보고,
  // 화면에 들어와 있으면 visible을 켠다 — 둘 중 뭐가 됐든 하나만 걸리면 된다.
  useEffect(() => {
    if (visible) {
      return;
    }

    const checkPosition = () => {
      const el = sectionRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
      if (inView) {
        setVisible(true);
      }
    };

    checkPosition();
    window.addEventListener("scroll", checkPosition, { passive: true });
    window.addEventListener("resize", checkPosition);
    return () => {
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, [visible]);

  return (
    <section ref={sectionRef} className={styles.section} data-phase={phase}>
      <PacketRecallSequence phase={phase} setPhase={setPhase} visible={visible} />
    </section>
  );
}
