import type { Metadata } from "next";
import { StatementBlock } from "../components/service2/StatementBlock";
import { ClosingCard } from "../components/service3/ClosingCard";
import { GrowthCycle } from "../components/service3/GrowthCycle";
import { SkeepExperience } from "../components/service3/SkeepExperience";
import { TodayStandard } from "../components/service3/TodayStandard";
import { Footer } from "../components/sections/Footer";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "SKEEP | Personalization",
  description: "사용할수록 나에게 맞춰지는, SKEEP의 개인화 경험.",
};

export default function Service3Page() {
  return (
    <main>
      <StatementBlock
        heading={["당신다운 경험의 시작"]}
        video={`${BASE_PATH}/service3/statement-bg.mp4`}
      />
      <TodayStandard />
      <GrowthCycle />
      <SkeepExperience />
      <ClosingCard />
      <Footer />
    </main>
  );
}
