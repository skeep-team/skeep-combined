"use client";

import { useState } from "react";
import styles from "./PestelSection.module.css";

const items = [
  {
    letter: "P",
    category: "Political",
    title: "빅테크 진영의\nAI 파이 나누기와\n폐쇄적 생태계 구축",
    description:
      "세상의 수많은 서비스와 제품 경험을 한 기업의 생태계로 독점하는 것은 불가능하죠. 독점적인 파이를 차지하려는 플랫폼 간의 폐쇄적인 진영 싸움은 기술의 유기적인 융합보다 사용자 경험의 파편화를 이끌어왔습니다.",
  },
  {
    letter: "E",
    category: "Economic",
    title: "AI 데이터 인프라\n중복 투자와\n고정비 지출 심화",
    description:
      "폐쇄적 생태계 확장의 이면에는 각 진영의 장벽 안에 고립된 데이터의 비효율이 자리하고 있죠. 기업들은 그들의 가치를 유지의 맥락 속에 매끄럽게 전달하지 못하고 비즈니스 기회와 고객 경험 혁신에서 한계를 느껴 왔습니다.",
  },
  {
    letter: "S",
    category: "Social",
    title: "스크린을 넘어\n연속적 사용 경험을\n요구하는 사용자",
    description:
      "화면 속에 갇힌 인터랙션에 피로감을 느낀 유저들은 이제 스크린 밖 일상 자체를 소비하기 시작했습니다. 그러나 진영 간의 장벽에 가로막혀 일상의 동선마다 번번이 단절되는 불연속적인 경험은 유저들에게 깊은 피로감을 선사했죠.",
  },
  {
    letter: "T",
    category: "Technological",
    title: "물리적 세계로\n확장하기 시작하는\nA2A 생태계",
    description:
      "멀티모달 AI와 에이전트 기술은 더 이상 화면 안에 머물지 않습니다. 다양한 기기와 환경을 넘나들며 자율적으로 이동하고 소통하는 A2A 생태계로의 전환이 이미 시작되었습니다.",
  },
  {
    letter: "E",
    category: "Environmental",
    title: "AI가 촉발한\n데이터 센터의\n전력난과 과부하",
    description:
      "폭발적으로 증가하는 멀티모달 연산은 글로벌 데이터 인프라에 전례 없는 과부하를 유발해왔죠. 무분별한 클라우드 리소스의 낭비를 줄이고, 생태계 전체의 연산 효율을 극대화하는 지속 가능한 인프라로의 전환은 필수적입니다.",
  },
  {
    letter: "L",
    category: "Legal",
    title: "에이전트 경험의\n독점 규제와 표준\n프로토콜의 필요성",
    description:
      "일부 빅테크가 사용자를 독점하는 것에 대한 제도적 규제가 전 세계적으로 강화되고 있습니다. 서로 다른 진영 간의 장벽을 허물고 데이터와 에이전트를 자유롭게 상호 호환시킬 표준 프로토콜 규격이 필연적으로 요구되는 시점입니다.",
  },
];

export default function PestelSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;

  return (
    <section className={styles.section} aria-label="PESTEL 분석">
      <div className={`${styles.rail} ${isOpen ? styles.railOpen : ""}`}>
        {items.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <article
              key={`${item.category}-${index}`}
              className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
            >
              <button
                className={styles.selectButton}
                type="button"
                aria-expanded={isActive}
                aria-label={`${item.category} 상세 내용 보기`}
                onClick={() => setActiveIndex(index)}
              >
                <span className={styles.letter} aria-hidden="true">
                  {item.letter}
                </span>

                {!isOpen && (
                  <span className={styles.summary}>
                    <span className={styles.category}>{item.category}</span>
                    <strong className={styles.title}>{item.title}</strong>
                  </span>
                )}
              </button>

              {isActive && (
                <>
                  <button
                    className={styles.backButton}
                    type="button"
                    aria-label="전체 PESTEL 카드로 돌아가기"
                    onClick={() => setActiveIndex(null)}
                  >
                    <span aria-hidden="true">←</span>
                  </button>

                  <div className={styles.detail}>
                    <div className={styles.detailHeading}>
                      <span className={styles.category}>{item.category}</span>
                      <h2 className={styles.detailTitle}>{item.title}</h2>
                    </div>
                    <p className={styles.description}>{item.description}</p>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
