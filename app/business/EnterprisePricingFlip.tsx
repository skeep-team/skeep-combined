"use client";

import { useEffect, useRef, useState } from "react";
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

/* B2C 패널과 같은 순서: 진입 시 전체 구조를 한 번에 보여준 뒤 뒤집힌다. */
const revealAt = 0.08;
/* 카드를 하나씩 돌리지 않고, 이 지점을 넘으면 전부 한꺼번에 뒤집는다. */
const flipForward = 0.48;
const flipReverse = 0.42;

export default function EnterprisePricingFlip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [flipped, setFlipped] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    let count = 0;
    let revealed = false;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const nextRevealed = progress >= revealAt;

      if (revealed !== nextRevealed) {
        revealed = nextRevealed;
        const value = revealed ? "1" : "0";

        section.style.setProperty("--expand", value);
        section.style.setProperty("--reveal", value);
      }

      if (count === 0 && progress >= flipForward) {
        count = cards.length;
      } else if (count > 0 && progress <= flipReverse) {
        count = 0;
      }

      setFlipped((previous) => (previous === count ? previous : count));
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const open = flipped > 0;

  return (
    <section
      ref={sectionRef}
      className={styles.sequence}
      aria-label="Skeep Enterprise 솔루션 요금 구조"
    >
      <div className={styles.sticky}>
        <div className={styles.bridgeStatement}>
          <h2>
            <strong>모든 사용자를 유혹하는 법</strong>
            <span>처음부터 다시 만들거나</span>
            <span>그냥, 스킵하거나</span>
          </h2>
          <p>
            스킵의 파트너사는 사용자 데이터를 확보하기 위해 막대한<br />
            에이전틱 생태계를 직접 구축할 필요가 없죠. 독보적인 SIS™<br />
            아키텍처가 파트너사의 비즈니스를 전 세계 에이전틱 생태계와<br />
            연결해주고, Skeep Insights가 전략까지 제시해주니까요.
          </p>
        </div>

        <div className={styles.stage}>
          <div className={styles.panel} data-open={open}>
          <div className={styles.control} aria-hidden="true">
            <span className={styles.pill}>솔루션 자세히 알아보기</span>
            <span className={styles.back}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${BASE_PATH}/business/flip/arrow-left.svg`} alt="" />
            </span>
          </div>

          <div className={styles.introCard} aria-hidden="true">
            <p className={styles.kicker}>B2B Business</p>
            <p className={styles.title}>
              Skeep
              <br />
              Enterprise
            </p>
            {/* 펼친 뒤와 줄 수가 달라지면 전환할 때 눈에 띄어서, 카드일 때도 세 줄로 맞춘다. */}
            <p className={styles.lede}>
              기업 간 경계를 넘어 모든 생태계의
              <br />
              사용자와 연결하고, 그 데이터로 전략
              <br />
              까지 제시하는 파트너 솔루션
            </p>
          </div>

          <div className={styles.introPanel}>
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

          <div className={styles.cards}>
            {cards.map((card, index) => (
              <div
                key={card.title}
                className={styles.card}
                data-tone={card.tone}
                data-flipped={index < flipped}
              >
                <div className={styles.faces}>
                  <div className={`${styles.face} ${styles.front}`}>
                    <div className={styles.frontBody}>
                      <p className={styles.frontEyebrow}>{card.eyebrow}</p>
                      <p className={styles.frontTitle}>{card.title}</p>
                      <p className={styles.frontSubtitle}>{card.subtitle}</p>
                      <p className={styles.frontText}>
                        {card.body.split("\n").map((line, lineIndex) => (
                          <span key={line}>
                            {lineIndex > 0 ? <br /> : null}
                            {line}
                          </span>
                        ))}
                      </p>
                      <p className={styles.frontNote}>{card.note}</p>
                    </div>
                  </div>

                  <div className={`${styles.face} ${styles.rear}`}>
                    <p className={styles.rearEyebrow}>{card.eyebrow}</p>
                    <p className={styles.rearTitle}>{card.title}</p>
                    <div className={styles.rule} />
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
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
