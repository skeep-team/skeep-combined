"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { DustText } from "../ui/DustText";
import styles from "./LeaveNothing.module.css";

export function LeaveNothing() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });
  // 1 = fully formed word, 0 = fully dispersed particles. Holds formed at the
  // top of the scroll range, then dissolves as the section scrolls past.
  const formProgress = useTransform(scrollYProgress, [0.25, 0.75], [1, 0]);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.section}>
        <div className={styles.content}>
          <DustText text="LEAVE" tag="p" className={styles.leave} progress={formProgress} />
          <DustText text="NOTHING." tag="p" className={styles.nothing} progress={formProgress} />
          <p className={styles.body}>
            환경은 특정 순간에만 사용자를 알게 됩니다.
            <br />
            상호작용이 끝나면 패킷은 회수되어 환경은 사용자에 대한 정보를 잊게 되죠.
          </p>
        </div>
      </div>
    </div>
  );
}
