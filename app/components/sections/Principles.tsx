import { Reveal } from "../ui/Reveal";
import styles from "./Principles.module.css";

const PRINCIPLES = [
  {
    title: ["필요한 순간,", "가장 적합하게"],
    body: ["환경의 제약 없이, 지금 당신에게 필요한", "AI 피쳐를 즉시 불러옵니다."],
    background: "#02a3fe",
    color: "#fff5c1",
  },
  {
    title: ["새로운 도구를", "찾을 필요 없이"],
    body: ["물리적인 하드웨어를 더하지 않아도,", "현재의 환경 안에서 최적화된 능력을 실행합니다."],
    background: "#3fb875",
    color: "#ffe74d",
  },
  {
    title: ["사용이 끝나면,", "흔적 없이"],
    body: ["다운로드 후 사용이 종료되면,", "목적을 다한 능력은 깔끔하게 정리됩니다."],
    background: "#ff3385",
    color: "#ffe7f1",
  },
];

export function Principles() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.textBlock}>
        <h2 className={styles.heading}>
          사용자의 환경이
          <br />
          완전해지는 순간까지
        </h2>
        <p className={styles.body}>
          현재 환경에 없는 AI 기능도, SKEEP은 필요한 순간 필요한 기능을
          다운로드해 사용할 수 있습니다. 사용이 끝나면, 권한과 함께 바로
          사라지죠.
        </p>
      </div>
      <div className={styles.visualColumn}>
        {PRINCIPLES.map((p, i) => (
          <Reveal
            key={p.title.join(" ")}
            delay={i * 0.1}
            className={styles.card}
            style={{ background: p.background, color: p.color }}
          >
            <div className={styles.cardTop}>
              <span className={styles.eyebrow}>Principle 0{i + 1}</span>
              <p className={styles.cardTitle}>
                {p.title.map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < p.title.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
            <p className={styles.cardBody}>
              {p.body.map((line, j) => (
                <span key={j}>
                  {line}
                  {j < p.body.length - 1 && <br />}
                </span>
              ))}
            </p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
