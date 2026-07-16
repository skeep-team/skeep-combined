import { FlashlightText } from "../ui/FlashlightText";
import styles from "./ResetSequence.module.css";

export function ResetSequence() {
  return (
    <section className={styles.section}>
      <FlashlightText
        text={"아무 일도 없었던 것처럼\n완벽한 리셋."}
        brightColor="#ffffff"
        dimColor="#3a3f47"
        className={styles.heading}
      />
    </section>
  );
}
