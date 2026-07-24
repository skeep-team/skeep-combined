import { Reveal } from "../ui/Reveal";
import styles from "./CTA.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function CTA() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.textBlock}>
        <h2 className={styles.heading}>
          멈춘 곳에서 다시,
          <br />
          이어서 SKEEP하기
        </h2>
        <p className={styles.body}>
          지금의 환경에서 끝내지 못한 일은 패킷에 남아 다음 환경으로 함께
          이동합니다. 이어갈 수 있는 환경을 만나면, SKEEP은 자연스럽게 남은
          흐름을 다시 이어가죠!
        </p>
      </Reveal>
      <Reveal delay={0.15} className={styles.visual}>
        {/* 영상(restart.mp4) 재현 → 무스 호환 CSS. 표지판은 고정, 원 안 화살표만 회전.
            영상 버전은 백업 레포(skeep-combined-video)에 보존. */}
        <div className={styles.signWrap} aria-hidden="true">
          <img
            className={styles.signBase}
            src={`${BASE_PATH}/cta/restart-sign.png`}
            alt=""
            draggable={false}
          />
          <img
            className={styles.arrow}
            src={`${BASE_PATH}/cta/restart-arrow.png`}
            alt=""
            draggable={false}
          />
        </div>
      </Reveal>
    </section>
  );
}
