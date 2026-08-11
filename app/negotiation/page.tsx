import type { Metadata } from "next";
import styles from "./page.module.css";
import { SectionTabs, type SectionTab } from "../components/layout/SectionTabs";
import { StatementBlock } from "../components/service2/StatementBlock";
import { AnchorEnvironment } from "../components/negotiation/AnchorEnvironment";
import { EnvironmentLayers } from "../components/negotiation/EnvironmentLayers";
import { EvaluationCriteria } from "../components/negotiation/EvaluationCriteria";
import { MoreStory } from "../components/negotiation/MoreStory";
import { NegotiationDiagram } from "../components/negotiation/NegotiationDiagram";
import { NegotiationPillars } from "../components/negotiation/NegotiationPillars";
import { ProtectionPrinciples } from "../components/negotiation/ProtectionPrinciples";
import { Footer } from "../components/layout/Footer";
import { CTA } from "../components/sections/CTA";
import { Detour } from "../components/sections/Detour";
import { EnvironmentCollage } from "../components/sections/EnvironmentCollage";
import { FeaturePillar } from "../components/sections/FeaturePillar";
import { Hero } from "../components/sections/Hero";
import { IcebreakSkip } from "../components/sections/IcebreakSkip";
import { InteractionBlueprint } from "../components/sections/InteractionBlueprint";
import { Principles } from "../components/sections/Principles";
import { RoleFlow } from "../components/sections/RoleFlow";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "SKEEP | Negotiation",
  description: "충돌이 생긴 순간부터, 합의에 이를 때까지.",
};

/* index.html의 UX LOGIC 섹션(경험 및 상호작용 탭, data-i="1")에 이미 정리된
   4개 카드 제목을 그대로 가져왔다 — 그 섹션이 이 페이지 전체의 공식 목차다. */
const negotiationTabs: SectionTab[] = [
  { id: "negotiation-logic", line1: "Negotiation", line2: "Logic" },
  { id: "borrowing-logic", line1: "Borrowing", line2: "Logic" },
  { id: "interaction-blueprint", line1: "Interaction", line2: "Logic" },
  { id: "download-logic", line1: "Download", line2: "Logic" },
];

export default function NegotiationPage() {
  return (
    <main className={styles.page}>
      <SectionTabs
        tabs={negotiationTabs}
        cssVar="--section-tabbar-h"
        ariaLabel="경험 및 상호작용 섹션"
        hideUntilPastFirst
      />
      <StatementBlock
        id="negotiation-logic"
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

      {/* 빌려쓰다(principles) 병합: 이 아래는 원래 /principles 라우트였다.
          위쪽 조율하다 섹션과 같은 .page(Elza 대문자) 스타일을 그대로 공유한다. */}
      <Hero id="borrowing-logic" />
      <IcebreakSkip />
      <RoleFlow />
      <InteractionBlueprint />
      <Detour />
      <Principles />
      <FeaturePillar
        id="download-logic"
        eyebrow="Service"
        heading="하나의 서비스, 더 다채로운 가능성"
        body={"필요한 AI 스킬과 워크플로우를 불러와,\n지금 하던 일을 끊김 없이 이어갑니다."}
        image={`${BASE_PATH}/negotiation/pillars/service.jpg`}
        imageAlt="스마트폰을 들어 사용하는 사람"
        questions={[
          {
            label: "Q1.",
            text: "서비스에 무엇이 다운로드 되나요?",
            answer:
              "목적을 수행하기 위해 필요한 AI 스킬과 워크플로우가 다운로드됩니다. 환경에 없는 기능을 잠시 확장하여, 작업 흐름이 끊기지 않게 돕습니다.",
          },
          {
            label: "Q2.",
            text: "기존 서비스를 대체하는 방식인가요?",
            answer:
              "아니요. 기존 서비스를 더 영리하게 연결하는 방식입니다. <b>쓰던 툴의 기능은 그대로 유지</b>하되, SKEEP이 당신의 의도에 맞춰 기능을 최적화합니다.",
          },
          {
            label: "Q3.",
            text: "여러 기능을 동시에 다운받을 수 있나요?",
            answer:
              "네. 사용자가 수행하려는 목적에 따라 <b>여러 기능을 동시에 연결</b>할 수 있습니다. 각 환경은 사용자의 흐름에 맞춰 필요한 기능을 유연하게 확장합니다.",
          },
        ]}
      />
      <FeaturePillar
        eyebrow="Product"
        imagePosition="right"
        heading="하나의 제품, 더 확장된 가능성"
        body={"기능 모듈과 드라이버를 통해,\n사용자가 익숙한 제품으로 완전히 새로운 일을 수행합니다."}
        image={`${BASE_PATH}/negotiation/pillars/product.jpg`}
        imageAlt="냉장고를 사용하는 사람"
        questions={[
          {
            label: "Q1.",
            text: "별도의 장비를 추가해야 하나요?",
            answer:
              "아니요. 하드웨어를 새로 더할 필요 없습니다. 지금 사용자가 있는 환경의 능력들을 기반으로 더 시너지를 낼 수 있는 기능들을 다운받습니다.",
          },
          {
            label: "Q2.",
            text: "처음 쓰는 제품에서도 바로 사용할 수 있나요?",
            answer:
              "네. SKEEP을 지원하는 제품이라면, 상호작용이 시작된 즉시 당신을 이해합니다. 아이스브레이킹은 필요하지 않습니다.",
          },
          {
            label: "Q3.",
            text: "제품의 원래 기능/에이전트는 그대로 유지되나요?",
            answer:
              "물론이죠! 제품 고유의 기능과 에이전트는 온전히 유지됩니다. SKEEP은 그 위에 당신의 맥락을 더해, 더욱 매끄러운 경험을 제공합니다.",
          },
        ]}
      />
      <FeaturePillar
        eyebrow="Space"
        heading="하나의 공간, 더 넓은 가능성"
        body={"공간 에이전트에 필요한 기능을 임시로 배포해,\n기존 자원을 새로운 목적에 맞게 활용합니다."}
        image={`${BASE_PATH}/negotiation/pillars/space.jpg`}
        imageAlt="제품 전시 공간"
        questions={[
          {
            label: "Q1.",
            text: "공간에는 어떤 능력을 더할 수 있나요?",
            answer:
              "조명, 사운드, 디스플레이와 같이 그 <b>공간이 가진 모든 물리적 자원을 당신의 목적에 맞게 세팅</b>합니다. 낯선 공간도 순식간에 당신의 스튜디오가 될 수 있죠.",
          },
          {
            label: "Q2.",
            text: "다른 사람의 경험에 영향을 주지는 않나요?",
            answer:
              "걱정 마세요. SKEEP은 사용자 간의 목적을 조용히 조율하고 있습니다. 누구의 경험도 침해하지 않으며 모두가 공존할 수 있는 가장 스마트한 대안을 제안합니다.",
          },
          {
            label: "Q3.",
            text: "모든 공간에서 같은 방식으로 작동하나요?",
            answer:
              "SKEEP의 철학은 동일하지만, 공간마다 가진 운영 규칙과 물리적 환경에 맞춰 가장 자연스럽게 반응하게 됩니다. 어떤 공간이든 당신의 흐름은 멈추지 않을겁니다!",
          },
        ]}
      />
      <EnvironmentCollage />
      <CTA />

      <Footer />
    </main>
  );
}
