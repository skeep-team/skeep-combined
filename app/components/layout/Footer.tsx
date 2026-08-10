import styles from "./Footer.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// disabled: 페이지는 있지만 지금은 연결하지 않는 항목. 목록에는 남기고 다른 링크와
// 시각적으로 완전히 같게 두되, 눌러도 이동만 안 되게 한다 — 링크가 아예 없어진 것
// (페이지 자체가 삭제된 것)만 목록에서 지운다.
const groups = [
  {
    title: "About",
    links: [
      { label: "SKEEP 소개", href: `${BASE_PATH}/pages/index.html`, disabled: true },
      { label: "전시 웹사이트", href: `${BASE_PATH}/pages/index.html` },
      { label: "자주 묻는 질문", href: `${BASE_PATH}/pages/index.html`, disabled: true },
      { label: "팀 소개", href: `${BASE_PATH}/pages/index.html`, disabled: true },
    ],
  },
  {
    title: "Experience",
    links: [
      { label: "인식과 준비", href: `${BASE_PATH}/pages/saegyeodeutda.html` },
      { label: "경험 및 상호작용", href: `${BASE_PATH}/negotiation` },
      { label: "종료와 개인화", href: `${BASE_PATH}/service2` },
    ],
  },
  {
    title: "Skeepable",
    links: [
      { label: "장소 찾기", href: `${BASE_PATH}/negotiation`, disabled: true },
      { label: "제품 찾기", href: `${BASE_PATH}/negotiation`, disabled: true },
      { label: "서비스 찾기", href: `${BASE_PATH}/negotiation`, disabled: true },
      { label: "비즈니스", href: `${BASE_PATH}/business` },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.headline}>
          SKIP THE INTRO
          <br />
          KEEP THE FLOW
        </p>
        <nav className={styles.nav} aria-label="Footer">
          {groups.map((group) => (
            <div className={styles.group} key={group.title}>
              <p className={styles.title}>{group.title}</p>
              <div className={styles.links}>
                {group.links.map((link) =>
                  "disabled" in link && link.disabled ? (
                    <span
                      className={`${styles.link} ${styles.linkDisabled}`}
                      aria-disabled="true"
                      key={link.label}
                    >
                      {link.label}
                    </span>
                  ) : (
                    <a
                      className={styles.link}
                      href={link.href}
                      key={link.label}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <p className={styles.copyright}>© 2026 SKEEP. All rights reserved.</p>
    </footer>
  );
}
