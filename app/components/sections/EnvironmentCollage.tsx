import { Reveal } from "../ui/Reveal";
import styles from "./EnvironmentCollage.module.css";

export function EnvironmentCollage() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.summary}>
        <h2 className={styles.heading}>
          어떤 환경에서도
          <br />
          사용자를 기준으로
        </h2>
        <p className={styles.body}>
          결제 한도, 정보 공유 범위, 제어 권한까지.
          <br />
          SKEEP은 환경이 바뀌어도,
          <br />
          사용자의 기준 안에서만 움직입니다.
        </p>
      </Reveal>
      <Reveal delay={0.1} className={styles.box}>
        <div className={styles.collageStage} aria-hidden="true">
          <div className={styles.collageCard} />
          <span className={styles.collageLabel}>User</span>
        </div>
      </Reveal>
    </section>
  );
}
