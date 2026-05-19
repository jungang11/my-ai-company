import { ROLE_PALETTE, SKIN, SKIN_SHADE, type Role } from './palette';

type Props = {
  role: Role;
  working: boolean;
  walking?: boolean;
};

// 카이로 톤 SD 비례 (~2 head): 머리 7px, 어깨 10px, 정면 ¾ 시점.
// 출처: docs/skills/pixel-office-design.md 패턴 A.
// walking > working > idle 애니메이션 우선순위 (walk cycle: 이동 중 bobbing+rotate).
export function Character({ role, working, walking }: Props) {
  const c = ROLE_PALETTE[role];
  const animClass = walking
    ? 'character-walking'
    : working
    ? 'character-working'
    : 'character-idle';
  return (
    <div className="relative flex flex-col items-center">
      {working && !walking && (
        <div className="thought-bubble absolute -top-5 left-9 z-10 flex items-center justify-center rounded-md bg-white px-1.5 py-0.5 text-[8px] text-slate-700 shadow-sm ring-1 ring-slate-400">
          ⌨️
        </div>
      )}
      <svg
        viewBox="0 0 16 16"
        width="40"
        height="40"
        shapeRendering="crispEdges"
        className={animClass}
      >
        {/* 머리카락 (위/뒤) */}
        <rect x="3" y="1" width="10" height="2" fill={c.hair} />
        <rect x="4" y="0" width="8" height="2" fill={c.hair} />
        <rect x="3" y="3" width="2" height="3" fill={c.hair} />
        <rect x="11" y="3" width="2" height="3" fill={c.hair} />
        {/* 머리 (7px high, 카이로 SD 비례) */}
        <rect x="4" y="2" width="8" height="7" fill={SKIN} />
        <rect x="3" y="3" width="10" height="5" fill={SKIN} />
        <rect x="3" y="8" width="10" height="1" fill={SKIN_SHADE} />
        {/* 눈 */}
        <rect x="6" y="6" width="1" height="1" fill="#1e293b" />
        <rect x="9" y="6" width="1" height="1" fill="#1e293b" />
        {/* 어깨/몸통 (10px wide, 좁힘) */}
        <rect x="3" y="10" width="10" height="4" fill={c.shirt} />
        <rect x="4" y="11" width="8" height="3" fill={c.shirt} />
        <rect x="4" y="13" width="8" height="1" fill={c.shirtDark} />
        {/* 팔 (책상 위, 키보드 방향) */}
        <rect x="2" y="11" width="2" height="2" fill={SKIN} />
        <rect x="12" y="11" width="2" height="2" fill={SKIN} />
      </svg>
    </div>
  );
}
