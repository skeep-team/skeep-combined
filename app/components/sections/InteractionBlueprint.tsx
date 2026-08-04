import { FollowStepsPanel } from "./FollowStepsPanel";
import UsageSequence from "./UsageSequence";
import styles from "./InteractionBlueprint.module.css";
import { OutputDemo } from "./OutputDemo";

const FEATURE_CARDS = [
  {
    title: "Autonomous Movement",
    body: "나를 중심으로 따라오는\n자율적인 소통창구",
  },
  {
    title: "Clear Command",
    body: "시각적 선택과 목소리로 내리는\n명확한 지휘",
  },
  {
    title: "Seamless Accessibility",
    body: "언제나 내 곁에 머물어주는\n끊김없는 명령경험",
  },
];

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* 시안(Figma 8233-26201): 왼쪽에 색 판 하나, 오른쪽에 제목·영문·본문.
   카드는 가로로 눕고 위아래로 쌓인다. 문구는 기존 것을 그대로 쓴다. */
const PRINCIPLE_CARDS = [
  {
    title: "후속 접근성",
    subtitle: "Follow-up Accessibility",
    body: "스킵은 가시적으로 보이지 않는 상태지만, 사용자가 필요할 때 알아서 찾아오거나 호출시에 나타날 수 있어야 합니다.",
    visual: "principle-01",
  },
  {
    title: "제어",
    subtitle: "Control",
    body: "스킵은 언제 어디서나 쉽게 사용할 수 있어야하며, 사용자가 원할 때 주도적으로 설정과 지침을 바꿀 수 있어야합니다.",
    visual: "principle-02",
  },
  {
    title: "신뢰성",
    subtitle: "Reliability",
    body: "스킵은 사용자에게 충분한 정보를 전달하며 테스크 실행 후엔 언제나 결과를 드러내야 합니다.",
    visual: "principle-03",
  },
  {
    title: "환경 유동성",
    subtitle: "Environmental Fluidity",
    body: "스킵은 특정 환경에 얽매이지 않은 채, 움직이는 사용자를 위해 환경이 바뀌어도 상호작용이 가능해야 합니다.",
    visual: "principle-04",
  },
];

const INFORMATION_SECTIONS = [
  {
    eyebrow: "Environmental Usage",
    title: "환경 사용 알람",
    body:
      "SKEEP은 사용할 환경을 선택하고 연결할 때, 음성이나 화면을 통해 환경의 이름과 이용 시간, 제공 기능을 안내합니다. 더 자세한 정보가 필요하다면, 스킵이 해당 환경의 에이전트와 연결해 필요한 내용을 바로 확인할 수 있도록 돕습니다.",
  },
  {
    eyebrow: "Conversation",
    title: "대화",
    body:
      "SKEEP은 사용자의 음성 명령을 언제든 받을 수 있도록 대기합니다. 명령을 듣거나 확인이 필요한 순간에는 그래픽과 효과음으로 현재 소통 중임을 알립니다.",
    note: "연결된 환경이 음성을 인식할 수 없는 경우에는, 자세히 보기 화면에 생성된 채팅창을 통해 명령을 입력하고 응답을 확인할 수 있습니다.",
  },
  {
    eyebrow: "More",
    title: "자세히 보기",
    body:
      "화면 가장자리의 SKEEP 인터페이스를 누르거나 음성으로 명령하면, 현재 사용 중인 환경과 연결 상태를 확인하고 조정할 수 있습니다. 필요에 따라 사용자의 앵커 환경과 인증 환경도 다시 설정할 수 있습니다.",
  },
];

export function InteractionBlueprint() {
  return (
    <section
      id="interaction-blueprint"
      className={styles.root}
      data-figma-node-id="5859:1500"
    >
      <div className={styles.manifesto}>
        <h2>나와 가장 가까운 곳의 다정한 상호작용</h2>
        <p>
          눈에 보이지 않는 SKEEP은 인터페이스와 빛, 소리로 현재 연결된 상태를 알립니다.
          <br />
          사용자는 이를 통해 SKEEP의 작동을 인지하고, 필요할 때 언제든 멈추거나 조정할 수 있습니다.
        </p>
      </div>

      {/* 시안(Figma 8290-2269): 왼쪽 화면 판, 오른쪽 카피. */}
      <div className={styles.summarySection}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.summaryVisual}
          src={`${BASE_PATH}/blueprint/summary/pc-main-image.png`}
          alt=""
          width={1440}
          height={932}
          loading="lazy"
          decoding="async"
        />
        <div className={styles.summaryCopy}>
          <h2>인증하고 알아보고</h2>
          <p>
            사용자가 환경에 접근하면 선택한 인증 환경이 나의 존재를 대신 증명합니다.
            <br />
            세션이 만들어진 환경은 나를 알아볼 수 있습니다.
            <br />
            직접 명령하거나 스킵에 요청하여 환경을 활성화 해보세요.
          </p>
        </div>
      </div>

      <div className={styles.featureSection}>
        <header className={styles.sectionHeader}>
          <span>SKEEP Interaction Features</span>
          <h2>사용자의 곁에 머무는 스킵의 인터랙션</h2>
          <p>
            여러 기기를 활성화할 때도, 스킵은 나와 상호작용 중인 환경에서부터
            <br />
            가장 가까운 신뢰를 만들어나갑니다.
          </p>
        </header>
        <div className={styles.featureCards}>
          {FEATURE_CARDS.map((card) => (
            <article className={styles.featureCard} key={card.title}>
              <p className={styles.featureCardTitle}>{card.title}</p>
              <p className={styles.featureCardBody}>{card.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.principleGridSection}>
        <div className={styles.principleGrid}>
          {PRINCIPLE_CARDS.map((card) => (
            <article className={styles.principleCard} key={card.title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.principleVisual}
                src={`${BASE_PATH}/blueprint/principles/${card.visual}.png`}
                alt=""
                width={722}
                height={660}
                loading="lazy"
                decoding="async"
              />
              <div className={styles.principleCopy}>
                <div className={styles.principleTitle}>
                  <h3>{card.title}</h3>
                  <h4>{card.subtitle}</h4>
                </div>
                <p>{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.followSection}>
        <header className={styles.sectionHeader}>
          <span>SKEEP Following</span>
          <h2>나를 중심으로하는 상호작용</h2>
          <h3>SKEEP Interaction Features</h3>
          <p>
            SKEEP은 어느 한 곳에 머무르지 않습니다.
            <br />
            당신이 걸음을 옮기면, 스킵도 조용히 그 곁으로 이동하죠.
            <br />
            SKEEP은 인풋 편의성과 환경 컨디션을 고려하여 당신과 함께 움직입니다.
          </p>
        </header>
        <FollowStepsPanel />
      </div>

      <div className={styles.outputSection}>
        <header className={styles.sectionHeader}>
          <span>SKEEP Output</span>
          <h2>스킵이 말하는 방법</h2>
          <h3>SKEEP Interaction Features</h3>
          <p>
            스킵은 하나의 전달 방식만을 고집하지 않습니다.
            <br />
            시각적으로 보여주고, 음성으로 말하고.
            <br />
            환경이 가진 방식 그대로, 가장 유연하게 소통합니다.
          </p>
        </header>
        <OutputDemo />
      </div>

      {/* 시안(Figma 8262-26688): 세 덩이를 겹쳐 두고 스크롤에 따라 하나씩 페이드 전환한다. */}
      <UsageSequence sections={INFORMATION_SECTIONS} />
    </section>
  );
}
