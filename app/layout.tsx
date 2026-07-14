import type { Metadata } from "next";
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
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <CursorProvider>{children}</CursorProvider>
      </body>
    </html>
  );
}
