import { Reveal } from "../ui/Reveal";
import styles from "./IcebreakSkip.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function SkipIcon() {
  return (
    <svg
      className={styles.skipIcon}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="12" fill="#FFE7F1" />
      <polygon points="7.2,8.2 7.2,15.8 12.8,12" fill="#FF3385" />
      <polygon points="12.4,8.2 12.4,15.8 18,12" fill="#FF3385" />
    </svg>
  );
}

export function IcebreakSkip() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.textBlock}>
        <h2 className={styles.heading}>
          반복되는
          <br />
          아이스브레이킹은
          <br />
          스킵
          <SkipIcon />
        </h2>
        <p className={styles.body}>
          낯선 환경과의 첫인사는 SKEEP이 맡고, 사용자는 반복된 자기소개 대신
          하려던 일을 바로 시작할 수 있습니다.
        </p>
      </Reveal>
      <Reveal delay={0.15} className={styles.visual}>
        <video
          className={styles.noiseVideo}
          src={`${BASE_PATH}/icebreak/noise.mp4`}
          autoPlay
          muted
          loop
          playsInline
        />
      </Reveal>
    </section>
  );
}
