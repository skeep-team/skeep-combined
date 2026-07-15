import Link from "next/link";
import styles from "./Footer.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const COLUMNS: FooterColumn[] = [
  {
    title: "About",
    links: [
      { label: "SKEEP 소개", href: "#" },
      { label: "전시 웹사이트", href: `${BASE_PATH}/pages/index.html`, external: true },
      { label: "자주 묻는 질문", href: "#" },
      { label: "팀 소개", href: "#" },
    ],
  },
  {
    title: "Experience",
    links: [
      { label: "새겨듣다", href: `${BASE_PATH}/pages/saegyeodeutda.html`, external: true },
      { label: "스며들다", href: `${BASE_PATH}/pages/smeureulda.html`, external: true },
      { label: "조율하다", href: "/negotiation" },
      { label: "빌려쓰다", href: "/principles" },
      { label: "지켜주다", href: "/service2" },
      { label: "기억하다", href: "/service3" },
    ],
  },
  {
    title: "Skeepable",
    links: [
      { label: "장소 찾기", href: "#" },
      { label: "제품 찾기", href: "#" },
      { label: "서비스 찾기", href: "#" },
      { label: "비즈니스", href: "#" },
    ],
  },
];

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path
        d="M7 17 17 7M9 7h8v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FooterLinkRow({ label, href, external }: FooterLink) {
  return (
    <div className={styles.linkRow}>
      {external ? (
        <a href={href} className={styles.linkLabel}>
          {label}
        </a>
      ) : (
        <Link href={href} className={styles.linkLabel}>
          {label}
        </Link>
      )}
      <ArrowUpRightIcon />
    </div>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.tagline}>
          <p>Skip the Intro</p>
          <p>Keep the Flow</p>
        </div>
        <nav className={styles.columns}>
          {COLUMNS.map((column) => (
            <div key={column.title} className={styles.column}>
              <p className={styles.columnTitle}>{column.title}</p>
              <div className={styles.linkList}>
                {column.links.map((link) => (
                  <FooterLinkRow key={link.label} {...link} />
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
