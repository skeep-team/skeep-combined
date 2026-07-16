"use client";

import { useCallback, useState } from "react";
import { FlashlightText } from "../ui/FlashlightText";
import { ScrambleText } from "../ui/ScrambleText";
import styles from "./ResetSequence.module.css";

// How long "패킷 회수 중..." holds, fully scrambled-in, before scrambling
// out into "다시, 처음처럼".
const HOLD_MS = 1400;

function PacketRecallSequence() {
  const [phase, setPhase] = useState(0);

  const advance = useCallback(() => {
    setTimeout(() => setPhase(1), HOLD_MS);
  }, []);

  return (
    <ScrambleText
      key={phase}
      text={phase === 0 ? "패킷 회수 중..." : "다시, 처음처럼"}
      className={styles.scramble}
      onEnterComplete={phase === 0 ? advance : undefined}
    />
  );
}

export function ResetSequence() {
  return (
    <section className={styles.section}>
      <FlashlightText
        text={"아무 일도 없었던 것처럼\n완벽한 리셋."}
        brightColor="#ffffff"
        dimColor="#3a3f47"
        className={styles.heading}
      />
      <PacketRecallSequence />
    </section>
  );
}
