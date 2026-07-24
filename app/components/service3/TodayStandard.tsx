import { Reveal } from "../ui/Reveal";
import styles from "./TodayStandard.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// 경량화: today-standard-bg.mp4(원형 사진들이 왼쪽으로 흐르는 마퀴) 대신
// 실제 사진(컬러 오버레이가 이미 합성된 원형 PNG) + CSS 애니메이션
// (무빙스타일 호환 + 항상 재생).
const PHOTOS = [
  { src: "washer.png", alt: "세탁기 안을 들여다보는 가족" },
  { src: "kiosk.png", alt: "공항 키오스크를 사용하는 사람" },
  { src: "gym.png", alt: "헬스장 내부" },
  { src: "basketball.png", alt: "농구공을 든 손목의 스마트워치" },
  { src: "headphones.png", alt: "헤드폰을 끼고 누워있는 사람" },
  { src: "office.png", alt: "사무실 내부" },
] as const;

function PhotoCircle({ photo }: { photo: (typeof PHOTOS)[number] }) {
  return (
    <div className={styles.circle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE_PATH}/service3/today-standard-collage/${photo.src}`}
        alt={photo.alt}
        draggable={false}
      />
    </div>
  );
}

export function TodayStandard() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.textBlock}>
        <h2 className={styles.heading}>
          오늘의 경험이
          <br />
          내일의 기준으로
        </h2>
        <p className={styles.body}>
          사용자가 환경과 나누는 모든 상호작용은 사용자를 더 깊이 이해하기
          위한 언어가 됩니다. 이를 통해 사용자의 다음 경험을 더 완벽히
          완성하죠.
        </p>
      </Reveal>
      <Reveal delay={0.1} className={styles.box}>
        <div className={styles.marqueeWrap} aria-hidden="true">
          <div className={styles.track}>
            {PHOTOS.map((photo, i) => (
              <PhotoCircle photo={photo} key={`a${i}`} />
            ))}
            {PHOTOS.map((photo, i) => (
              <PhotoCircle photo={photo} key={`b${i}`} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
