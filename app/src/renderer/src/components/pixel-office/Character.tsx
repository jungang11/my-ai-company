import { ROLE_PALETTE, SKIN, SKIN_SHADE, type Role } from './palette';
import charPm from '../../assets/pixel-office/char-pm.png';
import charEngineer from '../../assets/pixel-office/char-engineer.png';
import charArchitect from '../../assets/pixel-office/char-architect.png';
import charPlanner from '../../assets/pixel-office/char-planner.png';
import charQa from '../../assets/pixel-office/char-qa.png';
import charUtility from '../../assets/pixel-office/char-utility.png';
import charBoss from '../../assets/pixel-office/char-boss.png';

type Props = {
  role: Role;
  working: boolean;
  walking?: boolean;
  bubbleText?: string;
};

// Role → PNG 스프라이트 매핑 (1254x1254 원본, 투명 alpha, 셔츠 색만 차이).
const ROLE_SPRITE: Record<Role, string> = {
  PM: charPm,
  Engineer: charEngineer,
  Architect: charArchitect,
  Planner: charPlanner,
  QA: charQa,
  Utility: charUtility,
  Boss: charBoss,
};

// PNG 스프라이트 캐릭터 (default). 트림된 스프라이트(세로>가로)라 height 40 기준 + width auto.
// 원본을 작게 줄이므로 imageRendering: pixelated 필수.
// walking > working > idle 애니메이션 우선순위 (walk cycle: 이동 중 bobbing+rotate).
// bubbleText 있으면 ⌨️ 대신 prompt 첫 줄 표시 (sub-agent 일감 실시간).
export function Character({ role, working, walking, bubbleText }: Props) {
  const animClass = walking
    ? 'character-walking'
    : working
    ? 'character-working'
    : 'character-idle';
  return (
    <div className="relative flex flex-col items-center">
      {/* left-9는 SVG 40px 폭 기준 — 트림 PNG 실폭(~23px)에 맞춰 left-4 (qa-1 회귀 리뷰 발견) */}
      {working && !walking && (
        <div className="thought-bubble absolute -top-5 left-4 z-10 flex items-center justify-center whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 text-[8px] text-slate-700 shadow-sm ring-1 ring-slate-400">
          {bubbleText ? bubbleText : '⌨️'}
        </div>
      )}
      <img
        src={ROLE_SPRITE[role]}
        height={40}
        alt={role}
        className={animClass}
        style={{ width: 'auto', imageRendering: 'pixelated' }}
      />
    </div>
  );
}

// 구버전 SVG 렌더 (롤백용 보존). 카이로 톤 SD 비례 (~2 head): 머리 7px, 어깨 10px, 정면 ¾ 시점.
// 출처: docs/skills/pixel-office-design.md 패턴 A.
export function CharacterSvg({ role, working, walking, bubbleText }: Props) {
  const c = ROLE_PALETTE[role];
  const animClass = walking
    ? 'character-walking'
    : working
    ? 'character-working'
    : 'character-idle';
  return (
    <div className="relative flex flex-col items-center">
      {working && !walking && (
        <div className="thought-bubble absolute -top-5 left-9 z-10 flex items-center justify-center whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 text-[8px] text-slate-700 shadow-sm ring-1 ring-slate-400">
          {bubbleText ? bubbleText : '⌨️'}
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
