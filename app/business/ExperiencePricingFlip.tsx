"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "../components/ui/Reveal";
import styles from "./ExperiencePricingFlip.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Plan = {
  tone: "a" | "b" | "c";
  price: string;
  name: string;
  tagline: string;
  body: string;
  /* 왼쪽 항목 축과 같은 순서. 마지막 칸이 "미포함"이면 타일을 흐리게 둔다. */
  specs: string[];
  specOffFrom?: number;
};

/* 카드 뒷면 스펙 타일의 라벨. */
const axis = [
  "스폰서 및 광고",
  "지원 환경",
  "명령 방식",
  "맥락 패킷 수",
  "앵커 수",
];

const plans: Plan[] = [
  {
    tone: "a",
    price: "$0/mo",
    name: "Basic",
    tagline: "미래로 가는 위대한 첫 걸음",
    body: "직접 지시한 명령을 정확히 수행하며, 동시에 최대 3개의 환경을 스킵합니다.",
    specs: [
      "스폰서 우선 매핑 및 광고 있음*",
      "모든 스키퍼블*",
      "명시적인 발화 또는 텍스트",
      "동시 최대 3개 패킷* 전달 가능",
      "미포함",
    ],
    specOffFrom: 4,
  },
  {
    tone: "b",
    price: "$29/mo",
    name: "Plus",
    tagline: "미래를 여는 가능성의 마스터키",
    body: "굳이 말하지 않아도 나의 목적을 알아채고, 동시에 5개 환경을 스킵합니다.",
    specs: [
      "사용자 선호 우선 매핑*",
      "모든 스키퍼블",
      "명시적 및 암묵적 목적 모두",
      "동시 최대 5개 패킷 전달 가능",
      "미포함",
    ],
    specOffFrom: 4,
  },
  {
    tone: "c",
    price: "$99/mo",
    name: "Pro",
    tagline: "미래를 완성하는 완벽한 청사진",
    body: "무제한 연결과 사용자 지정 앵커로 제약 없는 완벽한 경험을 제공합니다.",
    specs: [
      "사용자 선호 우선 매핑",
      "모든 스키퍼블",
      "명시적 및 암묵적 목적 모두",
      "전달 개수 제한 없음",
      "2개 포함*",
    ],
  },
];

const notes = [
  "*스폰서 우선 매핑: 목적 달성 가능 환경이 여러 개일 경우, 스폰서의 서비스로 우선 연결됩니다.",
  "*사용자 선호 우선 매핑: 스폰서 여부와 관계없이 사용자의 암묵적 선호를 바탕으로 연결됩니다.",
  "*스키퍼블: 스킵의 SDK가 탑재되어 맥락 이동과 생태계 호환이 완벽히 지원되는 모든 환경입니다.",
  "*맥락 패킷: 사용자의 목적을 전달하는 데이터 단위로, 동시 연결 가능한 환경의 수를 결정합니다.",
  "*앵커: 사용자가 직접 지정하는 환경 관리 에이전트로, 추가 결제로 확장 가능합니다.",
];

