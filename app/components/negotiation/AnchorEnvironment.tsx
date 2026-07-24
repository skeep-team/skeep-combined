import type { CSSProperties } from "react";
import styles from "./AnchorEnvironment.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// 왼쪽으로 흐르는 순서 = 원본 영상 순환 순서. h = 박스 높이 대비 상대 높이(원본 비율).
const DEVICES = [
  { key: "car", alt: "자동차", h: 40 },
  { key: "box", alt: "AMUGEONA 커피머신", h: 52 },
  { key: "phone", alt: "스마트폰", h: 62 },
  { key: "laptop", alt: "노트북", h: 42 },
  { key: "buds", alt: "무선 이어버즈", h: 26 },
] as const;

// 매끄러운 무한 루프를 위해 세트를 2벌 이어붙인다(총 10칸).
const TRACK = [...DEVICES, ...DEVICES];

export function AnchorEnvironment() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Environment States</p>
      </div>
      <div className={styles.textBlock}>
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
      </div>
      <div className={styles.box}>
        <div className={styles.conveyor} aria-hidden="true">
          <div className={styles.track}>
            {TRACK.map((d, i) => (
              <div key={i} className={styles.slot} data-device={d.key}>
                <div
                  className={styles.device}
                  style={{ "--h": `${d.h}%` } as CSSProperties}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.black}
                    src={`${BASE_PATH}/negotiation/devices/${d.key}-black.webp`}
                    alt=""
                    draggable={false}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.color}
                    src={`${BASE_PATH}/negotiation/devices/${d.key}-color.webp`}
                    alt=""
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <span className={styles.anchorDot} aria-hidden="true" />
      </div>
    </section>
  );
}
