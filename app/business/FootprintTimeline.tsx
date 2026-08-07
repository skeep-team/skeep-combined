"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FootprintTimeline.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type TimelineEntry = {
  year: string;
  title: string[];
  body: string;
  image: string;
  alt: string;
};

/* 왼쪽 연표 레일. 지금 읽고 있는 해가 강조되고, 눌러서 그 해로 건너뛸 수 있다. */
export default function FootprintTimeline({
  entries,
}: {
  entries: TimelineEntry[];
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    let frame = 0;

    const render = () => {
      frame = 0;

      const articles = list.querySelectorAll<HTMLElement>("[data-entry]");
      /* 화면 한가운데에 가장 가까이 온 항목을 지금 읽는 것으로 본다.
         "위를 지나갔는지"로 보면 마지막 항목이 화면에 꽉 차 있어도 안 넘어간다. */
      const middle = window.innerHeight / 2;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      articles.forEach((article, index) => {
        const rect = article.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - middle);

        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });

      setActive((previous) => (previous === best ? previous : best));
    };

    const requestRender = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(render);
      }
    };

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    render();

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  const jumpTo = (index: number) => {
    const article = listRef.current?.querySelectorAll<HTMLElement>(
      "[data-entry]",
    )[index];

    article?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
  };

  return (
    <div className={styles.timeline}>
      <nav className={styles.rail} aria-label="연표 이동">
        <div className={styles.railTrack}>
          {entries.map((entry, index) => (
            <button
              key={entry.year}
              type="button"
              className={styles.railItem}
              data-active={index === active}
              aria-current={index === active ? "true" : undefined}
              onClick={() => jumpTo(index)}
            >
              <i aria-hidden="true" />
              <span>{entry.year}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.entries} ref={listRef}>
        {entries.map((entry) => (
          <article key={entry.year} className={styles.entry} data-entry="">
            <div className={styles.visual}>
              <picture>
                <source
                  srcSet={`${BASE_PATH}/business/footprint/${entry.image}.webp`}
                  type="image/webp"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BASE_PATH}/business/footprint/${entry.image}.png`}
                  width={1440}
                  height={932}
                  alt={entry.alt}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <div className={styles.copy}>
              <p className={styles.year}>{entry.year}</p>
              <h3>
                {entry.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h3>
              <p>{entry.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
