import type { Metadata } from "next";
import styles from "./page.module.css";
import { Footer } from "../components/layout/Footer";
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

export default function Service2Page() {
  return (
    <main>
      <StatementBlock
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
