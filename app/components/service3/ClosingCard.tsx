import { Reveal } from "../ui/Reveal";
import styles from "./ClosingCard.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function ClosingCard() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.reveal}>
        <video
          className={styles.bgVideo}
          src={`${BASE_PATH}/service3/closing-bg.mp4`}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={styles.textBlock}>
          <h2 className={styles.heading}>
            쓰면 쓸수록
            <br />
            사용자를 더 깊게
          </h2>
          <p className={styles.body}>
            사용자의 모든 경험은 더 나은 환경을 위한 데이터가 됩니다.
            <br />
            반복될수록 더 매끄러운 경험, 가장 나다운 SKEEP을 만나보세요!
          </p>
        </div>
      </Reveal>
    </section>
  );
}
