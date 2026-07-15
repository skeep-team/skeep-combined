import type { Metadata } from "next";
import { Footer } from "../components/layout/Footer";
import { ContextSummary } from "../components/service2/ContextSummary";
import { ImageTextCard } from "../components/service2/ImageTextCard";
import { LeaveNothing } from "../components/service2/LeaveNothing";
import { ResetSequence } from "../components/service2/ResetSequence";
import { StatementBlock } from "../components/service2/StatementBlock";

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
      <Footer />
    </main>
  );
}
