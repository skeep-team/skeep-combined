import { Reveal } from "../ui/Reveal";
import styles from "./ImageTextCard.module.css";

export function ImageTextCard() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.header}>
        <h2 className={styles.heading}>
          작별은 곧
          <br />
          완벽한 다음의 시작
        </h2>
        <p className={styles.body}>
          사용자의 맥락은 SKEEP 클라우드에
          <br />
          안전히 보관되어, 다음 환경을 만나는
          <br />
          즉시 매끄럽게 이어집니다.
        </p>
      </Reveal>
      <Reveal delay={0.1} className={styles.box}>
        <div className={styles.artwork} aria-label="END가 START로 이어지는 글로우 모션 아트워크">
          <div className={styles.scanField} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.wordStack}>
            <span className={`${styles.kineticWord} ${styles.endWord}`} data-text="END">
              END
            </span>
            <span className={`${styles.kineticWord} ${styles.startWord}`} data-text="START">
              START
            </span>
          </div>
          <div className={styles.waveBand} aria-hidden="true" />
          <div className={styles.motionDots} aria-hidden="true">
            <span />
            <span />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
