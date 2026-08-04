"use client";

import { useEffect, useRef } from "react";
import styles from "./FootprintIntro.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Entry = {
  year: string;
  headLead: string;
  headRest: string;
  body: string[];
  image: string;
  alt: string;
};

/* 문구는 원본 시안 PNG(business-01 / business-02a-intro)에 박혀 있던 것을 그대로 옮겼다.
   줄바꿈도 시안 그대로 유지한다. 두 문단 모두 두 번째 줄이 "끊임없는"으로 시작하고
   그 단어만 분홍이다. */
const entries: Entry[] = [
  {
    year: "2026",
    headLead: "스크린의 경계를 넘어,",
    headRest: " 스킵 경험을 제시하다",
    body: [
      "2026년 세상에 첫선을 보인 Skeep은",
      "스크린 속에 갇혀 있던 에이전트를 세상 밖으로 꺼내고",
      "사용자 경험을 하나의 맥락으로 연결해 왔습니다.",
    ],
    image: "footprint-2026",
    alt: "스크린 속에 갇혀 있던 에이전트가 화면 밖으로 나오는 장면",
  },
  {
    year: "2031",
    headLead: "진영의 장벽을 넘어,",
    headRest: " 스킵 생태계를 완성하다",
    body: [
      "이제, 모두가 공유할 수 있는 중립적 생태계와",
      "세상 경험을 잇는 유니버설 미들웨어를 만들어 온",
      "새로운 시대의 스탠다드, Skeep을 소개합니다.",
    ],
    image: "footprint-2031",
    alt: "서로 다른 기기의 경험을 스킵이 가운데에서 이어주는 장면",
  },
];

/* 넘어가는 지점. 되돌아오는 지점을 조금 앞에 둬서 경계에서 떨리지 않게 한다. */
const forwardThreshold = 0.42;
const reverseThreshold = 0.32;

export default function FootprintIntro() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    let frame = 0;
    let step = 0;

    const render = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));

      if (step === 0 && progress >= forwardThreshold) {
        step = 1;
      } else if (step === 1 && progress <= reverseThreshold) {
        step = 0;
      }

      /* 미는 건 CSS 전환에 맡기고, 여기서는 어느 장인지만 알린다. */
      const next = String(step);

      if (section.dataset.step !== next) {
        section.dataset.step = next;
      }
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

  return (
    <section
      ref={sectionRef}
      className={styles.sequence}
      data-step="0"
      aria-label="스킵이 걸어온 길"
    >
      <div className={styles.sticky}>
        <div className={styles.desktopStage}>
          <div className={styles.visual}>
            <div className={styles.visualTrack}>
              {entries.map((entry, index) => (
                <picture
                  key={entry.year}
                  className={styles.visualPanel}
                  data-entry={index}
                >
                  <source
                    srcSet={`${BASE_PATH}/business/footprint/${entry.image}.webp`}
                    type="image/webp"
                  />
                  <img
                    src={`${BASE_PATH}/business/footprint/${entry.image}.png`}
                    width={1440}
                    height={932}
                    alt={entry.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              ))}
            </div>
          </div>

          <div className={styles.secondLine}>
            <em className={styles.keyword}>끊임없는</em>
            <span className={styles.restStack}>
              {entries.map((entry, index) => (
                <span
                  key={entry.year}
                  className={styles.headRest}
                  data-entry={index}
                >
                  {entry.headRest.trimStart()}
                </span>
              ))}
            </span>
          </div>
          {entries.map((entry, index) => (
            <div
              key={entry.year}
              className={styles.copyLayer}
              data-entry={index}
            >
              <p className={styles.year}>{entry.year}</p>
              <p className={styles.headLead}>{entry.headLead}</p>
              <p className={styles.body}>
                {entry.body.map((line, lineIndex) => (
                  <span key={line}>
                    {lineIndex > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>

        <div className={styles.mobileList}>
          {entries.map((entry) => (
            <article key={entry.year} className={styles.entry}>
              <div className={styles.frame}>
                <div className={styles.visual}>
                  <picture>
                    <source
                      srcSet={`${BASE_PATH}/business/footprint/${entry.image}.webp`}
                      type="image/webp"
                    />
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

                <p className={styles.year}>{entry.year}</p>
                <p className={styles.heading}>
                  {entry.headLead}
                  <br />
                  <em>끊임없는</em>
                  {entry.headRest}
                </p>
                <p className={styles.body}>
                  {entry.body.map((line, lineIndex) => (
                    <span key={line}>
                      {lineIndex > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
