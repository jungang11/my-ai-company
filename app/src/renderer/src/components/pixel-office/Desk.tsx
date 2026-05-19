import { useEffect, useState } from 'react';
import { Character } from './Character';
import { DESK, type Role } from './palette';

// 책상 + 캐릭터를 두 컴포넌트로 분리 — 회의 모드에서 캐릭터만 회의실로 이동, 책상은 자리에 남게.

type DeskProps = {
  x: number;
  y: number;
  working: boolean;
};

// 책상 sprite + 빈 의자만. 이름표/캐릭터/풍선은 WorkerAtSeat이 책임.
export function DeskSprite({ x, y, working }: DeskProps) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y + 3}%`, transform: 'translate(-50%, -50%)' }}
    >
      <svg
        viewBox="0 0 32 16"
        width="120"
        height="60"
        shapeRendering="crispEdges"
        className="drop-shadow-sm"
      >
        <rect x="0" y="2" width="32" height="12" fill={DESK.wood} />
        <rect x="0" y="13" width="32" height="1" fill={DESK.woodDark} />
        <rect x="0" y="7" width="32" height="1" fill={DESK.woodDark} opacity="0.4" />
        <rect x="0" y="2" width="32" height="1" fill="#fbbf24" opacity="0.3" />

        {/* 커피잔 */}
        <rect x="2" y="3" width="3" height="4" fill={DESK.cup} />
        <rect x="2" y="3" width="3" height="1" fill={DESK.coffee} />
        <rect x="5" y="4" width="1" height="2" fill={DESK.cup} />

        {/* 모니터 */}
        <rect x="10" y="2" width="12" height="7" fill={DESK.monitorFrame} />
        <rect x="11" y="3" width="10" height="5" fill={DESK.monitorScreen} />
        <rect x="14" y="9" width="4" height="1" fill={DESK.monitorFrame} />
        <rect x="13" y="10" width="6" height="1" fill={DESK.monitorFrame} />
        {working && (
          <>
            <rect x="12" y="4" width="6" height="1" fill={DESK.monitorText} className="screen-blink" />
            <rect x="12" y="6" width="4" height="1" fill={DESK.monitorText} className="screen-blink" />
          </>
        )}

        {/* 키보드 */}
        <rect x="10" y="11" width="12" height="2" fill={DESK.keyboard} />
        <rect x="11" y="11" width="1" height="1" fill={DESK.keyboardKey} />
        <rect x="13" y="11" width="1" height="1" fill={DESK.keyboardKey} />
        <rect x="15" y="11" width="1" height="1" fill={DESK.keyboardKey} />
        <rect x="17" y="11" width="1" height="1" fill={DESK.keyboardKey} />
        <rect x="19" y="11" width="1" height="1" fill={DESK.keyboardKey} />
        <rect x="21" y="11" width="1" height="1" fill={DESK.keyboardKey} />

        {/* 마우스 */}
        <rect x="25" y="11" width="3" height="2" fill={DESK.mouse} />
        <rect x="25" y="11" width="3" height="1" fill="#475569" />

        {/* 포스트잇 */}
        <rect x="25" y="3" width="3" height="3" fill={DESK.postit} />
        <rect x="25" y="3" width="3" height="1" fill="#fbbf24" opacity="0.5" />
        <rect x="28" y="4" width="3" height="3" fill={DESK.postitAlt} />
      </svg>
    </div>
  );
}

type WorkerProps = {
  x: number;
  y: number;
  role: Role;
  name: string;
  working: boolean;
  meetingMode: boolean;
  isPM: boolean;
  bubbleText?: string;
  level?: number; // 1~5, Boss는 undefined로 표시 X
};

// 캐릭터 + 이름표 + 풍선. 회의 모드 시 회의실 좌표로 transition.
// 회의 모드일 땐 ⌨️ working 풍선 대신 회의 풍선(PM 💬 발언 / 나머지 ... 청취) 표시.
export function WorkerAtSeat({
  x,
  y,
  role,
  name,
  working,
  meetingMode,
  isPM,
  bubbleText,
  level,
}: WorkerProps) {
  const effectiveWorking = working && !meetingMode;
  // meetingMode 전환 시 700ms walk cycle (transition duration과 동일).
  const [walking, setWalking] = useState(false);
  useEffect(() => {
    setWalking(true);
    const t = setTimeout(() => setWalking(false), 700);
    return () => clearTimeout(t);
  }, [meetingMode]);
  return (
    <div
      className="absolute transition-all duration-700 ease-in-out"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative flex flex-col items-center">
        {meetingMode && (
          <div
            className={`absolute -top-7 z-10 flex items-center justify-center rounded-md bg-white px-1.5 py-0.5 text-[9px] text-slate-700 shadow-sm ring-1 ring-slate-400 ${
              isPM ? 'meeting-bubble-speak' : 'meeting-bubble-listen'
            }`}
          >
            {isPM ? '💬' : '···'}
          </div>
        )}
        <Character
          role={role}
          working={effectiveWorking}
          walking={walking}
          bubbleText={meetingMode ? undefined : bubbleText}
        />
        <div className="mt-1 flex items-center gap-1 rounded-sm bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-medium text-slate-100 shadow-sm ring-1 ring-slate-700">
          <span>{name}</span>
          {level !== undefined && (
            <span className="text-[8px] text-amber-300">Lv{level}</span>
          )}
        </div>
      </div>
    </div>
  );
}
