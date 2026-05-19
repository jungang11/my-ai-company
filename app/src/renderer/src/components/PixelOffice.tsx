import { useEffect } from 'react';

type Props = {
  pmWorking: boolean;
  onClose: () => void;
};

type Role = 'PM';

const ROLE_PALETTE: Record<Role, { shirt: string; shirtDark: string; hair: string }> = {
  PM: { shirt: '#f59e0b', shirtDark: '#b45309', hair: '#451a03' },
};

const SKIN = '#fde68a';
const SKIN_SHADE = '#fcd34d';

function Character({ role, working }: { role: Role; working: boolean }) {
  const c = ROLE_PALETTE[role];
  return (
    <div className="relative flex flex-col items-center">
      {working && (
        <div className="absolute -top-5 left-9 z-10 flex animate-pulse items-center justify-center rounded-md bg-white px-1.5 py-0.5 text-[8px] text-slate-700 shadow-sm ring-1 ring-slate-400">
          ⌨️
        </div>
      )}
      <svg
        viewBox="0 0 16 16"
        width="40"
        height="40"
        shapeRendering="crispEdges"
        className={working ? 'character-working' : 'character-idle'}
      >
        {/* 머리카락 (뒤쪽) */}
        <rect x="3" y="2" width="10" height="2" fill={c.hair} />
        <rect x="4" y="1" width="8" height="2" fill={c.hair} />
        {/* 머리 */}
        <rect x="4" y="3" width="8" height="6" fill={SKIN} />
        <rect x="3" y="4" width="10" height="4" fill={SKIN} />
        <rect x="3" y="8" width="10" height="1" fill={SKIN_SHADE} />
        {/* 머리카락 옆/위 */}
        <rect x="3" y="3" width="2" height="3" fill={c.hair} />
        <rect x="11" y="3" width="2" height="3" fill={c.hair} />
        <rect x="3" y="2" width="3" height="1" fill={c.hair} />
        <rect x="10" y="2" width="3" height="1" fill={c.hair} />
        {/* 눈 */}
        <rect x="6" y="6" width="1" height="1" fill="#1e293b" />
        <rect x="9" y="6" width="1" height="1" fill="#1e293b" />
        {/* 어깨/몸통 */}
        <rect x="3" y="10" width="10" height="4" fill={c.shirt} />
        <rect x="2" y="11" width="12" height="3" fill={c.shirt} />
        <rect x="2" y="13" width="12" height="1" fill={c.shirtDark} />
        {/* 팔 (책상 위 위치) */}
        <rect x="1" y="11" width="2" height="2" fill={SKIN} />
        <rect x="13" y="11" width="2" height="2" fill={SKIN} />
      </svg>
    </div>
  );
}

function Desk({
  x,
  y,
  role,
  name,
  working,
}: {
  x: number;
  y: number;
  role: Role;
  name: string;
  working: boolean;
}) {
  return (
    <div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="flex flex-col items-center">
        <Character role={role} working={working} />
        {/* 책상 (top-down) */}
        <div
          className="relative -mt-1 w-24 rounded-sm shadow-md ring-1 ring-amber-950"
          style={{ background: '#a16207', height: '38px' }}
        >
          {/* 모니터 */}
          <div className="absolute left-1/2 top-1 -translate-x-1/2 rounded-sm bg-slate-900 ring-1 ring-slate-700"
               style={{ width: '40px', height: '22px' }}>
            <div className="m-[2px] flex items-center justify-center rounded-[1px] bg-slate-800"
                 style={{ width: '36px', height: '18px' }}>
              <span
                className={`text-[7px] leading-none ${
                  working ? 'animate-pulse text-emerald-400' : 'text-slate-600'
                }`}
              >
                {working ? '> code' : ''}
              </span>
            </div>
          </div>
          {/* 키보드 */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-[1px] bg-slate-300 ring-1 ring-slate-400"
            style={{ width: '52px', height: '4px' }}
          />
        </div>
        {/* 이름표 */}
        <div className="mt-1 rounded-sm bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-medium text-slate-100 shadow-sm ring-1 ring-slate-700">
          {name}
        </div>
      </div>
    </div>
  );
}

function Floor() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <pattern id="kairo-floor" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="24" height="24" fill="#fef3c7" />
          <rect x="24" y="0" width="24" height="24" fill="#fde68a" />
          <rect x="0" y="24" width="24" height="24" fill="#fde68a" />
          <rect x="24" y="24" width="24" height="24" fill="#fef3c7" />
          <rect x="0" y="0" width="48" height="1" fill="#fbbf24" opacity="0.4" />
          <rect x="0" y="0" width="1" height="48" fill="#fbbf24" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kairo-floor)" />
    </svg>
  );
}

function Walls() {
  return (
    <>
      <div className="absolute left-0 right-0 top-0 h-3 bg-amber-900 shadow-inner" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-amber-900 shadow-inner" />
      <div className="absolute bottom-0 left-0 top-0 w-3 bg-amber-900 shadow-inner" />
      {/* 우측 벽 — 문 위치 빈 공간 (door gap) */}
      <div className="absolute right-0 top-0 w-3 bg-amber-900 shadow-inner" style={{ height: '40%' }} />
      <div className="absolute bottom-0 right-0 w-3 bg-amber-900 shadow-inner" style={{ height: '40%' }} />
      <div className="absolute right-3 flex items-center text-[8px] font-medium text-amber-900"
           style={{ top: '45%' }}>
        ← 입구
      </div>
    </>
  );
}

export function PixelOffice({ pmWorking, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-5xl flex-col rounded-2xl bg-slate-900 ring-1 ring-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <div>
            <div className="text-sm font-medium text-slate-100">사무실</div>
            <div className="text-[10px] text-slate-500">
              Phase 4 PR1 — 카이로 톤 top-down · PM 1명 (PR2에서 5명 책상 + 회의 테이블 + 휴게실 확장)
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            닫기 (Esc)
          </button>
        </header>
        <section className="flex-1 overflow-hidden p-4">
          <div className="relative h-full w-full overflow-hidden rounded-lg ring-2 ring-amber-950 shadow-2xl">
            <Floor />
            <Walls />
            <Desk x={50} y={55} role="PM" name="박PM" working={pmWorking} />
          </div>
        </section>
        <footer className="border-t border-slate-800 px-5 py-2 text-[10px] text-slate-500">
          PM 상태:{' '}
          <span className={pmWorking ? 'text-emerald-400' : 'text-slate-400'}>
            {pmWorking ? '작업 중 (응답 생성 또는 sub-agent spawn)' : 'idle (사장 메시지 대기)'}
          </span>
          <span className="ml-auto float-right text-amber-700/80">
            톤 참고: Game Dev Story / 카이로소프트
          </span>
        </footer>
      </div>
    </div>
  );
}
