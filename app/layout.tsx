import type { Metadata } from "next";
import Script from "next/script";
import { CursorProvider } from "./components/ui/Cursor";
import { pretendard } from "./fonts/pretendard";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKEEP",
  description: "환경이 바뀌어도, 사용자의 의도는 끊기지 않습니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <html lang="ko" className={pretendard.variable}>
      <head>
        <link rel="stylesheet" href={`${basePath}/site-index.css`} />
      </head>
      <body>
        <CursorProvider>{children}</CursorProvider>
        <Script src={`${basePath}/site-index.js`} strategy="afterInteractive" />
      </body>
    </html>
  );
}
