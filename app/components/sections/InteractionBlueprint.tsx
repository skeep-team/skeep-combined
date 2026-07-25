import styles from "./InteractionBlueprint.module.css";

const SUMMARY_ITEMS = [
  {
    title: "인증하고",
    body: "사용자가 환경에 접근하면 선택한 인증 환경이 나의 존재를 대신 증명합니다.",
  },
  {
    title: "알아보고",
    body: "세션이 만들어진 환경은 나를 알아볼 수 있습니다.\n직접 명령하거나 스킵에 요청하여 환경을 활성화 해보세요.",
  },
  {
    title: "받아들이는",
    body: "활성화 된 기기는 스킵 클라우드에서 나의 패킷을 전달받아\n어떤 말이든 척척 알아주는 나의 소울메이트가 됩니다.",
  },
];

const FEATURE_CARDS = [
  {
    title: "나를 중심으로 따라오는\n자율적인 소통창구",
    english: "autonomous movement",
  },
  {
    title: "시각적 선택과 목소리로 내리는\n명확한 지휘",
    english: "clear command",
  },
  {
    title: "언제나 내 곁에 머물어주는\n끊김없는 명령경험",
    english: "seamless accessibility",
  },
];

const PRINCIPLE_CARDS = [
  {
    title: "후속 접근성",
    subtitle: "Follow-up Accessibility",
    body: "스킵은 가시적으로 보이지 않는 상태지만, 사용자가 필요할 때 알아서 찾아오거나 호출시에 나타날 수 있어야 합니다.",
  },
  {
    title: "환경 유동성",
    subtitle: "Environmental Fluidity",
    body: "스킵은 특정 환경에 얽매이지 않은 채, 움직이는 사용자를 위해 환경이 바뀌어도 상호작용이 가능해야 합니다.",
  },
  {
    title: "신뢰성",
    subtitle: "Reliability",
    body: "스킵 에이전트의 판단을 사용자가 이해하고 믿을 수 있어야 합니다.",
  },
  {
    title: "제어",
    subtitle: "Control",
    body: "스킵이 보이지 않아도 사용자가 필요할 때 쉽게 찾고 사용할 수 있어야 합니다.",
  },
];

const FOLLOW_STEPS = [
  ["01", "상호작용 감지", "Interaction detection"],
  ["02", "인풋 편의성 고려", "Input convenience"],
  ["03", "환경 컨디션 파악", "Environmental conditions"],
  ["04", "대기상태", "Standby"],
];

