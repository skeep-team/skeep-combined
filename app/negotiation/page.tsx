import type { Metadata } from "next";
import { StatementBlock } from "../components/service2/StatementBlock";
import { AnchorEnvironment } from "../components/negotiation/AnchorEnvironment";
import { EnvironmentLayers } from "../components/negotiation/EnvironmentLayers";
import { EvaluationCriteria } from "../components/negotiation/EvaluationCriteria";
import { MoreStory } from "../components/negotiation/MoreStory";
import { NegotiationDiagram } from "../components/negotiation/NegotiationDiagram";
import { NegotiationPillars } from "../components/negotiation/NegotiationPillars";
import { ProtectionPrinciples } from "../components/negotiation/ProtectionPrinciples";
import { Footer } from "../components/layout/Footer";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "SKEEP | Negotiation",
  description: "충돌이 생긴 순간부터, 합의에 이를 때까지.",
};

export default function NegotiationPage() {
  return (
    <main>
      <StatementBlock
        heading={["당신이 원하는 그대로", "가장 자연스럽게"]}
        image={`${BASE_PATH}/negotiation/statement-bg.poster.jpg`}
      />
      <EvaluationCriteria />
      <EnvironmentLayers />
      <AnchorEnvironment />
      <NegotiationPillars />
      <MoreStory />
      <NegotiationDiagram />
      <ProtectionPrinciples />
      <Footer />
    </main>
  );
}
