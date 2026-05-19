import { Character } from './Character';
import { DESK, type Role } from './palette';

type Props = {
  x: number;
  y: number;
  role: Role;
  name: string;
  working: boolean;
};

// "한 칸에 디테일 하나 더" 카이로 룰: 책상 위에 모니터/키보드/마우스/커피잔/포스트잇 5종.
// 출처: docs/skills/pixel-office-design.md 패턴 C.
export function Desk({ x, y, role, name, working }: Props) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="flex flex-col items-center">
        <Character role={role} working={working} />
        <DeskSprite working={working} />
        <div className="mt-1 rounded-sm bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-medium text-slate-100 shadow-sm ring-1 ring-slate-700">
          {name}
        </div>
      </div>
    </div>
  );
}

function DeskSprite({ working }: { working: boolean }) {
  // 책상 sprite는 SVG 1개로 통합 — 좌측 컵, 가운데 모니터+키보드, 우측 포스트잇+마우스.
  return (
    <svg
      viewBox="0 0 32 16"
      width="120"
      height="60"
      shapeRendering="crispEdges"
      className="-mt-1 drop-shadow-sm"
    >
      {/* 책상 wood 두 판 */}
      <rect x="0" y="2" width="32" height="12" fill={DESK.wood} />
      <rect x="0" y="13" width="32" height="1" fill={DESK.woodDark} />
      <rect x="0" y="7" width="32" height="1" fill={DESK.woodDark} opacity="0.4" />
      <rect x="0" y="2" width="32" height="1" fill="#fbbf24" opacity="0.3" />

      {/* 커피잔 (좌측) */}
      <rect x="2" y="3" width="3" height="4" fill={DESK.cup} />
      <rect x="2" y="3" width="3" height="1" fill={DESK.coffee} />
      <rect x="5" y="4" width="1" height="2" fill={DESK.cup} />

      {/* 모니터 (중앙) — frame + screen */}
      <rect x="10" y="2" width="12" height="7" fill={DESK.monitorFrame} />
      <rect x="11" y="3" width="10" height="5" fill={DESK.monitorScreen} />
      {/* 모니터 스탠드 */}
      <rect x="14" y="9" width="4" height="1" fill={DESK.monitorFrame} />
      <rect x="13" y="10" width="6" height="1" fill={DESK.monitorFrame} />
      {/* 화면 텍스트 (working 시 깜빡임) */}
      {working && (
        <>
          <rect x="12" y="4" width="6" height="1" fill={DESK.monitorText} className="screen-blink" />
          <rect x="12" y="6" width="4" height="1" fill={DESK.monitorText} className="screen-blink" />
        </>
      )}

      {/* 키보드 (중앙 하단) */}
      <rect x="10" y="11" width="12" height="2" fill={DESK.keyboard} />
      <rect x="11" y="11" width="1" height="1" fill={DESK.keyboardKey} />
      <rect x="13" y="11" width="1" height="1" fill={DESK.keyboardKey} />
      <rect x="15" y="11" width="1" height="1" fill={DESK.keyboardKey} />
      <rect x="17" y="11" width="1" height="1" fill={DESK.keyboardKey} />
      <rect x="19" y="11" width="1" height="1" fill={DESK.keyboardKey} />
      <rect x="21" y="11" width="1" height="1" fill={DESK.keyboardKey} />

      {/* 마우스 (우측 하단) */}
      <rect x="25" y="11" width="3" height="2" fill={DESK.mouse} />
      <rect x="25" y="11" width="3" height="1" fill="#475569" />

      {/* 포스트잇 2개 (우측 상단) */}
      <rect x="25" y="3" width="3" height="3" fill={DESK.postit} />
      <rect x="25" y="3" width="3" height="1" fill="#fbbf24" opacity="0.5" />
      <rect x="28" y="4" width="3" height="3" fill={DESK.postitAlt} />
    </svg>
  );
}
