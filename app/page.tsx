import type { Metadata } from "next";
import { Hub } from "./components/hub/Hub";

export const metadata: Metadata = {
  title: "SKEEP",
  description: "환경이 바뀌어도, 사용자의 의도는 끊기지 않습니다.",
};

export default function Home() {
  return <Hub />;
}
