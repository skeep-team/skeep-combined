import { StatusMorph } from "../components/ui/StatusMorph";

// 확인용 임시 미리보기 라우트. 배치 위치가 정해지면 지워도 된다.
export default function DevStatusMorphPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
      }}
    >
      <div style={{ width: "clamp(160px, 22vw, 320px)", aspectRatio: "1", background: "#000" }}>
        <StatusMorph />
      </div>
    </main>
  );
}
