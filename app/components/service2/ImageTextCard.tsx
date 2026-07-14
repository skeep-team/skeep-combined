import { Reveal } from "../ui/Reveal";
import styles from "./ImageTextCard.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
        <video
          className={styles.video}
          src={`${BASE_PATH}/service2/farewell.mp4`}
          autoPlay
          muted
          loop
          playsInline
        />
      </Reveal>
    </section>
  );
}
