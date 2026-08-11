import type { Metadata } from "next";
import styles from "./page.module.css";
import { Footer } from "../components/layout/Footer";
import { SectionTabs, type SectionTab } from "../components/layout/SectionTabs";
import { ContextSummary } from "../components/service2/ContextSummary";
import { ImageTextCard } from "../components/service2/ImageTextCard";
import { LeaveNothing } from "../components/service2/LeaveNothing";
import { ResetSequence } from "../components/service2/ResetSequence";
import { StatementBlock } from "../components/service2/StatementBlock";
import { ClosingCard } from "../components/service3/ClosingCard";
import { GrowthCycle } from "../components/service3/GrowthCycle";
import { SkeepExperience } from "../components/service3/SkeepExperience";
import { TodayStandard } from "../components/service3/TodayStandard";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "SKEEP | Leave Nothing",
  description: "기기에는 흔적 없이, 내 맥락은 끊김 없이.",
};

/* index.html의 UX LOGIC 섹션(종료와 개인화 탭, data-i="2")에 이미 정리된
   2개 카드 제목을 그대로 가져왔다 — 그 섹션이 이 페이지 전체의 공식 목차다. */
const service2Tabs: SectionTab[] = [
  { id: "keep-logic", line1: "Keep", line2: "Logic" },
  { id: "see-you-logic", line1: "See You", line2: "Logic" },
];

export default function Service2Page() {
  return (
    <main>
      <SectionTabs
        tabs={service2Tabs}
        cssVar="--section-tabbar-h"
        ariaLabel="종료와 개인화 섹션"
        hideUntilPastFirst
        className={styles.tabBar}
      />
      <StatementBlock
        id="keep-logic"
        heading={["기기에는 흔적 없이", "내 맥락은 끊김 없이"]}
        image={`${BASE_PATH}/service2/statement-bg.jpg`}
      />
      <LeaveNothing />
      <ResetSequence />
      <ContextSummary />
      <ImageTextCard />

      {/* 기억하다(service3) 병합: 이 페이지의 나머지 섹션들은 원래
          /service3 라우트였다. Elza 대문자 스타일이 이 섹션에만 필요해서
          scoped wrapper로 감쌌다 — 위 지켜주다 섹션은 그대로 둔다. */}
      <div className={styles.mergedFromService3}>
        <StatementBlock
          id="see-you-logic"
          heading={["당신다운 경험의 시작"]}
          image={`${BASE_PATH}/service3/statement-bg.poster.jpg`}
        />
        <TodayStandard />
        <GrowthCycle />
        <SkeepExperience />
        <ClosingCard />
      </div>

      <Footer />
    </main>
  );
}
