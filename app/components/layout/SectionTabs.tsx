"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SectionTabs.module.css";

export type SectionTab = {
  id: string;
  line1: string;
  line2?: string;
};

type SectionTabsProps = {
  tabs: SectionTab[];
  /** 이 바의 높이를 노출할 CSS 변수 이름 — 각 섹션의 scroll-margin-top이 바에 가리지 않게 함. */
  cssVar: string;
  ariaLabel: string;
  /** 페이지 표지(첫 번째 탭 섹션)를 보는 동안은 탭바를 완전히 숨기고, 두 번째
      섹션부터 드러낸다. fixed로 둬서 숨긴 동안 문서 흐름에 공간을 예약하지
      않는다 — negotiation/service2처럼 SectionTabs가 표지 바로 앞(페이지 맨 위)에
      놓이는 경우에만 켠다. business처럼 표지 뒤에 이미 배치돼 있어 자연히 안
      보이는 페이지는 필요 없다(기본값 false로 기존 sticky 동작 유지). */
  hideUntilPastFirst?: boolean;
  /** 호출하는 페이지가 자기 typography(예: 특정 폰트 굵기)로 탭바를 덮어쓰고
      싶을 때 붙이는 추가 클래스. */
  className?: string;
};

/* app/business/BusinessTabs.tsx를 일반화한 버전 — 페이지마다 탭 목록과
   CSS 변수 이름만 다르고 동작(활성 탭 추적, 높이 발행, 클릭 시 스크롤)은 동일하다. */
export function SectionTabs({
  tabs,
  cssVar,
  ariaLabel,
  hideUntilPastFirst = false,
  className,
}: SectionTabsProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const [isPastFirst, setIsPastFirst] = useState(!hideUntilPastFirst);

  useEffect(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    const publishHeight = () => {
      document.documentElement.style.setProperty(
        cssVar,
        `${Math.round(bar.getBoundingClientRect().height)}px`,
      );
    };

    publishHeight();

    const observer = new ResizeObserver(publishHeight);
    observer.observe(bar);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(cssVar);
    };
  }, [cssVar]);

  // 표지(첫 탭 섹션)가 화면에서 완전히 지나가면(bottom <= 0) 탭바를 드러낸다.
  useEffect(() => {
    if (!hideUntilPastFirst) {
      return;
    }

    const firstId = tabs[0]?.id;

    if (!firstId) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;

      const section = document.getElementById(firstId);

      setIsPastFirst(section ? section.getBoundingClientRect().bottom <= 0 : true);
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
  }, [hideUntilPastFirst, tabs]);

  // 스크롤 위치에 따라 활성 탭 갱신. 바 바로 아래를 통과한 마지막 섹션이 활성.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const line = (barRef.current?.getBoundingClientRect().bottom ?? 0) + 1;
      let current = tabs[0]?.id;

      for (const tab of tabs) {
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
  }, [tabs]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  const barClassName = [
    styles.bar,
    hideUntilPastFirst && styles.hideUntilPastFirst,
    hideUntilPastFirst && isPastFirst && styles.isVisible,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={barRef} className={barClassName}>
      <nav className={styles.inner} aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={styles.tab}
            data-active={tab.id === activeId}
            aria-current={tab.id === activeId ? "true" : undefined}
            onClick={() => scrollToSection(tab.id)}
          >
            <span>{tab.line1}</span>
            {tab.line2 && <span>{tab.line2}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
