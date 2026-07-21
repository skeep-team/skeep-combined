"use client";

import Link from "next/link";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./Hub.module.css";

const DRAG_OFFSET_THRESHOLD = 80;
const DRAG_VELOCITY_THRESHOLD = 400;
const ACTIVE_SLIDE_KEY = "hub-active-slide";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Thumbnail =
  | { kind: "video"; src: string; poster?: string; heading: string[] }
  | { kind: "image"; src: string; heading: string[] }
  | { kind: "color"; color: string; heading: string[] };

type Slide = {
  href?: string;
  external?: boolean; // true = 정적 HTML 페이지(내 프린시플 페이지)로 <a> 이동
  thumbnail?: Thumbnail;
  tag?: string; // 카드 좌측 상단 라벨 (Overview / Principle N / Business)
};

// Each thumbnail mirrors that page's first section, so the slide preview
// is the real hero/statement content rather than a flat placeholder.
// Slots 0-3 have real destinations today; the rest are reserved
// placeholders for pages that haven't been built yet.
const SLIDES: Slide[] = [
  { tag: "Overview", href: `${BASE_PATH}/pages/index.html`, external: true, thumbnail: { kind: "video", src: `${BASE_PATH}/pages/assets/intro-hero-bg.mp4`, poster: `${BASE_PATH}/thumbs/principle.jpg`, heading: ["새로운 시대를 위한", "새로운 기준"] } },
  { tag: "Principle 1", href: `${BASE_PATH}/pages/saegyeodeutda.html`, external: true, thumbnail: { kind: "image", src: `${BASE_PATH}/thumbs/sensing.jpg`, heading: ["어떤 형태의 의도든 완벽하게", "항상 준비되어 있으니까"] } },
  { tag: "Principle 2", href: `${BASE_PATH}/pages/smeureulda.html`, external: true, thumbnail: { kind: "image", src: `${BASE_PATH}/thumbs/smeur.jpg`, heading: ["낯선 곳이더라도 자연스럽게", "경계를 건너뛰는 유려함"] } },
  { tag: "Principle 3", href: "/principles", thumbnail: { kind: "video", src: `${BASE_PATH}/hero/focus.mp4`, poster: `${BASE_PATH}/thumbs/focus.jpg`, heading: ["When you need", "Focus"] } },
  { tag: "Principle 4", href: "/service2", thumbnail: { kind: "image", src: `${BASE_PATH}/thumbs/service2.jpg`, heading: ["기기에는 흔적 없이", "내 맥락은 끊김 없이"] } },
  { tag: "Principle 5", href: "/service3", thumbnail: { kind: "video", src: `${BASE_PATH}/service3/statement-bg.mp4`, poster: `${BASE_PATH}/thumbs/service3.jpg`, heading: ["당신다운 경험의 시작"] } },
  { tag: "Principle 6", href: "/negotiation", thumbnail: { kind: "video", src: `${BASE_PATH}/negotiation/statement-bg.mp4`, poster: `${BASE_PATH}/thumbs/negotiation.jpg`, heading: ["당신이 원하는 그대로", "가장 자연스럽게"] } },
  { tag: "Business" },
];

// Poster image sits behind the video and is always visible; the video starts
// invisible and fades in only once it can actually play. During a slide change
// (which remounts this and reloads the video) the preloaded poster shows
// instantly, so the card never flashes an empty grey frame.
function VideoThumb({ src, poster }: { src: string; poster?: string }) {
  const [ready, setReady] = useState(false);
  return (
    <>
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.thumbnailMedia} src={poster} alt="" />
      )}
      <video
        className={styles.thumbnailMedia}
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.12s ease" }}
        src={src}
        preload="auto"
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={(e) => {
          e.currentTarget.play().catch(() => {});
          setReady(true);
        }}
      />
    </>
  );
}

