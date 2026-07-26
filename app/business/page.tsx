import type { Metadata } from "next";
import styles from "./Business.module.css";
import PestelSection from "./PestelSection";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const tailSections = [
  { file: "business-04-tail-clean.png", height: 1270 },
  { file: "business-05.png", height: 2800 },
  { file: "business-06.png", height: 2800 },
  { file: "business-07.png", height: 2800 },
  { file: "business-08.png", height: 2800 },
  { file: "business-09.png", height: 2400 },
  { file: "business-10.png", height: 888 },
];

const introSections = [
  { file: "business-01.png", height: 2800 },
  { file: "business-02-top.png", height: 2280 },
];

export const metadata: Metadata = {
  title: "Skeep Business",
  description: "Skeep의 비즈니스 모델과 확장 가능성을 소개합니다.",
};

export default function BusinessPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>Skeep 비즈니스 모델</h1>
      <div className={styles.canvas}>
        {introSections.map((section, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={section.file}
            className={styles.section}
            src={`${BASE_PATH}/business/sections/${section.file}`}
            width={1920}
            height={section.height}
            alt=""
            loading={index < 2 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
        <PestelSection />
        {tailSections.map((section) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={section.file}
            className={styles.section}
            src={`${BASE_PATH}/business/sections/${section.file}`}
            width={1920}
            height={section.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </main>
  );
}
