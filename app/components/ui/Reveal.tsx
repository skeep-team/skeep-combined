"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

const REVEAL_FALLBACK_DELAY = 1200;

export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  style,
  once = true,
}: {
  children?: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
}) {
  const [fallbackVisible, setFallbackVisible] = useState(false);

  useEffect(() => {
    // Some embedded TV browsers intermittently fail to deliver the
    // IntersectionObserver event used by Framer Motion's whileInView. Never
    // leave content permanently hidden when that happens: after a short
    // grace period, reveal it through the regular animate channel.
    const timer = window.setTimeout(
      () => setFallbackVisible(true),
      REVEAL_FALLBACK_DELAY + delay * 1000,
    );

    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={fallbackVisible ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.3 }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
