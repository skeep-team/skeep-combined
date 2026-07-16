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
        <div className={styles.artwork} aria-label="SKEEP이 이전 환경의 맥락을 안전히 보관하고 다음 환경으로 이어주는 아트워크">
          <div className={styles.environmentBefore}>
            <span className={styles.deviceTop} />
            <span className={styles.deviceLine} />
            <span className={styles.deviceLine} />
            <span className={styles.deviceDot} />
          </div>
          <div className={styles.environmentAfter}>
            <span className={styles.deviceTop} />
            <span className={styles.deviceLine} />
            <span className={styles.deviceLine} />
            <span className={styles.deviceDot} />
          </div>
          <svg className={styles.flow} viewBox="0 0 1200 620" role="presentation" aria-hidden="true">
            <path className={styles.flowBase} d="M190 330 C 360 210, 485 245, 600 310 S 835 410, 1010 290" />
            <path className={styles.flowActive} d="M190 330 C 360 210, 485 245, 600 310 S 835 410, 1010 290" />
            <path className={styles.flowSoft} d="M220 395 C 380 500, 492 445, 610 370 S 815 240, 980 345" />
          </svg>
          <div className={styles.archive}>
            <span className={styles.archiveLabel}>SKEEP CLOUD</span>
            <span className={styles.archiveTitle}>Context saved</span>
            <div className={styles.archiveRows}>
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={`${styles.contextCard} ${styles.contextCardOne}`}>
            <span>Intent</span>
            <strong>protected</strong>
          </div>
          <div className={`${styles.contextCard} ${styles.contextCardTwo}`}>
            <span>Trace</span>
            <strong>cleared</strong>
          </div>
          <div className={`${styles.contextCard} ${styles.contextCardThree}`}>
            <span>Next</span>
            <strong>ready</strong>
          </div>
          <div className={styles.transferDots} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
