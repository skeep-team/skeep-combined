"use client";

import { useState } from "react";
import { useCursorVariant } from "../ui/Cursor";
import { Reveal } from "../ui/Reveal";
import styles from "./EnvironmentLayers.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Checkerboard: every other card (by row+col parity) starts flipped to its
// text face, matching the reference layout — clicking toggles either way.
const CARDS = [
  { name: "Cafe", flipped: false },
  { name: "Smartphone", flipped: true },
  { name: "Payment", flipped: false },
  { name: "Hotel", flipped: true },
  { name: "Speaker", flipped: true },
  { name: "Airport", flipped: false },
  { name: "Car", flipped: true },
  { name: "Map", flipped: false },
].map((card, i) => ({
  ...card,
  front: `${BASE_PATH}/negotiation/environment/card${i + 1}-front.jpg`,
  back: `${BASE_PATH}/negotiation/environment/card${i + 1}-back.jpg`,
}));

export function EnvironmentLayers() {
  const [flipped, setFlipped] = useState(CARDS.map((c) => c.flipped));
  const setCursorVariant = useCursorVariant();

  function toggle(i: number) {
    setFlipped((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <section
      className={styles.section}
      onMouseEnter={() => setCursorVariant("flip")}
      onMouseLeave={() => setCursorVariant("default")}
    >
      <Reveal className={styles.header}>
        <p className={styles.eyebrow}>Environment States</p>
      </Reveal>
      <Reveal delay={0.05} className={styles.textBlock}>
        <h2 className={styles.heading}>
          환경 활성화
          <br />: Skeep on
        </h2>
        <p className={styles.body}>
          사용자가 현재 상호작용 중인 환경입니다.
          <br />
          여러 환경이 동시에 주력이 될 수 있으며, 그 중 사용자가 직접 조작하는
          접점에는 SKEEP의 상태와 인터페이스가 나타납니다.
        </p>
      </Reveal>
      <div className={styles.grid}>
        {CARDS.map((card, i) => (
          <button
            key={card.name}
            type="button"
            className={styles.cardButton}
            onClick={() => toggle(i)}
            aria-label={`${card.name} 카드 뒤집기`}
          >
            <div className={flipped[i] ? `${styles.flipper} ${styles.flipperFlipped}` : styles.flipper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={`${styles.face} ${styles.faceFront}`} src={card.front} alt={card.name} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={`${styles.face} ${styles.faceBack}`} src={card.back} alt={card.name} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