function SlideThumbnail({ thumbnail }: { thumbnail?: Thumbnail }) {
  if (!thumbnail) return null;
  const isDark = thumbnail.kind !== "color";
  return (
    <div className={styles.thumbnail}>
      {thumbnail.kind === "video" && <VideoThumb src={thumbnail.src} poster={thumbnail.poster} />}
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

function AmbientBackdrop({ thumbnail, slideKey, dim }: { thumbnail?: Thumbnail; slideKey: string; dim?: boolean }) {
  if (!thumbnail) return null;

  const mediaSrc = thumbnail.kind === "video" ? thumbnail.poster ?? thumbnail.src : thumbnail.kind === "image" ? thumbnail.src : null;

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={slideKey}
        className={styles.ambientBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: dim ? 0.58 : 0.78 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        aria-hidden
      >
        {mediaSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.ambientMedia} src={mediaSrc} alt="" />
        ) : (
          <div className={styles.ambientMedia} style={{ background: thumbnail.kind === "color" ? thumbnail.color : "#000" }} />
        )}
        <div className={styles.ambientVeil} />
      </motion.div>
    </AnimatePresence>
  );
}

// Crossfade only: the stage owns all horizontal movement and its drag spring.
// Giving the thumbnail another x transition makes the media lag behind the
// card frame after release, so the card and its content no longer feel like
// one physical object.
function CardContent({
  slideKey,
  thumbnail,
  tag,
  fast,
}: {
  slideKey: string;
  thumbnail?: Thumbnail;
  tag?: string;
  fast?: boolean;
}) {
  const duration = fast ? 0.06 : 0.14;
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={slideKey}
        className={styles.thumbnailAnimWrap}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: "easeOut" }}
      >
        <SlideThumbnail thumbnail={thumbnail} />
        {tag && <span className={styles.cardTag}>{tag}</span>}
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

// Reads whichever slide was active when the user last left the hub. This must
// run after hydration: sessionStorage is unavailable to the server, and using
// it in the initial state makes the server and client render different cards.
function readStoredActive() {
  if (typeof window === "undefined") return 0;
  const stored = sessionStorage.getItem(ACTIVE_SLIDE_KEY);
  if (stored === null) return 0;
  const i = Number(stored);
  return Number.isInteger(i) && i >= 0 && i < SLIDES.length ? i : 0;
}

export function Hub() {
  const [active, setActive] = useState(0);
  const [isRestoring, setIsRestoring] = useState(true);
  const total = SLIDES.length;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setActive(readStoredActive());
      setIsRestoring(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

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
    setActiveAndPersist(mod(active + 1, total));
  }

  function goPrev() {
    setActiveAndPersist(mod(active - 1, total));
  }

  function goTo(i: number) {
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
      <AmbientBackdrop
        slideKey={current.href ?? `slot-${active}`}
        thumbnail={current.thumbnail}
        dim={active === 0}
      />
      {/* 모든 썸네일을 미리 로드해 슬라이드 전환 시 빈 프레임(리로드 깜빡임) 방지 */}
      <div aria-hidden style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
        {SLIDES.map((s, i) =>
          (() => {
            const t = s.thumbnail;
            const src = t?.kind === "image" ? t.src : t?.kind === "video" ? t.poster : undefined;
            // eslint-disable-next-line @next/next/no-img-element
            return src ? <img key={i} src={src} alt="" /> : null;
          })()
        )}
      </div>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.logo} src={`${BASE_PATH}/brand/skeep-logo-white.png`} alt="skeep" />
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
        dragElastic={0.22}
        dragTransition={{ bounceStiffness: 520, bounceDamping: 50 }}
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
            tag={prev.tag}
            fast={isScrubbing || isRestoring}
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
              tag={current.tag}
              fast={isScrubbing || isRestoring}
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
              tag={current.tag}
              fast={isScrubbing || isRestoring}
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
              tag={current.tag}
              fast={isScrubbing || isRestoring}
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
            tag={next.tag}
            fast={isScrubbing || isRestoring}
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
