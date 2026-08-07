import Link from "next/link";
import styles from "./LiveBusinessSections.module.css";
import FootprintTimeline, { type TimelineEntry } from "./FootprintTimeline";
import SloganMorph from "./SloganMorph";

type HeaderProps = {
  id?: string;
  english: [string, string];
  korean: [string, string];
  spacious?: boolean;
};

type CanvasCard = {
  area: string;
  title: [string, string];
  lines: string[];
  dark?: boolean;
};

const canvasCards: CanvasCard[] = [
  {
    area: "partners",
    title: ["KEY", "PARTNERS"],
    lines: ["제품·공간 기업", "서비스 기업 (SaaS)", "클라우드 인프라사", "표준화 기구·규제 기관"],
  },
  {
    area: "activities",
    title: ["KEY", "ACTIVITIES"],
    lines: [
      "SDK 무상 배포·유지보수",
      "맥락 패킷 라우팅 및 룰 엔진 최적화",
      "Skeep AI Model 및 Cloud 운영",
      "Skeep Insights 데이터 분석",
      "파트너 생태계 확장",
    ],
  },
  {
    area: "resources",
    title: ["KEY", "RESOURCES"],
    lines: ["Migratable Agent 알고리즘", "SKEEP 브랜드", "클라우드·엣지 인프라", "사용자 맥락 데이터", "Skeep SDK"],
  },
  {
    area: "value",
    title: ["VALUE", "PROPOSITIONS"],
    lines: [
      "24/7 끊김없는 연속된 사용자 경험",
      "명령 없이 이어지는 매끄러운 사용자 경험",
      "독점적 SIS™ 아키텍처 기반의 초연결 생태계",
      "SaaS 파트너의 피지컬 터치포인트 확장",
      "어디에도 속하지 않는 유니버설 미들웨어",
      "Skeep Insights 기반 파트너 맞춤 컨설팅",
    ],
    dark: true,
  },
  {
    area: "relationships",
    title: ["CUSTOMER", "RELATIONSHIPS"],
    lines: ["B2C: 365일 24시간 자동화된 서비스", "B2B: 어시스티드 온보딩"],
  },
  {
    area: "channels",
    title: ["", "CHANNELS"],
    lines: ["초기: 파트너 기기 접점", "확장기: 디바이스 기본 에이전트", "파트너십 컨퍼런스·세일즈", "입소문 (Word of mouth)"],
  },
  {
    area: "segments",
    title: ["CUSTOMER", "SEGMENTS"],
    lines: ["B2C: 고관여 심리스 추구층", "B2B: 생태계 고립 기업", "B2B: SaaS 기업"],
  },
];

const timelineEntries: TimelineEntry[] = [
  {
    year: "2027",
    title: ["거인들의 전쟁 속에서 포착한 기회,", "파트너십 중심의 확장 전략"],
    body: "빅테크 진영이 온스크린 AI를 중심으로 자사 생태계를 진화시킬 때, 스킵은 물리적 환경에서의 경험 단절에 주목했습니다. 또, 빅테크와 직접 경쟁을 피하면서, 사용자 데이터와 생태계 확보가 시급했던 기업들을 첫 파트너로 포섭했습니다.",
    image: "footprint-timeline-2027",
    alt: "파트너십을 상징하는 악수 장면",
  },
  {
    year: "2028",
    title: ["글로벌 데이터센터 과부하의", "궁극적인 해결책이 된 SIS™"],
    body: "빅테크들이 데이터 저장 비용 싸움으로 주춤할 때, 서버 부담을 극적으로 낮춘 차세대 아키텍처를 제시하며 해결사로 부상하기 시작했습니다. 이는 곧 주요 기업들이 스킵의 시스템을 앞다투어 도입하는 결정적인 계기가 되었습니다.",
    image: "footprint-timeline-2028",
    alt: "데이터센터 서버랙 장면",
  },
  {
    year: "2029",
    title: ["Migratable Agent의 시대의 서막,", "업계 표준을 향한 과감한 도약"],
    body: "AI 에이전트가 사용자를 따라 공간을 넘나들 수 있도록, 기기 간 연결을 중재하는 미들웨어 SDK를 전 세계에 무상 공개하며, 파트너사의 고유 권한을 침해하지 않으면서도 기기들이 연결되는 '사용 맥락의 표준'을 선도하기 시작했습니다.",
    image: "footprint-timeline-2029",
    alt: "업계 표준 발표 컨퍼런스 장면",
  },
  {
    year: "2030",
    title: ["선택이 아닌 상식, 마침내 완성된", "생태계와 이어지는 네트워크 효과"],
    body: "스킵의 인증을 받은 기기와 공간 인프라가 임계점을 돌파하며, 스킵 경험은 우리의 당연한 일상이 되었습니다. 이러한 압도적인 시장 지배력과 폭발적인 성장성을 바탕으로 나스닥에 성공적으로 상장, 글로벌 인프라의 정점에 섰습니다.",
    image: "footprint-timeline-2030",
    alt: "야간 도심 스카이라인 장면",
  },
  {
    year: "2031",
    title: ["세상의 모든 시공간을 연결하는", "대체불가능한 경험, 언제, 어디서든"],
    body: "단 하나의 물리적 접점도 소유하지 않았지만, 파트너사를 중심으로 온·오프라인 경험을 연결하며 '사용자 맥락' 중심의 스킵 생태계를 완성했습니다. 스킵은 세상 모든 시공간의 맥락 흐름을 독점하는 에이전틱 시대의 근간이 되었습니다.",
    image: "footprint-timeline-2031",
    alt: "전 세계를 연결하는 네트워크 지도 장면",
  },
];

