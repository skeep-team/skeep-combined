import styles from "./StatusMorph.module.css";

/**
 * 영상(9.8s, 882×886, 검정 배경 위 흰 도형) 프레임 분석 결과를 그대로 옮긴
 * "상태 표시" 모프 애니메이션. 순수 CSS keyframes만 사용한다(JS 없음, 무빙스타일
 * 프로젝터 기준 경량 유지).
 *
 * 단계: 스파클 반짝임 → 다이아몬드 페이드인 → 다이아몬드 펄스(4개로 벌어졌다 복귀)
 * → 다이아몬드→정사각형 회전 분할 → 정사각형 → 점 3개로 분해 → 점이 막대로 늘어나며
 * 이퀄라이저처럼 움직임 → 페이드아웃 → (루프)
 *
 * .quad의 4개 cell은 두 분할 구간에서 서로 다른 목적지로 움직인다:
 * 1차 분할(다이아몬드 펄스)은 상/하/좌/우로, 2차 분할(다이아몬드→정사각형)은
 * 네 모서리(대각선)로 — 두 구간 모두 같은 타임라인 위에서 opacity로 가려진 채
 * 순간 이동하므로 눈에 보이는 점프는 없다.
 */
export function StatusMorph({ className }: { className?: string }) {
  return (
    <div
      className={className ? `${styles.stage} ${className}` : styles.stage}
      aria-hidden="true"
    >
      <span className={styles.sparkle} />
      <span className={styles.core} />
      <span className={styles.quad}>
        <span className={styles.cell} />
        <span className={styles.cell} />
        <span className={styles.cell} />
        <span className={styles.cell} />
      </span>
      <span className={styles.bars}>
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </span>
    </div>
  );
}
