"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BusinessTabs.module.css";

export const businessTabs = [
  { id: "corporate-mission", line1: "Corporate", line2: "Mission" },
  { id: "market-imperative", line1: "Market", line2: "Imperative" },
  { id: "core-positioning", line1: "Core", line2: "Positioning" },
  { id: "business-portfolio", line1: "Business", line2: "Portfolio" },
  { id: "value-proposition", line1: "Value", line2: "Proposition" },
  { id: "our-footprint", line1: "Our", line2: "Footprint" },
];

export default function BusinessTabs() {
  const barRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(businessTabs[0].id);

  // 바 높이를 CSS 변수로 노출 → 각 섹션의 scroll-margin-top이 바에 가리지 않게 함.
  useEffect(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    const publishHeight = () => {
      document.documentElement.style.setProperty(
        "--business-tabbar-h",
        `${Math.round(bar.getBoundingClientRect().height)}px`,
      );
    };

    publishHeight();

    const observer = new ResizeObserver(publishHeight);
    observer.observe(bar);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--business-tabbar-h");
    };
  }, []);

  // 스크롤 위치에 따라 활성 탭 갱신. 바 바로 아래를 통과한 마지막 섹션이 활성.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const line = (barRef.current?.getBoundingClientRect().bottom ?? 0) + 1;
      let current = businessTabs[0].id;

      for (const tab of businessTabs) {
        const section = document.getElementById(tab.id);

        if (section && section.getBoundingClientRect().top <= line) {
          current = tab.id;
        }
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <div ref={barRef} className={styles.bar}>
      <nav className={styles.inner} aria-label="비즈니스 섹션">
        {businessTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={styles.tab}
            data-active={tab.id === activeId}
            aria-current={tab.id === activeId ? "true" : undefined}
            onClick={() => scrollToSection(tab.id)}
          >
            <span>{tab.line1}</span>
            <span>{tab.line2}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
