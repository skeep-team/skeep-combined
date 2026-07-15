"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "../ui/Reveal";
import styles from "./NegotiationDiagram.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const TICKER_DURATION = 900;
const STEP_HOLD_DURATION = 1800;
// Bounce settle time for the label row's spring pop-in — the sideways
// unfold only starts once the pop has visibly landed (matches MoreStory).
const LABEL_POP_SETTLE_DELAY = 480;
// Top offset (cqw, matching the Figma step-row coordinates) of each step row.
const STEP_TOPS = ["7.96cqw", "16.39cqw", "24.82cqw"];

// Cycles the "current step" index 0→1→2→0... while active, so the highlight
// visits CFP/Bid/Award in turn instead of sitting on STEP 1 forever.
function useStepCycle(active: boolean) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEP_TOPS.length), STEP_HOLD_DURATION);
    return () => clearInterval(id);
  }, [active]);

  return step;
}

// Easy-ease (cubic ease-in) applied to the tick delay's growth curve: it
// stays fast for most of the run, then smoothly — not abruptly — decelerates
// into the landing value, like an odometer easing to a stop.
function easeInCubic(t: number) {
  return t * t * t;
}

// Rapidly cycles random values before settling on the real one, like an
// odometer/slot-machine reel — the tick interval grows over time so it
// visibly decelerates into the landing value instead of stopping abruptly.
function StatTicker({
  trigger,
  finalText,
  randomize,
  className,
}: {
  trigger: boolean;
  finalText: string;
  randomize: () => string;
  className: string;
}) {
  const [display, setDisplay] = useState(finalText);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      const elapsed = performance.now() - start;
      if (elapsed >= TICKER_DURATION) {
        setDisplay(finalText);
        return;
      }
      setDisplay(randomize());
      const progress = elapsed / TICKER_DURATION;
      timeoutId = setTimeout(tick, 35 + easeInCubic(progress) * 140);
    }
    tick();

    return () => clearTimeout(timeoutId);
  }, [trigger, finalText, randomize]);

  return <span className={className}>{display}</span>;
}

const LABELS = [
  { index: "01", name: "CNP", src: `${BASE_PATH}/negotiation/cnp.png`, alt: "CNP : Contract Net Protocol" },
  {
    index: "02",
    name: "DCOP",
    src: `${BASE_PATH}/negotiation/dcop.png`,
    alt: "DCOP : Distributed Constraint Optimization Problem",
  },
];

export function NegotiationDiagram() {
  const [active, setActive] = useState(0);
  const [labelExpanded, setLabelExpanded] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const labelRowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(diagramRef, { amount: 0.5 });
  const labelInView = useInView(labelRowRef, { once: true, amount: 0.6 });
  const currentStep = useStepCycle(inView && active === 0);

  useEffect(() => {
    if (!labelInView) return;
    const id = setTimeout(() => setLabelExpanded(true), LABEL_POP_SETTLE_DELAY);
    return () => clearTimeout(id);
  }, [labelInView]);

  return (
    <section id="negotiation-diagram" className={styles.section}>
      <Reveal className={styles.header}>
        <h2 className={styles.heading}>
          협상을 완성하는
          <br />
          두 가지 규칙
        </h2>
        <p className={styles.body}>
          CNP를 협상의 대화 규칙으로 사용하며, DCOP으로 전체 조합을
          계산합니다. 아래 버튼을 눌러 각 규칙의 역할을 확인해 보세요.
        </p>
      </Reveal>
      <Reveal delay={0.1} className={styles.diagramWrap}>
        <div className={styles.diagram} ref={diagramRef}>
          {LABELS.map((label, i) => (
            <div key={label.name} className={styles.diagramLayer} style={{ opacity: active === i ? 1 : 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.diagramImage} src={label.src} alt={label.alt} />
              {i === 0 && (
                <>
                  <motion.div
                    className={styles.stepHighlight}
                    animate={{ top: STEP_TOPS[currentStep] }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <StatTicker
                    trigger={inView && active === 0}
                    finalText="90%"
                    randomize={() => `${Math.floor(Math.random() * 100)}%`}
                    className={styles.statTickerCnp}
                  />
                </>
              )}
              {i === 1 && (
                <StatTicker
                  trigger={inView && active === 1}
                  finalText="0"
                  randomize={() => `${Math.floor(Math.random() * 10)}`}
                  className={styles.statTickerDcop}
                />
              )}
            </div>
          ))}
        </div>
        <motion.div
          ref={labelRowRef}
          layout
          className={labelExpanded ? styles.labelRow : `${styles.labelRow} ${styles.labelRowCollapsed}`}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={labelInView ? { opacity: 1, scale: 1 } : undefined}
          transition={{
            scale: { type: "spring", stiffness: 260, damping: 14, mass: 0.9 },
            opacity: { duration: 0.2 },
            layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          {labelExpanded && (
            <motion.div
              className={styles.labelRowInner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              {LABELS.map((label, i) => (
                <button
                  key={label.name}
                  type="button"
                  className={i === active ? `${styles.labelCard} ${styles.labelCardRaised}` : styles.labelCard}
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                >
                  <span className={styles.labelIndex}>{label.index}</span>
                  <span className={styles.labelName}>{label.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </Reveal>
    </section>
  );
}