function SectionMarker() {
  return (
    <span className={styles.marker} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => <i key={index} />)}
    </span>
  );
}

export function SectionHeader({ id, english, korean, spacious = false }: HeaderProps) {
  return (
    <section id={id} className={`${styles.sectionHeader} ${spacious ? styles.spaciousHeader : ""}`}>
      <h2>
        {english[0]}
        <br />
        {english[1]}
      </h2>
      <p>
        {korean[0]}
        <br />
        {korean[1]}
      </p>
      <SectionMarker />
    </section>
  );
}

export function ValueProposition() {
  return (
    <section id="value-proposition" className={styles.valueSection} aria-labelledby="value-title">
      <div className={styles.valueHeader}>
        <h2 id="value-title">Value<br />Proposition</h2>
        <p>스킵 비즈니스<br />핵심 가치</p>
        <SectionMarker />
      </div>

      <div className={styles.canvasGrid}>
        {canvasCards.map((card) => (
          <article
            key={card.area}
            className={styles.canvasCard}
            data-area={card.area}
            data-dark={card.dark ? "true" : "false"}
          >
            <h3>
              {card.title[0] ? <>{card.title[0]}<br /></> : null}
              {card.title[1]}
            </h3>
            <div>
              {card.lines.map((line) => <p key={line}>{line}</p>)}
            </div>
          </article>
        ))}

        <article className={`${styles.canvasCard} ${styles.wideCard}`} data-area="cost">
          <h3>COST<br />STRUCTURE</h3>
          <div className={styles.wideColumns}>
            <div>
              <p>클라우드·엣지 연산비 (COGS)</p>
              <p>SIS™ 파트너 온보딩 및 SDK 기술 지원비</p>
              <p>R&amp;D (에이전트 고도화)</p>
              <p>Insights 분석 인력</p>
              <p>세일즈·확장 비용</p>
            </div>
          </div>
        </article>

        <article className={`${styles.canvasCard} ${styles.wideCard}`} data-area="revenue">
          <h3>REVENUE<br />STREAMS</h3>
          <div className={styles.revenueColumns}>
            <div>
              <p>Skeep Pass 구독료 (Plus/Pro 요금제)</p>
              <p>SIS™ Access 수수료</p>
              <p>SIS™ Transaction 수수료</p>
            </div>
            <div>
              <p>Skeep Insights 컨설팅 수입료</p>
              <p>SIS™ Download 수수료</p>
              <p>SIS™ Promotion 수수료</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export function FootprintSection() {
  return (
    <section id="our-footprint" className={styles.footprint} aria-labelledby="footprint-title">
      <div className={styles.footprintHeader}>
        <h2 id="footprint-title">Our<br />Footprint</h2>
        <p>지난 5년, 스킵이 걸어온 길과<br />앞으로 나아갈 또 다른 미래</p>
        <SectionMarker />
      </div>

      <div className={styles.footprintIntro}>
        <h3>We’ve Skeeped<br />Five Years</h3>
        <p>
          우리가 지금 스킵과 함께 누리는 끊김 없는 일상은 어느 날<br />
          갑자기 완성된 것이 아닙니다. 스킵이 쉬지 않고 걸어온 길,<br />
          세상의 장벽을 허물어온 발자취를 조명합니다.
        </p>
      </div>

      <FootprintTimeline entries={timelineEntries} />

      {/* 네 줄을 쌓아 두는 대신, 한 줄이 스크롤에 맞춰 네 박자로 변한다. */}
      <SloganMorph />
    </section>
  );
}

export function BusinessClosing() {
  return (
    <footer className={styles.closing}>
      <div className={styles.closingCopy}>
        <h2>세상 모든 시공간을 연결하는 에이전트 시대의 서막, 스킵이 열어갑니다.</h2>
        <p>
          세상의 장벽을 허물어온 ‘스킵’은 에이전트 경험의 결승점이 아닙니다. 그저 다가올 미래에 상식이 될,<br />
          사용자 경험의 새로운 기준점을 가장 먼저 가져와 모두를 위한 출발점으로 제시했을 뿐이죠.
        </p>
        <Link href="/service2">스킵의 서비스 및 기술</Link>
        <small>Copyright © 2031 Skeep Inc. All rights Reserved.</small>
      </div>
      <div className={styles.closingPanel} aria-hidden="true" />
    </footer>
  );
}
