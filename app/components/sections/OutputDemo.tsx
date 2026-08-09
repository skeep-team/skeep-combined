"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import styles from "./InteractionBlueprint.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const OUTPUT_STATES = [
  {
    key: "sound",
    eyebrow: "Sound",
    title: "소리 전달",
    image: "output-devices-sound.png",
    chips: [
      { ko: "효과음", en: "Sound effect" },
      { ko: "발화", en: "Speaking" },
    ],
    body: "SKEEP은 소리를 만들 수 있는 모든 환경에서 사용자에게 정보를 전달할 수 있습니다.\n스크린이 없는 스피커나 로봇이라도 재빠른 효과음과 발화를 통해 사용자와 즉각적으로 소통합니다.",
  },
  {
    key: "both",
    eyebrow: "Both way",
    title: "시청각적 전달",
    image: "output-devices-both.png",
    chips: [
      { ko: "보여주기", en: "Show" },
      { ko: "말하기", en: "Tell" },
    ],
    body: "사용자가 상호작용 중인 환경에 스피커나 화면이 있다면,\nSKEEP은 그 환경의 기능을 활용해 정보를 전달합니다.\n상황에 따라 소리와 화면을 적절히 조합하며 사용 흐름을 끊지 않고 가장 효과적인 방식으로 소통을 이어갑니다.",
  },
  {
    key: "visual",
    eyebrow: "Visual",
    title: "시각 전달",
    image: "output-devices-visual.png",
    chips: [
      { ko: "스크린", en: "Screen UI" },
      { ko: "글씨", en: "Text" },
    ],
    body: "SKEEP은 화면이나 텍스트를 표시할 수 있는 모든 환경을 활용해\n정보를 직관적으로 전달합니다.\n소리를 낼 수 없는 전광판이나 모니터에서도, 사용자가 지금 알아야 할 내용만 간결하게 보여줍니다.",
  },
];

/* 상태 경계에서 스크롤이 미세하게 흔들려도 앞뒤로 깜빡이지 않도록,
   전진 임계값보다 후진 임계값을 살짝 낮게 잡아 이력 구간을 둔다. */
const forwardThresholds = [0.38, 0.71];
const reverseThresholds = [0.29, 0.62];

export function OutputDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setStep((current) => {
      let next = current;

      while (next < forwardThresholds.length && value >= forwardThresholds[next]) {
        next++;
      }

      while (next > 0 && value < reverseThresholds[next - 1]) {
        next--;
      }

      return next;
    });
  });

  return (
    <div ref={wrapperRef} className={styles.outputSequence}>
      <div className={styles.outputSticky}>
        <div className={styles.outputDemo}>
          {/* 소리/양방향/시각 단계마다 겹치는 범위가 다른 벤 다이어그램으로 바뀐다.
              피그마 배치: 사진은 좌상단, 텍스트 묶음은 우하단. */}
          <div className={styles.outputDevicesStack}>
            {OUTPUT_STATES.map((state, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={state.key}
                className={styles.outputDevices}
                data-active={index === step}
                src={`${BASE_PATH}/blueprint/${state.image}`}
                alt=""
                width={1600}
                height={1160}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
          <div className={styles.outputTextColumn}>
            <div className={styles.outputTitleStack}>
              {OUTPUT_STATES.map((state, index) => (
                <div className={styles.outputTitle} data-active={index === step} key={state.key}>
                  <span>{state.eyebrow}</span>
                  <h3>{state.title}</h3>
                </div>
              ))}
            </div>
            <div className={styles.panelStack}>
              {OUTPUT_STATES.map((state, index) => (
                <div className={styles.soundPanel} data-active={index === step} key={state.key}>
                  <div className={styles.chips}>
                    {state.chips.map((chip) => (
                      <b key={chip.en}>{chip.en}</b>
                    ))}
                  </div>
                  <p>{state.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
