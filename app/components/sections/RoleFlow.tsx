"use client";

import { useEffect, useState } from "react";
import styles from "./RoleFlow.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SLIDES = [
  `${BASE_PATH}/negotiation/role-flow-1.jpg`,
  `${BASE_PATH}/negotiation/role-flow-boarding.jpg`,
];

const SLIDE_INTERVAL_MS = 3200;

export function RoleFlow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className={styles.wrapper}>
      <div className={styles.box}>
        {SLIDES.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className={styles.photo}
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
      </div>
      <div className={styles.textLayer}>
        <p className={styles.heading}>각자의 역할을 모아 하나의 흐름으로</p>
        <p className={styles.body}>
          SKEEP은 연결된 환경의 능력을 읽고,
          <br />
          각 환경이 가장 잘할 수 있는 일을 선별해 맡깁니다.
        </p>
      </div>
    </section>
  );
}
