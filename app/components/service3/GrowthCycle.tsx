import { Reveal } from "../ui/Reveal";
import styles from "./GrowthCycle.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const CARDS = [
  {
    title: "Learning",
    body: ["사용자의 취향과 맥락을 기록하며", "더 깊이 알아갑니다."],
    image: "learning-card.png",
  },
  {
    title: "Syncing",
    body: ["상호작용 속에서 사용자의 맥락은", "스스로 최적화됩니다."],
    image: "syncing-card.png",
  },
  {
    title: "Refining",
    body: ["피드백은 바로 반영되어", "다음 만남부터 기준이 우선 적용됩니다."],
    image: "refining-card.png",
  },
] as const;

export function GrowthCycle() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.header}>
        <h2 className={styles.heading}>설명하지 않아도 알아서 척척.</h2>
        <p className={styles.body}>
          사용자와 SKEEP이 함께한 시간만큼 서로가 익숙해집니다.
          <br />
          복잡한 설명 없이도, 내 맥락을 이해하고 매끄럽게 준비된 환경을
          마주해보세요!
        </p>
      </Reveal>
      <div className={styles.cards}>
        {CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.1} className={styles.card}>
            <div className={styles.visual}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.visualImage} src={`${BASE_PATH}/service3/${card.image}`} alt="" />
            </div>
            <div className={styles.cardText}>
              <p className={styles.cardTitle}>{card.title}</p>
              <p className={styles.cardBody}>
                {card.body.map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < card.body.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
