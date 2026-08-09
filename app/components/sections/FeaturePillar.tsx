"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import styles from "./FeaturePillar.module.css";

export type FeaturePillarProps = {
  eyebrow: string;
  heading: string;
  body: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  questions: { label: string; text: string; answer?: string }[];
  invertBg?: boolean;
};

function AnswerText({ text }: { text: string }) {
  const parts = text.split(/<b>|<\/b>/);
  return (
    <p className={styles.aText}>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
    </p>
  );
}

function QuestionCard({
  label,
  text,
  answer,
  delay,
  invertBg,
}: {
  label: string;
  text: string;
  answer?: string;
  delay: number;
  invertBg?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const expanded = Boolean(answer) && (hovered || clicked);

  return (
    <Reveal delay={delay}>
      {/* 그냥 div+onClick이었더니, 프로토타입 미리보기(무빙스타일) 쪽에서
         버튼/링크가 아닌 요소의 클릭은 자기 자신의 화면 전환(핫스팟)으로
         집어삼켜서 카드를 눌렀는데 엉뚱한 곳으로 이동해버렸다. 진짜
         <button>으로 바꿔 클릭이 이 카드 것이라는 걸 명확히 한다. */}
      <button
        type="button"
        className={invertBg ? `${styles.question} ${styles.questionInvert}` : styles.question}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setClicked((c) => !c)}
        aria-expanded={answer ? expanded : undefined}
      >
        <span className={styles.qLabel}>{label}</span>
        <p className={styles.qText}>{text}</p>
        {answer && (
          // height:"auto"를 프레이머모션 스프링으로 애니메이션하면 매 프레임
          // JS가 직접 픽셀 높이를 계산해서 넣어야 해서 리레이아웃 비용이 크다
          // (카드가 그리드 안에 있어 옆 카드까지 다시 배치됨) — 클릭할 때마다
          // 버벅이던 원인. CSS grid-template-rows(0fr→1fr) 트랜지션으로 바꿔서
          // 브라우저 자체 애니메이션 엔진이 처리하게 한다.
          <div className={styles.answer} data-expanded={expanded || undefined}>
            <div className={styles.answerInner}>
              <span className={styles.aLabel}>A.</span>
              <AnswerText text={answer} />
            </div>
          </div>
        )}
      </button>
    </Reveal>
  );
}

export function FeaturePillar({
  eyebrow,
  heading,
  body,
  image,
  imageAlt = "",
  imagePosition = "left",
  questions,
  invertBg,
}: FeaturePillarProps) {
  return (
    <section className={invertBg ? `${styles.section} ${styles.sectionInvert}` : styles.section}>
      <div
        className={
          imagePosition === "right"
            ? `${styles.headerRow} ${styles.headerRowImageRight}`
            : styles.headerRow
        }
      >
        {image && (
          <Reveal className={styles.media} delay={0.05}>
            <Image
              className={styles.image}
              src={image}
              alt={imageAlt}
              width={1935}
              height={1444}
              sizes="(max-width: 720px) 100vw, 44vw"
            />
          </Reveal>
        )}
        <div className={styles.headerCopy}>
          <Reveal>
            <p className={styles.eyebrow}>{eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.heading}>{heading}</h2>
          </Reveal>
          <Reveal className={styles.bodyReveal} delay={0.1}>
            <p className={styles.body}>{body}</p>
          </Reveal>
        </div>
      </div>
      <div className={styles.questions}>
        {questions.map((q, i) => (
          <QuestionCard
            key={q.label}
            label={q.label}
            text={q.text}
            answer={q.answer}
            delay={0.1 + i * 0.08}
            invertBg={invertBg}
          />
        ))}
      </div>
    </section>
  );
}
