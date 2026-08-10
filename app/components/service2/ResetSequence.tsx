"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./ResetSequence.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// How long "패킷 회수 중..." holds, fully typed-in, before switching over
// to "다시, 처음처럼". (예전엔 1400ms → 너무 빨리 넘어간다는 피드백으로 3600ms까지
// 늘렸다가, 이번엔 반대로 전체 인터랙션이 느리다는 피드백으로 다시 줄임.)
const HOLD_MS = 2000;

// 사진이 나타난 뒤 회수(dissolve)를 시작하기까지의 대기 시간. 문구가 다
// 타이핑될 시간을 준다.
const DISSOLVE_DELAY_MS = 800;

// "다시, 처음처럼"이 다 뜬 뒤 처음(패킷 회수)으로 되돌아가기까지 대기 시간.
const LOOP_HOLD_MS = 2600;

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

// setInterval로 한 글자씩 세는 방식은 "실행되면" 정확하지만, 무빙스타일에서
// 아예 tick이 한 번도 안 걸리는(=완전히 멈추는) 경우가 실제로 관찰됐다 —
// 커서(CSS 애니메이션, 컴포지터가 그려서 JS와 무관하게 계속 깜빡임)는 뜨는데
// 글자는 하나도 안 나타난 게 그 증거. 그래서 진행을 매 tick 세는 JS 루프가
// 아니라, CSS clip-path 애니메이션 "한 번 트리거"로 바꿨다 — active가 true가
// 되는 순간 클래스 하나만 켜주면(반복 타이머 없이 단발성 상태 변경 한 번)
// 나머지 재생은 전부 브라우저 애니메이션 엔진이 담당해서 JS 타이머 신뢰성과
// 무관해진다.
function TypeOnText({
  text,
  color,
  className,
  active,
  onComplete,
  durationMs = 1200,
}: {
  text: string;
  color?: string;
  className?: string;
  active: boolean;
  onComplete?: () => void;
  durationMs?: number;
}) {
  const [play, setPlay] = useState(false);
  const firedRef = useRef(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!active) return;
    const el = spanRef.current;
    if (!el) return;

    // clip-path 애니메이션이 생략되는 임베디드 브라우저에서도 확실히 보이도록
    // 실제 글자 너비를 한 번 재고 width 0→실측값 애니메이션으로 재생한다.
    el.style.setProperty("--type-on-width", `${el.scrollWidth}px`);
    void el.offsetWidth;
    const frame = window.requestAnimationFrame(() => setPlay(true));
    return () => window.cancelAnimationFrame(frame);
  }, [active, text]);

  useEffect(() => {
    if (!play) return;
    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      onComplete?.();
    };
    const el = spanRef.current;
    el?.addEventListener("animationend", fire);
    // 안전망: animationend 자체가 안 걸리는 경우를 대비해, 애니메이션
    // 길이만큼 지나면 콜백과 무관하게 강제로 다음 단계로 넘긴다.
    const fallback = window.setTimeout(fire, durationMs + 400);
    return () => {
      el?.removeEventListener("animationend", fire);
      window.clearTimeout(fallback);
    };
  }, [play, durationMs, onComplete]);

  return (
    <div className={className} style={{ width: "100%" }}>
      <span className={styles.typeOnFrame} style={{ color }}>
        <span
          ref={spanRef}
          className={`${styles.typeOn} ${play ? styles.typeOnPlay : ""}`}
          style={{ ["--type-on-duration" as string]: `${durationMs}ms` } as React.CSSProperties}
        >
          {text}
        </span>
      </span>
    </div>
  );
}

