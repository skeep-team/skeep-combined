"use client";

import Link from "next/link";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useRef, useState } from "react";
import styles from "./Hub.module.css";

const DRAG_OFFSET_THRESHOLD = 80;
const DRAG_VELOCITY_THRESHOLD = 400;
const ACTIVE_SLIDE_KEY = "hub-active-slide";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Thumbnail =
  | { kind: "video"; src: string; heading: string[] }
  | { kind: "image"; src: string; heading: string[] }
  | { kind: "color"; color: string; heading: string[] };

type Slide = {
  href?: string;
  external?: boolean; // true = 정적 HTML 페이지(내 프린시플 페이지)로 <a> 이동
  thumbnail?: Thumbnail;
};

// Each thumbnail mirrors that page's first section, so the slide preview
// is the real hero/statement content rather than a flat placeholder.
// Slots 0-3 have real destinations today; the rest are reserved
// placeholders for pages that haven't been built yet.
const SLIDES: Slide[] = [
  {
    href: `${BASE_PATH}/pages/index.html`,
    external: true,
    thumbnail: { kind: "video", src: `${BASE_PATH}/pages/assets/intro-hero-bg.mp4`, heading: ["새로운 시대를 위한", "새로운 기준"] },
  },
  {
    href: `${BASE_PATH}/pages/saegyeodeutda.html`,
    external: true,
    thumbnail: { kind: "image", src: `${BASE_PATH}/pages/assets/sensing-hero-people-3.png`, heading: ["어떤 형태의 의도든 완벽하게", "항상 준비되어 있으니까"] },
  },
  {
    href: `${BASE_PATH}/pages/smeureulda.html`,
    external: true,
    thumbnail: { kind: "image", src: `${BASE_PATH}/pages/assets/smeur-cover-bg.jpg`, heading: ["낯선 곳이더라도 자연스럽게", "경계를 건너뛰는 유려함"] },
  },
  {
    href: "/principles",
    thumbnail: { kind: "video", src: `${BASE_PATH}/hero/focus.mp4`, heading: ["When you need", "Focus"] },
  },
  {
    href: "/service2",
    thumbnail: {
      kind: "image",
      src: `${BASE_PATH}/service2/statement-bg.jpg`,
      heading: ["기기에는 흔적 없이", "내 맥락은 끊김 없이"],
    },
  },
  {
    href: "/service3",
    thumbnail: { kind: "video", src: `${BASE_PATH}/service3/statement-bg.mp4`, heading: ["당신다운 경험의 시작"] },
  },
  {
    href: "/negotiation",
    thumbnail: {
      kind: "video",
      src: `${BASE_PATH}/negotiation/statement-bg.mp4`,
      heading: ["당신이 원하는 그대로", "가장 자연스럽게"],
    },
  },
  {},
];

function SlideThumbnail({ thumbnail }: { thumbnail?: Thumbnail }) {
  if (!thumbnail) return null;
  const isDark = thumbnail.kind !== "color";
  return (
    <div className={styles.thumbnail}>
      {thumbnail.kind === "video" && (
        <video className={styles.thumbnailMedia} src={thumbnail.src} autoPlay muted loop playsInline />
      )}
      {thumbnail.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.thumbnailMedia} src={thumbnail.src} alt="" />
      )}
      {thumbnail.kind === "color" && (
        <div className={styles.thumbnailMedia} style={{ background: thumbnail.color }} />
      )}
      {isDark && <div className={styles.thumbnailScrim} />}
      <p className={isDark ? styles.thumbnailHeading : `${styles.thumbnailHeading} ${styles.thumbnailHeadingDark}`}>
        {thumbnail.heading.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </div>
  );
}

