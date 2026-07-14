import { Reveal } from "../ui/Reveal";
import styles from "./EvaluationCriteria.module.css";

const CRITERIA = [
  {
    en: "Urgency",
    ko: "긴급도",
    desc: "지금 바로 해결해야 할 일과 나중으로 미뤄도 될 일을 스스로 구분합니다",
  },
  {
    en: "Impact",
    ko: "영향 범위",
    desc: "나의 선택이 주변에 끼칠 영향을 살펴, 모두에게 가장 편안한 상태를 만듭니다",
  },
  {
    en: "Duration",
    ko: "사용 시간",
    desc: "내가 머무는 시간 동안 가장 쾌적한 환경이 유지되도록 알아서 조율합니다",
  },
  {
    en: "Options",
    ko: "대체 가능성",
    desc: "원하던 방식이 어렵다면, 가장 비슷한 대안을 찾아 중단 없이 이어갑니다",
  },
];

function CardDot({ className }: { className: string }) {
  return <span className={className} />;
}

export function EvaluationCriteria() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.textBlock}>
        <h2 className={styles.heading}>
          더 나은 조율을 위한
          <br />
          4가지 섬세한 시선
        </h2>
        <p className={styles.body}>
          SKEEP은 사용자의 사적인 이유나 목적의 가치를 판단하지 않습니다.
          대신 목적을 이어가기 위해 필요한 시간과 자원, 대체 수단만 살펴
          서로의 조건을 조율하죠.
        </p>
      </div>
      <div className={styles.visualColumn}>
        {CRITERIA.map((c, i) => (
          <Reveal
            key={c.en}
            delay={i * 0.08}
            className={i % 2 === 0 ? `${styles.card} ${styles.cardLight}` : `${styles.card} ${styles.cardDark}`}
          >
            <CardDot className={styles.dotTopLeft} />
            <CardDot className={styles.dotTopRight} />
            <CardDot className={styles.dotBottomLeft} />
            <CardDot className={styles.dotBottomRight} />
            <div className={styles.cardTitle}>
              <p className={styles.cardKo}>{c.ko}</p>
              <p className={styles.cardEn}>{c.en}</p>
            </div>
            <p className={styles.cardDesc}>{c.desc}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
