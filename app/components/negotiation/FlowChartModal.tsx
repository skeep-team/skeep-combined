"use client";

import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState, type TouchEvent, type WheelEvent } from "react";
import styles from "./FlowChartModal.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 2;
const ZOOM_STEP = 0.4;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.closeIcon} aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ZoomIcon({ mode }: { mode: "in" | "out" }) {
  return (
    <svg viewBox="0 0 24 24" className={styles.closeIcon} aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {mode === "in" && <path d="M11 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

export function FlowChartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Tracks whether the leftmost start position has been applied for the
  // current open session, so a later window resize doesn't yank the pan
  // back while the user is exploring the diagram.
  const positionedRef = useRef(false);

  useEffect(() => {
    // The viewport <div> only exists in the DOM while the modal is open, so
    // this must re-attach on every open rather than just on mount.
    if (!open) return;
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setViewportSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  // Opens the diagram scrolled all the way to its leftmost edge (where the
  // flow starts) instead of centered, since the chart reads left-to-right.
  useEffect(() => {
    if (!open) {
      positionedRef.current = false;
      return;
    }
    if (positionedRef.current || viewportSize.width === 0) return;
    const maxX = (viewportSize.width * DEFAULT_ZOOM - viewportSize.width) / 2;
    x.jump(maxX);
    y.jump(0);
    positionedRef.current = true;
  }, [open, viewportSize, x, y]);

  function resetZoom() {
    setZoom(DEFAULT_ZOOM);
    // .jump() (not .set()) so this also cancels any drag-release momentum
    // still animating x/y — otherwise that animation can overwrite the
    // reset a frame later and the pan position survives close/reopen.
    const maxX = (viewportSize.width * DEFAULT_ZOOM - viewportSize.width) / 2;
    x.jump(maxX);
    y.jump(0);
  }

  function handleClose() {
    resetZoom();
    onClose();
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function applyZoom(next: number) {
    const clamped = clampZoom(next);
    setZoom(clamped);
    // Re-centering on every zoom step keeps the image inside the viewport
    // without having to re-clamp x/y against the new bounds mid-drag.
    // .jump() also cancels any drag-release momentum still animating x/y.
    x.jump(0);
    y.jump(0);
  }

  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    applyZoom(zoom - e.deltaY * WHEEL_ZOOM_SENSITIVITY);
  }

  function handleDoubleClick() {
    applyZoom(zoom > MIN_ZOOM ? MIN_ZOOM : DEFAULT_ZOOM);
  }

  // Single-finger panning already works through the image's own `drag` prop
  // (framer-motion tracks pointer events, touch included). Two-finger pinch
  // isn't a pointer gesture though, so it's tracked by hand here: remember
  // the finger spread and zoom level when the second finger lands, then
  // scale zoom by how much that spread has changed on each move.
  const pinchRef = useRef<{ startDistance: number; startZoom: number } | null>(null);

  function getTouchDistance(touches: TouchEvent<HTMLDivElement>["touches"]) {
    const [t1, t2] = [touches[0], touches[1]];
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    if (e.touches.length === 2) {
      pinchRef.current = { startDistance: getTouchDistance(e.touches), startZoom: zoom };
    }
  }

  function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
    if (e.touches.length !== 2 || !pinchRef.current) return;
    const distance = getTouchDistance(e.touches);
    applyZoom((pinchRef.current.startZoom * distance) / pinchRef.current.startDistance);
  }

  function handleTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (e.touches.length < 2) pinchRef.current = null;
  }

  // The image is scaled via a `scale` transform around its own center, so at
  // zoom `z` it overhangs the viewport by (size * z - size) / 2 on each side.
  // Framer's ref-based dragConstraints doesn't factor that transform in, so
  // the pannable range is computed by hand from the viewport's own box.
  function getDragConstraints() {
    if (zoom <= MIN_ZOOM) return { left: 0, right: 0, top: 0, bottom: 0 };
    const { width, height } = viewportSize;
    const maxX = (width * zoom - width) / 2;
    const maxY = (height * zoom - height) / 2;
    return { left: -maxX, right: maxX, top: -maxY, bottom: maxY };
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.header}>
              <p className={styles.title}>협상 프로세스</p>
              <div className={styles.headerControls}>
                <button
                  type="button"
                  className={styles.zoomButton}
                  onClick={() => applyZoom(zoom - ZOOM_STEP)}
                  disabled={zoom <= MIN_ZOOM}
                  aria-label="축소"
                >
                  <ZoomIcon mode="out" />
                </button>
                <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  className={styles.zoomButton}
                  onClick={() => applyZoom(zoom + ZOOM_STEP)}
                  disabled={zoom >= MAX_ZOOM}
                  aria-label="확대"
                >
                  <ZoomIcon mode="in" />
                </button>
                <button type="button" className={styles.closeButton} onClick={handleClose} aria-label="닫기">
                  <CloseIcon />
                </button>
              </div>
            </header>
            <div
              ref={viewportRef}
              className={styles.viewport}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <motion.img
                className={styles.flowImage}
                src={`${BASE_PATH}/negotiation/flow-chart.png`}
                alt="협상 프로세스 흐름도"
                style={{ x, y, scale: zoom, cursor: zoom > MIN_ZOOM ? "grab" : "default" }}
                drag={zoom > MIN_ZOOM}
                dragConstraints={getDragConstraints()}
                dragElastic={0.05}
                whileDrag={{ cursor: "grabbing" }}
                draggable={false}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
