// SERVICE/PRODUCT/SPACE 카드 이미지 경로.
// 예전엔 이 파일 자체가 base64로 인코딩된 이미지 3장(총 4MB+)을 통째로 담고 있어서,
// 브라우저가 이 스크립트를 파싱/실행하는 동안 이미지 렌더링이 막혀 카드가 뜰 때
// 버벅였다. 실제 정적 파일(WebP, 훨씬 가벼움)을 가리키는 경로로 바꿔서 이제
// 브라우저가 일반 이미지처럼 병렬로 내려받고 캐싱할 수 있다.
window.WM_CARD_IMAGES = {
  service: 'assets/wm-service.webp',
  product: 'assets/wm-product.webp',
  space: 'assets/wm-space.webp',
};
