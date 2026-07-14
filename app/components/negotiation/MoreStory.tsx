"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FlowChartModal } from "./FlowChartModal";
import styles from "./MoreStory.module.css";

// Bounce settle time for the circle's spring pop-in (see the scale transition
// below) — the sideways unfold only starts once the pop has visibly landed.
const POP_SETTLE_DELAY = 480;

export function MoreStory() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => setExpanded(true), POP_SETTLE_DELAY);
    return () => clearTimeout(id);
  }, [inView]);

  return (
    <section className={styles.section} ref={sectionRef}>
      <motion.button
        type="button"
        layout
        className={expanded ? styles.pill : `${styles.pill} ${styles.pillCollapsed}`}
        onClick={() => setOpen(true)}
        aria-label="협상에 대한 더 자세한 이야기"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={inView ? { opacity: 1, scale: 1 } : undefined}
        transition={{
          scale: { type: "spring", stiffness: 260, damping: 14, mass: 0.9 },
          opacity: { duration: 0.2 },
          layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        {expanded && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
            협상에 대한 더 자세한 이야기
          </motion.span>
        )}
      </motion.button>
      <FlowChartModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
