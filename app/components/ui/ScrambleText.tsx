"use client";

// Scramble/glitch text reveal, adapted from an Originkit/Framer component:
// characters glitch through a random pool before locking into place
// (left-to-right or all-at-once), with an optional flicker after landing.
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

const GLITCH_CHARS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GLITCH_CHARS_LOWER = "abcdefghijklmnopqrstuvwxyz";

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      const d = sampleDX(t);
      if (Math.abs(dx) < 1e-6 || d === 0) break;
      t -= dx / d;
    }
    return sampleY(Math.max(0, Math.min(1, t)));
  };
}

type EaseName = "linear" | "easeIn" | "easeOut" | "easeInOut";

function makeEaseFn(ease: EaseName | [number, number, number, number]) {
  if (Array.isArray(ease)) return cubicBezier(ease[0], ease[1], ease[2], ease[3]);
  switch (ease) {
    case "linear":
      return (t: number) => t;
    case "easeIn":
      return (t: number) => t * t;
    case "easeInOut":
      return (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
    case "easeOut":
    default:
      return (t: number) => 1 - (1 - t) * (1 - t);
  }
}

type EnterMode = "oneLine" | "multiLine" | "random";
type CharDisplay = { char: string; locked: boolean; flickering: boolean };
type WordEntry = { text: string; gap: string; pi: number; globalWi: number };

type ScrambleTextProps = {
  text: string;
  tag?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  mode?: EnterMode;
  duration?: number;
  ease?: EaseName;
  scrambleIntensity?: number;
  flickerEnabled?: boolean;
  flickerColor?: string;
  flickerIntensity?: number;
  flickerSpeed?: number;
  onEnterComplete?: () => void;
};

export function ScrambleText({
  text,
  // Each paragraph wraps a ghost measurement <div>, which is invalid inside
  // a <p> (block content in phrasing content) and breaks SSR hydration —
  // default to "div" instead.
  tag = "div",
  color = "#ffffff",
  className,
  style,
  mode = "oneLine",
  duration = 1.6,
  ease = "easeOut",
  scrambleIntensity = 70,
  flickerEnabled = true,
  flickerColor = "#4a5568",
  flickerIntensity = 60,
  flickerSpeed = 10,
  onEnterComplete,
}: ScrambleTextProps) {
  const Tag = tag as keyof React.JSX.IntrinsicElements;

  const paragraphs: { text: string; gap: string }[][] = text
    .split("\n")
    .map((line) => {
      const tokens = line.match(/\s+|\S+/g) ?? [];
      const out: { text: string; gap: string }[] = [];
      let pendingGap = "";
      for (const tok of tokens) {
        if (/^\s+$/.test(tok)) pendingGap += tok;
        else {
          out.push({ text: tok, gap: pendingGap });
          pendingGap = "";
        }
      }
      return out;
    })
    .filter((p) => p.length > 0);

  const allWords: WordEntry[] = [];
  paragraphs.forEach((paraWords, pi) => {
    paraWords.forEach(({ text: t, gap }) => {
      allWords.push({ text: t, gap, pi, globalWi: allWords.length });
    });
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const ghostRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [lineGroups, setLineGroups] = useState<number[][]>([]);
  const [displays, setDisplays] = useState<Record<string, CharDisplay>>({});
  const [placedChars, setPlacedChars] = useState<Record<number, number[]>>({});
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [enterAnimComplete, setEnterAnimComplete] = useState(false);
  const hasPlayedRef = useRef(false);

  const detectLines = () => {
    const allLines: number[][] = [];
    paragraphs.forEach((_, pi) => {
      const paraEntries = allWords.filter((w) => w.pi === pi);
      const measured = paraEntries
        .map((w) => ({
          globalWi: w.globalWi,
          top: ghostRefs.current[w.globalWi]
            ? Math.round(ghostRefs.current[w.globalWi]!.getBoundingClientRect().top)
            : -1,
        }))
        .filter((m) => m.top >= 0);
      const tops = [...new Set(measured.map((m) => m.top))].sort((a, b) => a - b);
      tops.forEach((top) => allLines.push(measured.filter((m) => m.top === top).map((m) => m.globalWi)));
    });
    setLineGroups(allLines);
  };

  useLayoutEffect(() => {
    detectLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => detectLines());
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayedRef.current) {
          hasPlayedRef.current = true;
          setShouldAnimate(true);
        }
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [lineGroups]);

  useEffect(() => {
    if (!shouldAnimate || lineGroups.length === 0) return;
    let cancelled = false;
    setDisplays({});
    setPlacedChars({});
    setEnterAnimComplete(false);

    const durationMs = duration * 1000;
    const sequentialSteps = Math.max(1, allWords.reduce((s, w) => s + w.text.length, 0));
    const animStart = performance.now();
    const easeFn = makeEaseFn(ease);
    const targetAt = (step: number) => animStart + durationMs * easeFn(step / sequentialSteps);
    const targetAtScaled = (step: number, total: number) => animStart + durationMs * easeFn(step / Math.max(1, total));
    const speedMult = 10 / Math.max(1, Math.min(20, flickerSpeed));

    const wordToLine = new Map<number, number>();
    lineGroups.forEach((g, li) => g.forEach((gWi) => wordToLine.set(gWi, li)));
    const lineEndTimes: number[] = [];
    if (mode === "oneLine") {
      let cum = 0;
      for (const group of lineGroups) {
        cum += group.reduce((s, gWi) => s + allWords[gWi].text.length, 0);
        lineEndTimes.push(targetAt(cum));
      }
    }
    const lineEndForChar = (gWi: number) => (mode === "oneLine" ? (lineEndTimes[wordToLine.get(gWi) ?? 0] ?? animStart + durationMs) : animStart + durationMs);
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

    const nextGlitchChar = (char: string) => {
      const isLower = char === char.toLowerCase() && char !== char.toUpperCase();
      const pool = isLower ? GLITCH_CHARS_LOWER : GLITCH_CHARS_UPPER;
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const maybeFlicker = async (id: string, endTime: number) => {
      const intensity = Math.max(0, Math.min(100, flickerIntensity));
      if (!flickerEnabled || intensity === 0) return;
      if (Math.random() > intensity / 100) return;
      if (performance.now() >= endTime) return;
      const maxFlickers = Math.max(1, Math.round(intensity / 8));
      const flickers = Math.max(1, Math.round(maxFlickers / 2) + Math.floor(Math.random() * (maxFlickers / 2 + 1)));
      for (let i = 0; i < flickers; i++) {
        await sleep((40 + Math.random() * 80) * speedMult);
        if (cancelled) return;
        if (performance.now() >= endTime) {
          setDisplays((p) => (p[id] ? { ...p, [id]: { ...p[id], flickering: false } } : p));
          return;
        }
        setDisplays((p) => (p[id] ? { ...p, [id]: { ...p[id], flickering: true } } : p));
        await sleep((30 + Math.random() * 60) * speedMult);
        if (cancelled) return;
        setDisplays((p) => (p[id] ? { ...p, [id]: { ...p[id], flickering: false } } : p));
      }
    };

    const animateChar = async (globalWi: number, ci: number, char: string, targetEnd: number) => {
      if (cancelled) return;
      const id = `${globalWi}-${ci}`;
      const flickerEndTime = lineEndForChar(globalWi);
      if (char === "." || char === " " || char === ",") {
        setDisplays((p) => ({ ...p, [id]: { char, locked: true, flickering: false } }));
        await sleep(targetEnd - performance.now());
        maybeFlicker(id, flickerEndTime);
        return;
      }
      const intensity = Math.max(0, Math.min(100, scrambleIntensity));
      const desiredFrames = intensity === 0 ? 0 : 1 + Math.floor(Math.random() * Math.round(intensity / 7));
      const win = targetEnd - performance.now();
      const minDelay = 15;
      const maxFitFrames = Math.max(1, Math.floor((win * 0.8) / minDelay));
      const glitchFrames = Math.min(desiredFrames, maxFitFrames);
      const glitchDelay = glitchFrames > 0 ? Math.max(minDelay, Math.floor((win * 0.8) / glitchFrames)) : minDelay;
      for (let i = 0; i < glitchFrames; i++) {
        if (cancelled) return;
        setDisplays((p) => ({ ...p, [id]: { char: nextGlitchChar(char), locked: false, flickering: false } }));
        await sleep(glitchDelay);
        if (cancelled) return;
      }
      setDisplays((p) => ({ ...p, [id]: { char, locked: true, flickering: false } }));
      await sleep(targetEnd - performance.now());
      maybeFlicker(id, flickerEndTime);
    };

    const shuffle = (arr: number[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const animateWordInsert = async (gWi: number, getTargetEnd: () => number) => {
      const word = allWords[gWi].text;
      for (const ci of shuffle(word.split("").map((_, ci) => ci))) {
        if (cancelled) return;
        setPlacedChars((p) => {
          const cur = p[gWi] ?? [];
          return { ...p, [gWi]: [...cur, ci].sort((a, b) => a - b) };
        });
        await animateChar(gWi, ci, word[ci], getTargetEnd());
      }
    };

    const run = async () => {
      if (mode === "oneLine") {
        let idx = 0;
        for (const group of lineGroups)
          for (const gWi of group) {
            if (cancelled) return;
            await animateWordInsert(gWi, () => targetAt(++idx));
          }
      } else if (mode === "multiLine") {
        await Promise.all(
          lineGroups.map(async (group) => {
            const lineSteps = group.reduce((s, gWi) => s + allWords[gWi].text.length, 0);
            let li = 0;
            for (const gWi of group) {
              if (cancelled) return;
              await animateWordInsert(gWi, () => targetAtScaled(++li, lineSteps));
            }
          })
        );
      } else {
        const all: { globalWi: number; ci: number; char: string }[] = [];
        allWords.forEach((w) => w.text.split("").forEach((char, ci) => all.push({ globalWi: w.globalWi, ci, char })));
        for (let i = all.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [all[i], all[j]] = [all[j], all[i]];
        }
        let idx = 0;
        for (const { globalWi, ci, char } of all) {
          if (cancelled) return;
          await animateChar(globalWi, ci, char, targetAt(++idx));
        }
      }
    };

    (async () => {
      await run();
      if (!cancelled) {
        setEnterAnimComplete(true);
        onEnterComplete?.();
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineGroups, shouldAnimate]);

  const isInsertEnter = mode === "oneLine" || mode === "multiLine";

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", ...style }}
    >
      {paragraphs.map((_, pi) => {
        const paraEntries = allWords.filter((w) => w.pi === pi);
        return (
          <Tag key={pi} style={{ position: "relative", width: "100%", margin: 0, padding: 0 }}>
            {/* Ghost layer: measures word positions/line breaks without being visible. */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", visibility: "hidden", pointerEvents: "none" }}>
              {paraEntries.map((wordEntry) => (
                <Fragment key={wordEntry.globalWi}>
                  {wordEntry.gap && <span style={{ whiteSpace: "pre" }}>{wordEntry.gap}</span>}
                  <span
                    ref={(el) => {
                      ghostRefs.current[wordEntry.globalWi] = el;
                    }}
                    style={{ display: "inline-block", whiteSpace: "nowrap" }}
                  >
                    {wordEntry.text}
                  </span>
                </Fragment>
              ))}
            </div>

            <div style={{ width: "100%" }}>
              {paraEntries.map((wordEntry) => (
                <Fragment key={wordEntry.globalWi}>
                  {wordEntry.gap && <span style={{ color, whiteSpace: "pre" }}>{wordEntry.gap}</span>}
                  <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                    {wordEntry.text.split("").map((char, ci) => {
                      const id = `${wordEntry.globalWi}-${ci}`;
                      const enterState = displays[id];
                      let displayChar = char;
                      let charColor = color;

                      if (!enterState) {
                        charColor = "transparent";
                      } else {
                        displayChar = enterState.char;
                        charColor = enterState.flickering ? (flickerEnabled ? flickerColor : color) : enterState.locked ? color : color;
                      }

                      const hideChar = isInsertEnter && shouldAnimate && !enterAnimComplete && !enterState;

                      return (
                        <span key={ci} style={{ color: charColor, display: hideChar ? "none" : undefined }}>
                          {displayChar}
                        </span>
                      );
                    })}
                  </span>
                </Fragment>
              ))}
            </div>
          </Tag>
        );
      })}
    </div>
  );
}
