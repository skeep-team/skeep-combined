import { Reveal } from "../ui/Reveal";
import styles from "./ProtectionPrinciples.module.css";

const CARDS = [
  {
    label: "Principle 01",
    title: "Continuity",
    body: "사용자가 불가피하게 자원이나 공간을 양보한 경우, 시스템은 일정 기간 사용자의 상태를 우선적으로 유지하여 온전한 흐름을 보호합니다.",
  },
  {
    label: "Principle 02",
    title: "Flexibility",
    body: "시설 장애나 긴급 상황 발생 시, 시스템은 기존의 보호 원칙을 유연하게 재검토하여 사용자의 안전을 최우선으로 확보합니다.",
  },
  {
    label: "Principle 03",
    title: "Autonomy",
    body: "시스템의 대안 탐색이 한계에 도달할 경우, 투명하게 상황을 알리고 최종 결정권을 온전히 사용자에게 위임합니다.",
  },
];

export function ProtectionPrinciples() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.header}>
        <h2 className={styles.heading}>경험이 멈추지 않도록</h2>
        <p className={styles.body}>
          SKEEP은 사용자가 이미 시작한 목적 경험을 보호합니다. 만약
          불가피하게 환경을 조정했다면, 다음 협상에서는 그 경험이 다시
          흔들리지 않도록 일정 기간 흐름을 보호하죠.
        </p>
      </Reveal>
      <div className={styles.cards}>
        {CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08} className={styles.card}>
            <div className={styles.cardTitleBlock}>
              <p className={styles.cardLabel}>{card.label}</p>
              <p className={styles.cardTitle}>{card.title}</p>
            </div>
            <p className={styles.cardBody}>{card.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