// Crossfades + slides the incoming/outgoing thumbnail so a slide change
// reads as a swipe transition instead of an instant content swap. While
// scrubbing the dot bar, the offset/duration shrink so rapid-fire index
// changes read as a quick flip through frames rather than overlapping slides.
function CardContent({
  slideKey,
  thumbnail,
  direction,
  fast,
}: {
  slideKey: string;
  thumbnail?: Thumbnail;
  direction: number;
  fast?: boolean;
}) {
  const offset = fast ? 8 : 18;
  const duration = fast ? 0.12 : 0.36;
  return (
    <AnimatePresence initial={false} custom={direction}>
      <motion.div
        key={slideKey}
        className={styles.thumbnailAnimWrap}
        custom={direction}
        initial={{ opacity: 0, x: `${direction * offset}%` }}
        animate={{ opacity: 1, x: "0%" }}
        exit={{ opacity: 0, x: `${direction * -offset}%` }}
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
      >
        <SlideThumbnail thumbnail={thumbnail} />
      </motion.div>
    </AnimatePresence>
  );
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DisplayIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Reads whichever slide was active when the user last left the hub (e.g.
// clicked into a page and came back), instead of always starting over at
// the first card. Read directly in useState's lazy initializer — not an
// effect — so the restored index is there from this component's very first
// commit. AnimatePresence only skips its enter/exit transition for children
// present at that first commit; restoring a render (or two) later still
// counts as a change and plays the slide transition, which read as an
// unwanted snap/jerk on a page that had just loaded.
function readStoredActive() {
  if (typeof window === "undefined") return 0;
  const stored = sessionStorage.getItem(ACTIVE_SLIDE_KEY);
  if (stored === null) return 0;
  const i = Number(stored);
  return Number.isInteger(i) && i >= 0 && i < SLIDES.length ? i : 0;
}

export function Hub() {
  const [active, setActive] = useState(readStoredActive);
  // +1 means the slide entering is coming from the right (swiped left, "next");
  // -1 means it's coming from the left ("prev"). Drives CardContent's slide direction.
  const [direction, setDirection] = useState(1);
  const total = SLIDES.length;

  // Persisted right at the point of each interaction (not reactively via a
  // useEffect keyed on `active`) — a separate write-effect would run once
  // per render with whatever `active` its own closure captured, including
  // the initial render's default of 0, and could race the restore above by
  // overwriting the just-restored value back to 0 before it ever painted.
  function setActiveAndPersist(next: number) {
    setActive(next);
    sessionStorage.setItem(ACTIVE_SLIDE_KEY, String(next));
  }

  const prevIndex = mod(active - 1, total);
  const nextIndex = mod(active + 1, total);
  const current = SLIDES[active];
  const prev = SLIDES[prevIndex];
  const next = SLIDES[nextIndex];

  function goNext() {
    setDirection(1);
    setActiveAndPersist(mod(active + 1, total));
  }

  function goPrev() {
    setDirection(-1);
    setActiveAndPersist(mod(active - 1, total));
  }

  function goTo(i: number) {
    setDirection(i >= active ? 1 : -1);
    setActiveAndPersist(i);
  }

  // Dragging directly along the pagination dots scrubs through slides live,
  // following the finger position instead of advancing one at a time —
  // matching the Vision Pro site's draggable image-scrubber pattern.
  // Snaps to whichever dot's own center is nearest the pointer (rather than
  // a naive proportion of the bar's width) so a tap always lands on the dot
  // actually under the finger, regardless of the container's padding/gaps.
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isScrubbing, setIsScrubbing] = useState(false);

  function indexFromClientX(clientX: number) {
    let closest = active;
    let closestDist = Infinity;
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      const rect = dot.getBoundingClientRect();
      const dist = Math.abs(clientX - (rect.left + rect.width / 2));
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function handleScrubMove(clientX: number) {
    const i = indexFromClientX(clientX);
    setActive((a) => {
      if (i === a) return a;
      setDirection(i >= a ? 1 : -1);
      sessionStorage.setItem(ACTIVE_SLIDE_KEY, String(i));
      return i;
    });
  }

  function handleScrubStart(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsScrubbing(true);
    handleScrubMove(e.clientX);
  }

  function handleScrubPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isScrubbing) return;
    handleScrubMove(e.clientX);
  }

  function handleScrubEnd() {
    setIsScrubbing(false);
  }

  // Tracks whether the pointer actually dragged (vs. a plain click/tap), so
  // a swipe doesn't also fire the card underneath it as a click.
  const wasDragging = useRef(false);

  function handleDragStart() {
    wasDragging.current = true;
  }

  function handleDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x < -DRAG_OFFSET_THRESHOLD || info.velocity.x < -DRAG_VELOCITY_THRESHOLD) {
      goNext();
    } else if (info.offset.x > DRAG_OFFSET_THRESHOLD || info.velocity.x > DRAG_VELOCITY_THRESHOLD) {
      goPrev();
    }
    // Let the click handlers see the flag first, then clear it for the next gesture.
    setTimeout(() => {
      wasDragging.current = false;
    }, 0);
  }

  function guardClick(handler: () => void) {
    return () => {
      if (wasDragging.current) return;
      handler();
    };
  }

  function handleCenterClick(e: React.MouseEvent) {
    if (wasDragging.current) e.preventDefault();
  }

  return (
    <div className={styles.hub}>
      <header className={styles.header}>
        <span className={styles.logo}>Skeep</span>
        <div className={styles.controls}>
          <button type="button" className={styles.langPill}>
            English
          </button>
          <button type="button" className={styles.iconButton} aria-label="디스플레이 설정">
            <DisplayIcon />
          </button>
        </div>
      </header>

      <motion.div
        className={styles.stage}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.45}
        dragTransition={{ bounceStiffness: 420, bounceDamping: 32 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <button
          type="button"
          className={`${styles.card} ${styles.cardSide}`}
          onClick={guardClick(goPrev)}
          aria-label="이전 슬라이드"
        >
          <CardContent
            slideKey={prev.href ?? `slot-${prevIndex}`}
            thumbnail={prev.thumbnail}
            direction={direction}
            fast={isScrubbing}
          />
        </button>

        {current.href && current.external ? (
          <a
            href={current.href}
            className={`${styles.card} ${styles.cardCenter}`}
            onClick={handleCenterClick}
            draggable={false}
          >
            <CardContent
              slideKey={current.href}
              thumbnail={current.thumbnail}
              direction={direction}
              fast={isScrubbing}
            />
            <span className={styles.enterButton}>
              <ArrowRightIcon />
            </span>
          </a>
        ) : current.href ? (
          <Link
            href={current.href}
            className={`${styles.card} ${styles.cardCenter}`}
            onClick={handleCenterClick}
            draggable={false}
          >
            <CardContent
              slideKey={current.href}
              thumbnail={current.thumbnail}
              direction={direction}
              fast={isScrubbing}
            />
            <span className={styles.enterButton}>
              <ArrowRightIcon />
            </span>
          </Link>
        ) : (
          <div className={`${styles.card} ${styles.cardCenter}`}>
            <CardContent
              slideKey={`slot-${active}`}
              thumbnail={current.thumbnail}
              direction={direction}
              fast={isScrubbing}
            />
            <span className={`${styles.enterButton} ${styles.enterButtonDisabled}`} aria-hidden="true">
              <ArrowRightIcon />
            </span>
          </div>
        )}

        <button
          type="button"
          className={`${styles.card} ${styles.cardSide}`}
          onClick={guardClick(goNext)}
          aria-label="다음 슬라이드"
        >
          <CardContent
            slideKey={next.href ?? `slot-${nextIndex}`}
            thumbnail={next.thumbnail}
            direction={direction}
            fast={isScrubbing}
          />
        </button>
      </motion.div>

      <div
        className={styles.pagination}
        onPointerDown={handleScrubStart}
        onPointerMove={handleScrubPointerMove}
        onPointerUp={handleScrubEnd}
        onPointerCancel={handleScrubEnd}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            type="button"
            className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}번 슬라이드로 이동`}
            aria-current={i === active}
          />
        ))}
      </div>
    </div>
  );
}
