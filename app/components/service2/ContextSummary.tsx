import { Reveal } from "../ui/Reveal";
import styles from "./ContextSummary.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function ContextSummary() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.summary}>
        <h2 className={styles.heading}>
          맥락은
          <br />
          오직 내 손 안에
        </h2>
        <p className={styles.body}>
          상호작용이 종료되는 즉시, 발생한 모든 맥락과 이력은 사용자의 SKEEP
          클라우드로 완벽하게 백업됩니다.
        </p>
      </Reveal>
      <Reveal delay={0.1} className={styles.box}>
        <img
          className={styles.image}
          src={`${BASE_PATH}/service2/context-summary.png`}
          alt=""
        />
      </Reveal>
    </section>
  );
}
