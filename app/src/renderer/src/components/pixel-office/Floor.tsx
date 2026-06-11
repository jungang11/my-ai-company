import { FLOOR } from './palette';
import floorWood from '../../assets/pixel-office/floor-wood.png';

// gpt-image-2 생성 우드 플랭크 타일 (skill "AI 생성 리소스" 파이프라인 1호).
// 1024px 원본을 64px CSS 셀로 반복 — 16:1 정수 다운스케일 + pixelated로 또렷하게.
export function Floor() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      style={{
        backgroundImage: `url(${floorWood})`,
        backgroundSize: '64px 64px',
        backgroundRepeat: 'repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
}

// 이전 cream/amber 체커 (skill 패턴 D) — PNG 톤이 안 맞으면 롤백용. PR 통과 후 정리.
export function FloorChecker() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="kairo-floor" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="24" height="24" fill={FLOOR.light} />
          <rect x="24" y="0" width="24" height="24" fill={FLOOR.dark} />
          <rect x="0" y="24" width="24" height="24" fill={FLOOR.dark} />
          <rect x="24" y="24" width="24" height="24" fill={FLOOR.light} />
          <rect x="0" y="0" width="48" height="1" fill={FLOOR.grout} opacity="0.3" />
          <rect x="0" y="0" width="1" height="48" fill={FLOOR.grout} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kairo-floor)" />
    </svg>
  );
}
