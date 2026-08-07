import localFont from "next/font/local";

/* T1 Glicky. 원본 .otf(52KB, Regular 한 굵기)를 woff2로 줄여서 담았다. */
export const t1glicky = localFont({
  src: [{ path: "./T1Glicky-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-t1glicky",
  display: "swap",
});
