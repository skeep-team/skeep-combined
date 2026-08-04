import { Reveal } from "../components/ui/Reveal";
import styles from "./CorporateMission.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const CARDS = [
  {
    label: "For Users",
    title: "Continuity",
    body: ["사용자 경험을 위한", "스킵의 약속"],
    image: "continuity-card.png",
  },
  {
    label: "For Partners",
    title: "Neutrality",
    body: ["시장과 파트너를 향한", "스킵의 중립적인 태도"],
    image: "neutrality-card.png",
  },
  {
    label: "For Ecosystem",
    title: "Sustainability",
    body: ["미래 인프라를 향한", "스킵의 책임 의식"],
    image: "sustainability-card.png",
  },
] as const;

export default function CorporateMission() {
  return (
    <section id="corporate-mission" className={styles.section}>
      <Reveal className={styles.header}>
        <strong>Corporate<br />Mission</strong>
        <span>스킵의 경영 원칙<br />이유와 철학</span>
        <i className={styles.headerMark} aria-hidden="true" />
      </Reveal>
      <div className={styles.cards}>
        {CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.1} className={styles.card}>
            <div className={styles.visual}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.visualImage}
                src={`${BASE_PATH}/business/mission/${card.image}`}
                alt=""
              />
            </div>
            <div className={styles.cardText}>
              <p className={styles.cardLabel}>{card.label}</p>
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
