import localFont from "next/font/local";

/* Elza Trial Condensed. 원본 .otf는 한 굵기당 120KB대라 woff2로 줄여서 담았다. */
export const elza = localFont({
  src: [
    { path: "./ElzaCond-Regular.woff2", weight: "400", style: "normal" },
    { path: "./ElzaCond-Medium.woff2", weight: "500", style: "normal" },
    { path: "./ElzaCond-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./ElzaCond-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-elza",
  display: "swap",
});