function PacketRecallSequence({
  phase,
  setPhase,
  visible,
  onPlaybackComplete,
}: {
  phase: number;
  setPhase: (phase: number) => void;
  visible: boolean;
  onPlaybackComplete?: () => void;
}) {
  const [dissolve, setDissolve] = useState(false);
  const advancedRef = useRef(false);
  const loopedRef = useRef(false);

  const advance = useCallback(() => {
    if (advancedRef.current) {
      return;
    }
    advancedRef.current = true;
    setTimeout(() => setPhase(1), HOLD_MS);
  }, [setPhase]);

  // "다시, 처음처럼"이 다 뜨고 LOOP_HOLD_MS만큼 지나면 처음(패킷 회수) 상태로
  // 되돌린다 — dissolve/advancedRef를 리셋해야 다음 바퀴에서도 사진이 다시
  // 나타났다가 회수되고, advance()도 다시 걸린다.
  const loopBack = useCallback(() => {
    if (loopedRef.current) {
      return;
    }
    loopedRef.current = true;
    // "다시, 처음처럼"까지 다 뜬 시점 = 한 바퀴 재생이 끝난 시점. 이때 스크롤
    // 잠금을 풀어줘서, 그 전까지는 아무리 빨리 스크롤해도 이 섹션을 못
    // 빠져나가게(=화면이 잘린 채로 재생되는 일이 없게) 한다.
    onPlaybackComplete?.();
    setTimeout(() => {
      setDissolve(false);
      advancedRef.current = false;
      loopedRef.current = false;
      setPhase(0);
    }, LOOP_HOLD_MS);
  }, [setPhase, onPlaybackComplete]);

  // TypeOnText는 active(=visible)가 true여야 재생을 시작하는데, 사진은 전엔
  // 컴포넌트가 마운트되자마자(=페이지 로드 즉시, 스크롤로 도착하기 한참
  // 전) 사라지기 시작해서 실제로 스크롤해 왔을 땐 이미 다 사라진 뒤였다.
  // 문구가 다 나타날 시간을 준 뒤에야 회수(dissolve)가 시작되게 해서,
  // "패킷 회수 중..." 문구가 뜨는 동안 사진들이 이미 절반쯤 사라져 검정
  // 여백만 남아 있는 것처럼 보이지 않게 한다.
  useEffect(() => {
    if (phase !== 0 || !visible) {
      return;
    }

    const timer = setTimeout(() => setDissolve(true), DISSOLVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase, visible]);

  // 안전장치: TypeOnText의 onComplete는 CSS 애니메이션 종료(또는 그마저
  // 안 걸릴 때의 내부 타이머 폴백)로 반드시 걸리지만, 혹시라도 예외적인
  // 경우를 대비해 콜백과 무관하게 강제로 다음 단계로 넘기는 폴백을 하나
  // 더 둔다. phase 0/1 모두 같은 이유로 필요하다.
  useEffect(() => {
    if (phase !== 0 || !visible) {
      return;
    }

    const fallback = setTimeout(advance, 4200);
    return () => clearTimeout(fallback);
  }, [phase, visible, advance]);

  useEffect(() => {
    if (phase !== 1 || !visible) {
      return;
    }

    const fallback = setTimeout(loopBack, 2200);
    return () => clearTimeout(fallback);
  }, [phase, visible, loopBack]);

  return (
    <>
      {phase === 0 && <PacketPhotoField dissolve={dissolve} />}
      {/* phase 1로 넘어갈 때는 이미 화면에 떠 있는 섹션 안에서 key만 바뀌며
         재마운트되는데, 내부에 따로 옵저버를 두지 않고 위에서 이미 폴백까지
         갖춰 훨씬 안정적으로 판정해 둔 visible을 active로 그대로 넘겨써서
         "화면에 들어왔는지" 판정 자체를 다시 하지 않는다. */}
      <TypeOnText
        key={phase}
        text={phase === 0 ? "패킷 회수 중..." : "다시, 처음처럼"}
        color={phase === 0 ? "#ffffff" : "#000000"}
        className={`${styles.scramble} ${phase === 1 ? styles.scrambleBold : ""}`}
        onComplete={phase === 0 ? advance : loopBack}
        active={visible}
      />
    </>
  );
}

export function ResetSequence() {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [locked, setLocked] = useState(false);
  const lockYRef = useRef(0);
  const completedRef = useRef(false);

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

  // 이 섹션이 "실제로 화면을 거의 채운" 순간에만 스크롤을 잠근다 — 위 visible은
  // 타이핑 애니메이션을 늦지 않게 미리 시작시키려고 일부러 뷰포트 80% 앞에서도
  // 켜지는(=아직 바로 위 섹션이 화면에 보이는 시점일 수 있는) 느슨한 신호라,
  // 그걸 그대로 잠금 트리거로 쓰면 이 섹션이 뜨기도 전에 이전 섹션 화면에서
  // 스크롤이 멈춰버린다("이 부분에서 멈추잖아" 버그). 잠금은 섹션 상단이
  // 뷰포트 상단 근처까지 온(=거의 다 들어온) 훨씬 엄격한 시점에만 건다.
  useEffect(() => {
    if (completedRef.current || locked) {
      return;
    }

    // 빠른 트랙패드 플링/휠은 한 번에 큰 폭으로 스크롤을 밀어버려서, 'scroll'
    // 이벤트가 뜨는 시점엔 이미 이 섹션을 한참 지나쳐 있을 수 있다(그 상태에서
    // 그냥 window.scrollY를 잠금 위치로 잡으면 "너무 아래로 내려간" 채로
    // 얼어버린다). 그래서 현재 위치가 아니라, 섹션 상단이 뷰포트 상단에 오는
    // "제자리" 스크롤 값을 계산해 그쪽으로 즉시 보정한 뒤 그 위치를 잠근다.
    let raf = 0;

    const checkLockPoint = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.15) {
        const correctedY = Math.max(0, window.scrollY + rect.top);
        lockYRef.current = correctedY;
        if (Math.abs(window.scrollY - correctedY) > 1) {
          window.scrollTo(0, correctedY);
        }
        setLocked(true);
        return;
      }
      raf = window.requestAnimationFrame(checkLockPoint);
    };

    raf = window.requestAnimationFrame(checkLockPoint);
    window.addEventListener("resize", checkLockPoint);
    return () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
      window.removeEventListener("resize", checkLockPoint);
    };
  }, [locked]);

  useEffect(() => {
    if (!locked) {
      return;
    }

    const holdScroll = () => {
      if (Math.abs(window.scrollY - lockYRef.current) > 1) {
        window.scrollTo(0, lockYRef.current);
      }
    };
    const preventScroll = (event: Event) => {
      event.preventDefault();
      holdScroll();
    };
    const preventKeyScroll = (event: KeyboardEvent) => {
      if (["PageDown", "PageUp", "ArrowDown", "ArrowUp", " ", "Home", "End"].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeyScroll);
    window.addEventListener("scroll", holdScroll, { passive: true });

    // 트랙패드 관성(모멘텀) 스크롤은 최초의 한 번을 제외하면 'wheel' 이벤트로
    // 오지 않고 브라우저가 알아서 계속 스크롤을 흘려보낸다 — preventDefault로도
    // 못 막고, 'scroll' 이벤트 보정도 프레임 사이 간격 때문에 몇 픽셀씩
    // 새어나갈 수 있다. rAF로 매 프레임 직접 위치를 강제해 확실히 묶어둔다.
    let rafId = requestAnimationFrame(function loop() {
      holdScroll();
      rafId = requestAnimationFrame(loop);
    });

    return () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventKeyScroll);
      window.removeEventListener("scroll", holdScroll);
      cancelAnimationFrame(rafId);
    };
  }, [locked]);

  const handlePlaybackComplete = useCallback(() => {
    completedRef.current = true;
    setLocked(false);
  }, []);

  return (
    <section ref={sectionRef} className={styles.sequence}>
      {/* 스크롤 중에 이 섹션의 검정/흰 배경과 다음 섹션이 화면에 반씩 걸쳐
         보이던 문제(검정 화면 상태에서 흰 여백이 비치는 것) 때문에, 실제
         내용은 position:sticky로 화면에 고정해두고 바깥 .sequence를 100vh
         보다 조금 더 크게 잡아 그만큼 더 오래 붙어 있게 한다. */}
      <div className={styles.sticky} data-phase={phase}>
        <PacketRecallSequence
          phase={phase}
          setPhase={setPhase}
          visible={visible}
          onPlaybackComplete={handlePlaybackComplete}
        />
      </div>
    </section>
  );
}
