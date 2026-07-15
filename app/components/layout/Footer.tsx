import styles from "./Footer.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const groups = [
  {
    title: "About",
    links: [
      { label: "SKEEP 소개", href: `${BASE_PATH}/pages/index.html` },
      { label: "전시 웹사이트", href: `${BASE_PATH}/pages/index.html` },
      { label: "자주 묻는 질문", href: `${BASE_PATH}/pages/index.html` },
      { label: "팀 소개", href: `${BASE_PATH}/pages/index.html` },
    ],
  },
  {
    title: "Experience",
    links: [
      { label: "새겨듣다", href: `${BASE_PATH}/pages/saegyeodeutda.html` },
      { label: "스며들다", href: `${BASE_PATH}/pages/smeureulda.html` },
      { label: "조율하다", href: `${BASE_PATH}/negotiation` },
      { label: "빌려쓰다", href: `${BASE_PATH}/principles` },
      { label: "지켜주다", href: `${BASE_PATH}/service2` },
      { label: "기억하다", href: `${BASE_PATH}/service3` },
    ],
  },
  {
    title: "Skeepable",
    links: [
      { label: "장소 찾기", href: `${BASE_PATH}/principles` },
      { label: "제품 찾기", href: `${BASE_PATH}/principles` },
      { label: "서비스 찾기", href: `${BASE_PATH}/principles` },
      { label: "비즈니스", href: `${BASE_PATH}/principles` },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.headline}>
          Skip the Intro
          <br />
          Keep the Flow
        </p>
        <nav className={styles.nav} aria-label="Footer">
          {groups.map((group) => (
            <div className={styles.group} key={group.title}>
              <p className={styles.title}>{group.title}</p>
              <div className={styles.links}>
                {group.links.map((link) => (
                  <a className={styles.link} href={link.href} key={link.label}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <p className={styles.copyright}>© 2026 SKEEP. All rights reserved.</p>
    </footer>
  );
}
