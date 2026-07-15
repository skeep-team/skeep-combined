import { Reveal } from "../ui/Reveal";
import styles from "./AnchorEnvironment.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function AnchorEnvironment() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.header}>
        <p className={styles.eyebrow}>Environment States</p>
      </Reveal>
      <Reveal delay={0.05} className={styles.textBlock}>
        <h2 className={styles.heading}>
          앵커 지정
          <br />: Anchor on
        </h2>
        <p className={styles.body}>
          사용자가 소유한 환경을 앵커 환경으로 지정하면, 환경에 SKEEP을
          부여해 사용자의 규칙을 설정하고 관리할 수 있습니다. 만약 당신이
          카페 사장님이라면, 카페를 &apos;앵커 환경&apos;으로 지정해보세요.
          당신이 없는 순간에도 SKEEP이 공간의 규칙을 세심하게 관리합니다.
          당신은 온전히 당신의 시간에만 집중하세요.
        </p>
      </Reveal>
      <Reveal delay={0.1} className={styles.box}>
        <video
          className={styles.boxVideo}
          src={`${BASE_PATH}/negotiation/anchor-environment.mp4`}
          autoPlay
          muted
          loop
          playsInline
        />
      </Reveal>
    </section>
  );
}