function lines(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={line}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

export default function ExperiencePricingFlip() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const introCardRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Samsung Moving Style/Tizen은 preserve-3d + backface-visibility 조합에서
    // 카드의 앞·뒷면을 모두 누락해 검정 패널만 남기는 경우가 있다(이 세션에서
    // 반복 확인됨) — 이 기기에서는 3D 회전 대신 opacity 크로스페이드로 뒤집는다.
    if (sectionRef.current) {
      sectionRef.current.dataset.movingStyle = String(
        /Tizen|SMART-TV|SmartTV|Maple/i.test(window.navigator.userAgent),
      );
    }
  }, []);

  useEffect(() => {
    // 왼쪽 사진 카드 높이를 오른쪽 카드 패널(카드 행 + 하단 각주) 전체
    // 높이에 맞춘다 — sticky가 풀리는 시점은 introCard의 아랫변이 형제
    // .rightColumn(문구+카드패널을 담은 박스)의 아랫변과 맞춰질 때라,
    // 카드 "행"만 재면(각주 높이가 빠져) 풀린 뒤에 사진이 카드 윗선보다
    // 아래로 처져 보인다 — 그래서 카드 행의 부모(cardsPanel, 각주까지
    // 포함한 전체)를 잰다.
    const cardsPanel = cardsRef.current?.parentElement;
    const intro = introCardRef.current;

    if (!cardsPanel || !intro) {
      return;
    }

    const sync = () => {
      intro.style.setProperty("--match-height", `${cardsPanel.offsetHeight}px`);
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(cardsPanel);

    return () => observer.disconnect();
  }, []);

  const toggleFlip = (name: string) => {
    setFlipped((previous) => ({ ...previous, [name]: !previous[name] }));
  };

  return (
    <section ref={sectionRef} className={styles.sequence} aria-label="Skeep Experience 요금제">
      <div className={styles.stage}>
        <div className={styles.introCard} ref={introCardRef}>
          <div className={styles.introCardBg} aria-hidden="true">
            {/* <picture>+webp 대신 단일 <img> — 무빙스타일 등 일부 브라우저 엔진이
                <picture>/webp 소스 협상을 제대로 처리 못 해 사진 대신 빈 회색
                박스만 보이는 문제가 있었다. JPEG는 협상 없이 바로 로드된다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE_PATH}/business/pricing/pricing-experience-bg.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className={styles.introCardCopy}>
            <p className={styles.kicker}>B2C Business</p>
            <p className={styles.title}>
              Skeep
              <br />
              Experience
            </p>
            <p className={styles.lede}>
              시공간의 제약 없이 나의 정체성을
              <br />
              기억하고, 끊임 없는 일상을 완성하는
              <br />
              맞춤형 스킵 구독 솔루션
            </p>
          </div>
        </div>

        <div className={styles.rightColumn}>
        <div className={styles.bridgeStatement}>
          <h2>
            <strong>나만의 세계를 만들어가는 법</strong>
            <span>만들어진 세상에 맞추거나</span>
            <span>그냥, 스킵하거나</span>
          </h2>
          <p>
            소비자는 이제 특정 브랜드의 에이전트 생태계에
            <br />
            얽매이지 않고 모든 에이전트와 내 성향을 공유 할 수 있죠.
            <br />
            내 맥락을 안전하게 들고 다니는 SKEEP이,
            <br />
            어떤 에이전트를 만나든 나를 대신 소개해주니까요.
          </p>
        </div>

        <Reveal className={styles.cardsPanel}>
            <div className={styles.cards} ref={cardsRef}>
              {plans.map((plan) => (
                <button
                  type="button"
                  key={plan.name}
                  className={styles.card}
                  data-tone={plan.tone}
                  data-flipped={Boolean(flipped[plan.name])}
                  aria-pressed={Boolean(flipped[plan.name])}
                  onClick={() => toggleFlip(plan.name)}
                >
                  <div className={styles.faces}>
                    <div className={`${styles.face} ${styles.front}`}>
                      <p className={styles.cardPrice}>{plan.price}</p>
                      <p className={styles.cardName}>{plan.name}</p>
                      <p className={styles.cardTagline}>{plan.tagline}</p>
                      <p className={styles.cardBody}>{lines(plan.body)}</p>
                      <span className={styles.flipHint}>
                        <span className={styles.flipHintLabel}>자세히 보기</span>
                        <span className={styles.flipHintArrow}>›</span>
                      </span>
                    </div>

                    <div className={`${styles.face} ${styles.rear}`}>
                      <p className={styles.cardPrice}>{plan.price}</p>
                      <p className={styles.cardName}>{plan.name}</p>
                      <div className={styles.cardRule} />
                      <div className={styles.specs}>
                        {plan.specs.map((spec, index) => (
                          <div
                            key={spec}
                            className={`${styles.spec} ${
                              plan.specOffFrom !== undefined && index >= plan.specOffFrom
                                ? styles.specOff
                                : ""
                            }`}
                          >
                            <span>{axis[index]}</span>
                            <strong>{spec}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className={styles.notes}>
              {notes.map((note, index) => (
                <span key={note}>
                  {index > 0 ? <br /> : null}
                  {note}
                </span>
              ))}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
