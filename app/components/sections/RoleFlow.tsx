"use client";

import { useEffect, useState } from "react";
import styles from "./RoleFlow.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SLIDES = [
  `${BASE_PATH}/negotiation/role-flow-1.jpg`,
  `${BASE_PATH}/negotiation/role-flow-2.jpg`,
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
            key={src}
            src={src}
            alt=""
            className={styles.photo}
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
        {/* 두 번째 슬라이드: 텍스트를 굽지 않은 사진 위에 딤 + 라벨을 직접 얹는다
            (피그마 시안 node 9045:24396 좌표를 1179x469 프레임 기준 %로 변환). */}
        <div
          className={styles.annotation}
          style={{ opacity: active === 1 ? 1 : 0 }}
          aria-hidden={active !== 1}
        >
          <div className={styles.annotationDim} />
          <p className={styles.annotationTitle}>Boarding a flight</p>
          <svg
            className={styles.annotationLines}
            viewBox="0 0 1179 469"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="502.87" y1="248.79" x2="200.89" y2="363.29" />
            <line x1="502.87" y1="248.79" x2="884.52" y2="356.61" />
          </svg>
          <span className={styles.annotationNumber} style={{ left: "19.19%", top: "65.11%" }}>
            (1)
          </span>
          <span className={styles.annotationNumber} style={{ left: "44.61%", top: "40.51%" }}>
            (2)
          </span>
          <span className={styles.annotationNumber} style={{ left: "77.24%", top: "63.38%" }}>
            (3)
          </span>
          <span className={styles.annotationLabel} style={{ left: "16.71%", top: "72.66%" }}>
            <i className={styles.annotationDot} />
            Flight App
          </span>
          <span className={styles.annotationLabel} style={{ left: "42.32%", top: "48.25%" }}>
            <i className={styles.annotationDot} />
            Check-in Kiosk
          </span>
          <span className={styles.annotationLabel} style={{ left: "74.7%", top: "71.24%" }}>
            <i className={styles.annotationDot} />
            Lounge
          </span>
        </div>
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
