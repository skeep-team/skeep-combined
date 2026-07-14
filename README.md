# SKEEP Principles

패럴랙스 스크롤 방식으로 구성된 SKEEP 프린시플 웹사이트. Next.js(App Router) + TypeScript +
Framer Motion으로 제작되었으며, Figma 디자인(`[프린시플 Web] 빌림/다운로드` 프레임)의 10개
섹션을 스크롤 연동 애니메이션으로 구현했습니다.

## Getting Started

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## Structure

- `app/components/sections/` — 섹션별 컴포넌트 (Hero, IcebreakSkip, RoleFlow, Detour,
  Principles, FeaturePillar, EnvironmentCollage, CTA)
- `app/components/ui/` — 공용 스크롤 애니메이션 유틸 (`Reveal`, `ParallaxLayer`)
- `app/fonts/` — Pretendard 로컬 폰트
