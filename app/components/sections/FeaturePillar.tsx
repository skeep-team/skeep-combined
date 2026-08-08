"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
      <div
        className={invertBg ? `${styles.question} ${styles.questionInvert}` : styles.question}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setClicked((c) => !c)}
      >
        <span className={styles.qLabel}>{label}</span>
        <p className={styles.qText}>{text}</p>
        {answer && (
          <motion.div
            className={styles.answer}
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{
              height: { type: "spring", stiffness: 380, damping: 26, mass: 0.9 },
              opacity: { duration: 0.2 },
            }}
          >
            <span className={styles.aLabel}>A.</span>
            <AnswerText text={answer} />
          </motion.div>
        )}
      </div>
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
