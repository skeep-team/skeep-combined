"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import styles from "./ResetSequence.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Stage = {
  heading: string;
};

const STAGES: Stage[] = [
  { heading: "아무 일도 없었던 것처럼\n완벽한 리셋." },
  { heading: "패킷 회수 중..." },
  { heading: "패킷 회수 중..." },
  { heading: "패킷 회수 중..." },
  { heading: "다시, 처음처럼" },
];

// CSS mix-blend-mode is unreliable against <video>-derived content across
// browsers (video and/or text can each get promoted to their own hardware
// compositing layer, silently breaking the blend). Canvas 2D's
// globalCompositeOperation implements the same blend math but always
// composites in place, so we draw both the video frame and the heading
// text onto one canvas instead of relying on CSS blending between
// separate DOM layers.
function clampPx(min: number, vw: number, max: number) {
  return Math.min(max, Math.max(min, (window.innerWidth * vw) / 100));
}

function drawFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  heading: string,
  fontFamily: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cw = canvas.width;
  const ch = canvas.height;

  ctx.globalCompositeOperation = "source-over";
  if (video.videoWidth && video.videoHeight) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const canvasRatio = cw / ch;
    const videoRatio = vw / vh;
    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;
    if (videoRatio > canvasRatio) {
      sw = vh * canvasRatio;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / canvasRatio;
      sy = (vh - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cw, ch);
  }

  const dpr = window.devicePixelRatio || 1;
  const fontSize = clampPx(24, 4, 54) * dpr;
  const lineHeight = fontSize * 1.15;
  const lines = heading.split("\n");

  ctx.globalCompositeOperation = "exclusion";
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const totalHeight = lineHeight * lines.length;
  const startY = ch / 2 - totalHeight / 2 + lineHeight / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, cw / 2, startY + i * lineHeight);
  });
}

export function ResetSequence() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontFamilyRef = useRef("sans-serif");
  const [activeStage, setActiveStage] = useState(0);
  const activeStageRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    activeStageRef.current = activeStage;
  }, [activeStage]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const varValue = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-pretendard")
      .trim();
    if (varValue) fontFamilyRef.current = `${varValue}, sans-serif`;

    const redraw = () => {
      drawFrame(video, canvas, STAGES[activeStageRef.current].heading, fontFamilyRef.current);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      redraw();
    };

    const applyProgress = (value: number) => {
      if (!video.duration) return;
      video.currentTime = value * video.duration;
    };

    const onLoadedMetadata = () => {
      resize();
      applyProgress(scrollYProgress.get());
    };

    document.fonts.ready.then(redraw);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("seeked", redraw);
    window.addEventListener("resize", resize);
    if (video.readyState >= 1) onLoadedMetadata();

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", redraw);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    drawFrame(video, canvas, STAGES[activeStage].heading, fontFamilyRef.current);
  }, [activeStage]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(STAGES.length - 1, Math.floor(value * STAGES.length));
    setActiveStage((prev) => (prev === next ? prev : next));

    const video = videoRef.current;
    if (video && video.duration) {
      video.currentTime = value * video.duration;
    }
  });

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.section}>
        <video
          ref={videoRef}
          className={styles.hiddenVideo}
          src={`${BASE_PATH}/service2/reset-recall.mp4`}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className={styles.video} />
        <span className={styles.srOnly}>{STAGES[activeStage].heading.replace("\n", " ")}</span>
      </div>
    </div>
  );
}
