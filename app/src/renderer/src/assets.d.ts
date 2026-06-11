// vite asset import 타입 (pixel-office PNG 등).
// 주의: top-level import가 있는 모듈 파일(global.d.ts)에 넣으면 ambient로 등록 안 됨 — 순수 선언 파일 유지.
declare module '*.png' {
  const src: string;
  export default src;
}
