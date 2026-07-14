"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import styles from "./Cursor.module.css";

type CursorVariant = "default" | "flip";

const CursorVariantContext = createContext<(variant: CursorVariant) => void>(() => {});

export function useCursorVariant() {
  return useContext(CursorVariantContext);
}

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    setEnabled(finePointer);
    if (!finePointer) return;

    function handleMove(e: MouseEvent) {
      const dot = dotRef.current;
      if (!dot) return;
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      setVisible(true);
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <CursorVariantContext.Provider value={setVariant}>
      {children}
      {enabled && (
        <div
          ref={dotRef}
          className={[styles.cursor, variant === "flip" ? styles.cursorFlip : "", visible ? styles.cursorVisible : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {variant === "flip" && <span className={styles.cursorLabel}>Flip</span>}
        </div>
      )}
    </CursorVariantContext.Provider>
  );
}