export function InteractionBlueprint() {
  return (
    <section
      id="interaction-blueprint"
      className={styles.root}
      data-figma-node-id="5859:1500"
    >
      <div className={styles.heroSection}>
        <div className={styles.heroPanel}>
          <div className={styles.centerCopy}>
            <h2>
              Hello World!
              <br />
              환경과 나의 접점 사이
            </h2>
            <p>
              SKEEP은 환경이 사용자를 알아보도록 활성화시키고
              <br />
              직접 상호작용 중인 환경에서 소통을 이어갑니다.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.summaryList}>
        {SUMMARY_ITEMS.map((item, index) => (
          <article className={styles.summaryRow} key={item.title}>
            <div className={styles.mediaPlaceholder} aria-hidden="true">
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className={styles.summaryCopy}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.manifesto}>
        <h2>나와 가장 가까운 곳의 다정한 상호작용</h2>
        <p>
          보이지 않는 에이전트가 늘 곁에 있다는 것은 편리하지만 막연함이 되기도 합니다.
          <br />
          그래서 스킵은 완전히 숨지 않습니다.
          <br />
          <br />
          연결의 감각, 대신하고 있다는 신호, 언제든 제어할 수 있다는 안심.
          <br />
          보이지 않게 일하되, 믿을 수 있게 곁에 머무는 것. 그것이 스킵의 인터랙션입니다.
        </p>
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
          {FEATURE_CARDS.map((card, index) => (
            <article className={styles.featureCard} key={card.english}>
              <span className={styles.cardNumber}>0{index + 1}</span>
              <h3>{card.title}</h3>
              <p>{card.english}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.principleGridSection}>
        <div className={styles.principleGrid}>
          {PRINCIPLE_CARDS.map((card, index) => (
            <article className={styles.principleCard} key={card.title}>
              <div className={styles.principleVisual} aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className={styles.principleCopy}>
                <h3>{card.title}</h3>
                <h4>{card.subtitle}</h4>
                <p>{card.body}</p>
              </div>
            </article>
          ))}
        </div>
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
        <div className={styles.outputDemo}>
          <div className={styles.outputTabs} aria-label="출력 방식">
            <div className={styles.outputTab}>
              <i aria-hidden="true" />
              <i aria-hidden="true" />
              <i aria-hidden="true" />
            </div>
            <div className={styles.outputTabMuted}>
              <i aria-hidden="true" />
              <i aria-hidden="true" />
              <i aria-hidden="true" />
            </div>
            <div className={styles.outputTabMuted}>
              <i aria-hidden="true" />
              <i aria-hidden="true" />
              <i aria-hidden="true" />
            </div>
          </div>
          <div className={styles.soundPanel}>
            <span>Sound</span>
            <h3>소리 전달</h3>
            <div className={styles.chips}>
              <b>효과음 <small>Sound effect</small></b>
              <b>발화 <small>Speaking</small></b>
            </div>
            <p>
              여러 기기를 활성화할 때도, 스킵은 나와 상호작용 중인 환경에서부터
              <br />
              가장 가까운 신뢰를 만들어나갑니다.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.brandInterlude}>
        <h2>가볍게 사진</h2>
        <p>
          나중에 비주얼적으로 문법창이 완성되면
          <br />
          이곳에 브랜드 이미지를 더할 수 있습니다.
        </p>
      </div>

      <div className={styles.followSection}>
        <header className={styles.sectionHeader}>
          <span>SKEEP Following</span>
          <h2>나를 중심으로 하는 상호작용</h2>
          <h3>SKEEP Interaction Features</h3>
          <p>
            스킵은 어느 한 곳에 머무르지 않습니다.
            <br />
            당신이 걸음을 옮기면, 스킵도 조용히 그 곁으로 이동하죠.
            <br />
            당신의 움직임이 곧 스킵의 다음 자리가 됩니다.
          </p>
        </header>
        <div className={styles.followPanel}>
          <div className={styles.followSteps}>
            {FOLLOW_STEPS.map(([number, title, english], index) => (
              <article className={index === 0 ? styles.followStepActive : styles.followStep} key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{english}</p>
              </article>
            ))}
          </div>
          <div className={styles.followDetail}>
            <span>UWB 파악</span>
            <h3>여기저기, 나의 움직임을 따라서</h3>
            <p>
              스킵은 활성화된 환경 중 실시간으로 유저가 직접 조작하는 곳을 찾아다닙니다.
              <br />
              여러 명의 패킷이 들어가 있는 환경에서는 나의 인증 환경의 UWB를 통해 해당
              상호작용이 나임을 감지합니다.
            </p>
            <small>
              UWB(Ultra-Wideband): 500MHz 이상의 넓은 주파수 대역과 짧은 펄스파를
              사용하는 근거리 무선 통신 기술
            </small>
          </div>
        </div>
      </div>

      <div className={styles.informationSection}>
        <header className={styles.sectionHeader}>
          <span>SKEEP Information</span>
          <h2>대화, 그리고 푸시알람과 설정</h2>
          <h3>SKEEP Interaction Features</h3>
          <p>
            당신이 미처 보지 못한 곳에서 환경이 당신을 위해 먼저 움직일 때,
            <br />
            문득 스킵의 관리 현황이 궁금해질 때
            <br />
            언제든 전해 듣고 들여다볼 수 있습니다.
          </p>
        </header>
        <a
          className={styles.infoButton}
          href="https://www.figma.com/design/OlvMHDhs36lxc4sf6wopn3/2026-MEP---Skeep?node-id=5859-1500"
          target="_blank"
          rel="noreferrer"
        >
          정보 구조 자세히 보기 (IA)
        </a>
      </div>
    </section>
  );
}
