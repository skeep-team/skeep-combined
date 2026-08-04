"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* 화면에 들어오는 순간 한 번만 켠다. 스크롤에 물리지 않고 CSS 전환에 맡겨서,
   그냥 스크롤되어 올라오는 것과 확실히 구분되게 한다. */
export default function ScrollFadeIn({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    /* IntersectionObserver가 없는 브라우저에서는 그냥 켜 둔다(전환만 없다). */
    if (typeof IntersectionObserver === "undefined") {
      element.dataset.shown = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.dataset.shown = "true";
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-shown="false">
      {children}
    </div>
  );
}
