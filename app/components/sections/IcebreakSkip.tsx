import { Reveal } from "../ui/Reveal";
import styles from "./IcebreakSkip.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// 영상(noise.mp4) 재현 → 무스 호환 CSS. 볼드 하이라이트(이모지+상황)는 #139 배치대로 고정,
// 흐린 자기소개 "노이즈"가 양쪽에서 슬라이드-인 했다가 빠짐(=#139 시작 → #140 풀 → 반복).
// 이모지는 임시(추후 아이콘 교체). top/left = 영상 프레임에서 실측한 하이라이트 위치.
const NOISE_ROWS = [
  { top: "18%", left: "5%",  delay: "0s",   icon: "icon-taxi.png",    hl: "택시를 탈 때도", ctxL: "집에 가려고 앱을 켜서", ctxR: "나 지금 빨리 우리집 가고 싶어서" },
  { top: "39%", left: "47%", delay: "0.1s", icon: "icon-luggage.png", hl: "여행을 갈 때도", ctxL: "매번 설명해야 했고 내가 원하는건", ctxR: "항공권이랑 숙소 다 예약하고" },
  { top: "61%", left: "30%", delay: "0.2s", icon: "",                 hl: "",              ctxL: "나 지금 시험공부하려고 왔으니까", ctxR: "음악은 잔잔한 걸로 조명도 낮춰줬으면" },
  { top: "82%", left: "12%", delay: "0.3s", icon: "icon-coffee.png",  hl: "카페에서도",     ctxL: "오늘 주문할 메뉴는", ctxR: "내가 평소에 좋아하는 아이스 아메리카노" },
] as const;

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
        <div className={styles.noiseCard} aria-hidden="true">
          {NOISE_ROWS.map((row, i) => (
            <div
              key={i}
              className={`${styles.noiseRow}${row.hl ? "" : ` ${styles.noiseRowPlain}`}`}
              style={{ top: row.top }}
            >
              <span className={styles.noiseHl} style={{ left: row.left }}>
                <span className={styles.noiseCtxL}>
                  <span className={styles.ctxSlideL} style={{ animationDelay: row.delay }}>
                    {row.ctxL}
                  </span>
                </span>
                {row.icon && (
                  <img
                    className={styles.noiseIcon}
                    src={`${BASE_PATH}/icebreak/${row.icon}`}
                    alt=""
                    draggable={false}
                  />
                )}
                {row.hl}
                <span className={styles.noiseCtxR}>
                  <span className={styles.ctxSlideR} style={{ animationDelay: row.delay }}>
                    {row.ctxR}
                  </span>
                </span>
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
