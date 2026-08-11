import type { Metadata } from "next";
import styles from "./Business.module.css";
import { SectionTabs, type SectionTab } from "../components/layout/SectionTabs";
import CorporateMission from "./CorporateMission";
import EnterprisePricingFlip from "./EnterprisePricingFlip";
import ExperiencePricingFlip from "./ExperiencePricingFlip";
import FootprintIntro from "./FootprintIntro";
import HeroIntro from "./HeroIntro";
import VisaSkeepScroll from "./VisaSkeepScroll";
import PositioningScroll from "./PositioningScroll";
import ScrollFadeIn from "./ScrollFadeIn";
import { Footer } from "../components/layout/Footer";
import {
  BusinessClosing,
  FootprintSection,
  SectionHeader,
  ValueProposition,
} from "./LiveBusinessSections";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Skeep Business",
  description: "Skeep의 비즈니스 모델과 확장 가능성을 소개합니다.",
};

const businessTabs: SectionTab[] = [
  { id: "corporate-mission", line1: "Corporate", line2: "Mission" },
  { id: "market-imperative", line1: "Market", line2: "Imperative" },
  { id: "core-positioning", line1: "Core", line2: "Positioning" },
  { id: "business-portfolio", line1: "Business", line2: "Portfolio" },
  { id: "value-proposition", line1: "Value", line2: "Proposition" },
  { id: "our-footprint", line1: "Our", line2: "Footprint" },
];

export default function BusinessPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>Skeep 비즈니스 모델</h1>
      <div className={styles.canvas}>
        {/* 히어로는 화면을 붙잡고 타이틀 → About Skeep → "끊임없는 도전 정신"으로 페이드 전환한다. */}
        <HeroIntro />

        {/* 2026·2031 연혁은 시안 PNG 안에 글자가 박혀 있어 흐릿했다.
            business-01 y1965 ~ business-02a-intro y400 구간을 도려내고 라이브 텍스트로 옮겼다. */}
        <FootprintIntro />

        <ScrollFadeIn className={styles.fadeIn}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.section}
            src={`${BASE_PATH}/business/sections/business-02a-tail.png`}
            width={1920}
            height={300}
            alt=""
            loading="eager"
            decoding="async"
          />
        </ScrollFadeIn>

        <SectionTabs
          tabs={businessTabs}
          cssVar="--business-tabbar-h"
          ariaLabel="비즈니스 섹션"
        />

        <CorporateMission />
        <SectionHeader
          id="market-imperative"
          english={["Market", "Imperative"]}
          korean={["스킵할 수 밖에", "없었던 이유"]}
        />

        {/* PESTEL 레일은 VisaSkeepScroll 안에서 한 벌만 그리고, 그대로 접히며 VISA로 이어진다. */}
        <VisaSkeepScroll />
        <PositioningScroll />

        <SectionHeader
          id="business-portfolio"
          english={["Business", "Portfolio"]}
          korean={["스킵 비즈니스", "포트폴리오"]}
          spacious
        />
        <ExperiencePricingFlip />
        <EnterprisePricingFlip />
        <ValueProposition />
        <FootprintSection />
        <BusinessClosing />
      </div>
      <Footer />
    </main>
  );
}
