import { FLOOR } from './palette';

// cream/amber 체커 타일 + grout 1px highlight. 출처: skill 패턴 D.
export function Floor() {
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
