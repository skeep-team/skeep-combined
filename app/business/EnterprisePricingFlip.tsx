"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "../components/ui/Reveal";
import styles from "./EnterprisePricingFlip.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type FeeTile = {
  label: string;
  title: string;
  body: string;
};

type Card = {
  tone: "a" | "b";
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  note: string;
  fees: FeeTile[];
};

const cards: Card[] = [
  {
    tone: "a",
    eyebrow: "Custom Pricing",
    title: "Skeep SIS™",
    subtitle: "전용 미들웨어 인프라",
    body: "SDK* 연동으로 자체 인프라 구축 비용을 스킵하고, 전 세계의\n에이전틱 생태계와 자사 서비스, 제품, 공간을 연결합니다.",
    note: "*Skeepable Development Kit: 파트너사의 제품·서비스·공간을 즉시 스키퍼블로 전환시키는 무상 배포형 표준 개발 키트",
    fees: [
      {
        label: "Required",
        title: "Access Fee",
        body: "트래픽 발생 여부와 관계없이 스킵 망과의 상시 호환 및 실시간 대기 상태를 유지하기 위한 상시 고정 기본료",
      },
      {
        label: "Required",
        title: "Transaction Fee",
        body: "유저의 명령으로 실제 실행 블록이 구동되고 맥락 데이터가 이관된 건에 대해서만 책정되는 종량제 기반 변동비",
      },
      {
        label: "Optional",
        title: "Promotion Fee",
        body: "모호한 명령 시 타사 서비스 대비 최우선 매핑 권한을 제공하여 생태계 내 노출 및 선점 확률을 높이는 옵션 요금",
      },
      {
        label: "Optional",
        title: "Download Fee",
        body: "기능 다운로드를 통해 기존 제품에 없던 스킵 사용 경험이 추가되고 확장됨에 따라 부과되는 경험 가치 수수료",
      },
    ],
  },
  {
    tone: "b",
    eyebrow: "Custom Pricing",
    title: "Skeep Insights",
    subtitle: "사용자 데이터 기반 전략 컨설팅",
    body: "사용자 데이터 분석으로 실제 전환되는 실행 블록을 짚어내고,\n실제 사용자 니즈가 높은 기능에 기업의 자원을 집중시킵니다.",
    note: "*실행블록: 사용자의 목적을 조도 조절·음악 재생·항공권 예약 등 각 서비스 및 제품 고유의 기능으로 변환하는 조건부 실행 단위",
    fees: [
      {
        label: "Included",
        title: "General Consulting",
        body: "파트너사의 주요 유저 데이터를 분석하여 단발성 전략 리포트를 발행하고 비즈니스 방향성을 제안하는 프로젝트 비용",
      },
      {
        label: "Optional",
        title: "Diagnostics",
        body: "실행 블록별 유저의 실제 수용률과 거부·무시 비율을 정밀 추적하여 스키퍼블 운영 효율성과 효과성을 진단하는 R&D 비용",
      },
    ],
  },
];

function lines(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={line}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

export default function EnterprisePricingFlip() {
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
    // 왼쪽 사진 카드 높이를 오른쪽 카드 패널 전체 높이에 맞춘다 — sticky가
    // 풀리는 시점은 introCard의 아랫변이 형제 .rightColumn의 아랫변과
    // 맞춰질 때라, 카드 "행"만 재면 풀린 뒤에 사진이 카드 윗선보다 아래로
    // 처져 보인다. 카드 행의 부모(cardsPanel)를 재서 맞춘다.
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

  const toggleFlip = (title: string) => {
    setFlipped((previous) => ({ ...previous, [title]: !previous[title] }));
  };

  return (
    <section
      ref={sectionRef}
      className={styles.sequence}
      aria-label="Skeep Enterprise 솔루션 요금 구조"
    >
      <div className={styles.stage}>
        <div className={styles.introCard} ref={introCardRef}>
          <div className={styles.introCardBg} aria-hidden="true">
            {/* <picture>+webp 대신 단일 <img> — 무빙스타일 등 일부 브라우저 엔진이
                <picture>/webp 소스 협상을 제대로 처리 못 해 사진 대신 빈 회색
                박스만 보이는 문제가 있었다. JPEG는 협상 없이 바로 로드된다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE_PATH}/business/pricing/pricing-enterprise-bg.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className={styles.introCardCopy}>
            <p className={styles.kicker}>B2B Business</p>
            <p className={styles.title}>
              Skeep
              <br />
              Enterprise
            </p>
            <p className={styles.lede}>
              기업 간 경계를 넘어 모든 생태계의
              <br />
              사용자와 연결하고, 그 데이터로 전략
              <br />
              까지 제시하는 파트너 솔루션
            </p>
          </div>
        </div>

        <div className={styles.rightColumn}>
        <div className={styles.bridgeStatement}>
          <h2>
            <strong>모든 사용자를 유혹하는 법</strong>
            <span>처음부터 다시 만들거나</span>
            <span>그냥, 스킵하거나</span>
          </h2>
          <p>
            스킵의 파트너사는 사용자 데이터를 확보하기 위해 막대한
            <br />
            에이전틱 생태계를 직접 구축할 필요가 없죠. 독보적인 SIS™
            <br />
            아키텍처가 파트너사의 비즈니스를 전 세계 에이전틱 생태계와
            <br />
            연결해주고, Skeep Insights가 전략까지 제시해주니까요.
          </p>
        </div>

          <Reveal className={styles.cardsPanel}>
            <div className={styles.cards} ref={cardsRef}>
              {cards.map((card) => (
                <button
                  type="button"
                  key={card.title}
                  className={styles.card}
                  data-tone={card.tone}
                  data-flipped={Boolean(flipped[card.title])}
                  aria-pressed={Boolean(flipped[card.title])}
                  onClick={() => toggleFlip(card.title)}
                >
                  <div className={styles.faces}>
                    <div className={`${styles.face} ${styles.front}`}>
                      <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                      <p className={styles.cardTitle}>{card.title}</p>
                      <p className={styles.cardSubtitle}>{card.subtitle}</p>
                      <p className={styles.cardBody}>{lines(card.body)}</p>
                      <p className={styles.cardNote}>{card.note}</p>
                      <span className={styles.flipHint}>
                        자세히 보기<span className={styles.flipHintArrow}>›</span>
                      </span>
                    </div>

                    <div className={`${styles.face} ${styles.rear}`}>
                      <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                      <p className={styles.cardTitle}>{card.title}</p>
                      <div className={styles.cardRule} />
                      <div className={styles.fees}>
                        {card.fees.map((fee) => (
                          <div key={fee.title} className={styles.fee}>
                            <p className={styles.feeLabel}>{fee.label}</p>
                            <p className={styles.feeTitle}>{fee.title}</p>
                            <p className={styles.feeBody}>{fee.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
