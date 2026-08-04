"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ExperiencePricingFlip.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Plan = {
  tone: "a" | "b" | "c";
  price: string;
  name: string;
  tagline: string;
  body: string;
  /* 왼쪽 항목 축과 같은 순서. 마지막 칸이 "미포함"이면 타일 전체를 흐리게 둔다. */
  specs: string[];
  specOffFrom?: number;
};

/* 왼쪽 열의 비교축. 카드 안 스펙 타일과 1:1로 줄이 맞는다. */
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
    body: "직접 지시한 명령을 정확히 수행하며,\n동시에 최대 3개의 환경을 스킵합니다.",
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
    price: "$9/mo",
    name: "Plus",
    tagline: "미래를 여는 가능성의 마스터키",
    body: "굳이 말하지 않아도 나의 목적을 알아\n채고, 동시에 5개 환경을 스킵합니다.",
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
    price: "$29/mo",
    name: "Pro",
    tagline: "미래를 완성하는 완벽한 청사진",
    body: "무제한 연결과 사용자 지정 앵커로\n제약 없는 완벽한 경험을 제공합니다.",
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

/* 요금제 패널은 중간 폭을 보여주지 않는다. 진입 지점을 넘으면 전체를 한 번에 연다. */
const revealAt = 0.08;

/* 카드가 뒤집히는 지점. 되돌아오는 지점은 조금 앞에 둬서 경계에서 떨리지 않게 한다. */
/* 카드를 하나씩 돌리지 않고, 이 지점을 넘으면 전부 한꺼번에 뒤집는다. */
const flipForward = 0.48;
const flipReverse = 0.42;

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
        count = plans.length;
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
      aria-label="Skeep Experience 요금제"
    >
      <div className={styles.sticky}>
        <div className={styles.stage}>
          {/* 펼쳐지는 패널이 왼쪽부터 덮어 나가는, 오른쪽의 짝 카드 */}
          <div className={styles.peer} aria-hidden="true">
            <div className={styles.peerIntro}>
              <p className={styles.kicker}>B2B Business</p>
              <p className={styles.title}>
                Skeep
                <br />
                Enterprise
              </p>
              {/* 옆의 Experience 카드와 줄 수를 맞춘다. */}
              <p className={styles.lede}>
                기업 간 경계를 넘어 모든 생태계의
                <br />
                사용자와 연결하고, 그 데이터로 전략까지
                <br />
                제시하는 파트너 솔루션
              </p>
            </div>
          </div>

          <div className={styles.panel} data-open={open}>
            <div className={styles.control} aria-hidden="true">
              <span className={styles.pill}>요금제 자세히 알아보기</span>
              <span className={styles.back}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${BASE_PATH}/business/flip/arrow-left.svg`} alt="" />
              </span>
            </div>

            <div className={styles.introCard} aria-hidden="true">
              <p className={styles.kicker}>B2C Business</p>
              <p className={styles.title}>
                Skeep
                <br />
                Experience
              </p>
              {/* 펼친 뒤와 줄 수가 달라지면 전환할 때 눈에 띄어서, 카드일 때도 세 줄로 맞춘다. */}
              <p className={styles.lede}>
                시공간의 제약 없이 나의 정체성을
                <br />
                기억하고, 끊임 없는 일상을 완성하는
                <br />
                맞춤형 스킵 구독 솔루션
              </p>
            </div>

            <div className={styles.introPanel}>
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

            <div className={styles.axisRule} />
            <div className={styles.axis}>
              {axis.map((item) => (
                <div key={item} className={styles.axisItem}>
                  {item}
                </div>
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

            <div className={styles.cards}>
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={styles.card}
                  data-tone={plan.tone}
                  data-flipped={index < flipped}
                >
                  <div className={styles.faces}>
                    <div className={`${styles.face} ${styles.front}`}>
                      <div className={styles.frontBody}>
                        <p className={styles.frontPrice}>{plan.price}</p>
                        <p className={styles.frontName}>{plan.name}</p>
                        <p className={styles.frontTagline}>{plan.tagline}</p>
                        <p className={styles.frontText}>{lines(plan.body)}</p>
                      </div>
                    </div>

                    <div className={`${styles.face} ${styles.rear}`}>
                      <p className={styles.rearPrice}>{plan.price}</p>
                      <p className={styles.rearName}>{plan.name}</p>
                      <div className={styles.rearRule} />
                      <div className={styles.specs}>
                        {plan.specs.map((spec, specIndex) => (
                          <div
                            key={spec}
                            className={`${styles.spec} ${
                              plan.specOffFrom !== undefined &&
                              specIndex >= plan.specOffFrom
                                ? styles.specOff
                                : ""
                            }`}
                          >
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                      <p className={styles.rearText}>{lines(plan.body)}</p>
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
