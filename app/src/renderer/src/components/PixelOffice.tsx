import { useEffect } from 'react';

type Props = {
  pmWorking: boolean;
  onClose: () => void;
};

type Role = 'PM';

const ROLE_COLOR: Record<Role, { skin: string; shirt: string; pants: string }> = {
  PM: { skin: '#fcd34d', shirt: '#f59e0b', pants: '#1e293b' },
};

function Character({ role, working }: { role: Role; working: boolean }) {
  const c = ROLE_COLOR[role];
  return (
    <svg
      viewBox="0 0 16 24"
      width="44"
      height="66"
      shapeRendering="crispEdges"
      className={working ? 'character-working' : 'character-idle'}
    >
      <rect x="6" y="2" width="4" height="4" fill={c.skin} />
      <rect x="5" y="6" width="6" height="1" fill={c.skin} />
      <rect x="5" y="7" width="6" height="8" fill={c.shirt} />
      <rect x="3" y="8" width="2" height="6" fill={c.shirt} />
      <rect x="11" y="8" width="2" height="6" fill={c.shirt} />
      <rect x="3" y="14" width="2" height="1" fill={c.skin} />
      <rect x="11" y="14" width="2" height="1" fill={c.skin} />
      <rect x="5" y="15" width="2" height="7" fill={c.pants} />
      <rect x="9" y="15" width="2" height="7" fill={c.pants} />
      <rect x="4" y="22" width="3" height="1" fill="#0f172a" />
      <rect x="9" y="22" width="3" height="1" fill="#0f172a" />
    </svg>
  );
}

function Desk({
  employeeName,
  role,
  working,
  x,
  y,
}: {
  employeeName: string;
  role: Role;
  working: boolean;
  x: number;
  y: number;
}) {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' }}
    >
      <Character role={role} working={working} />
      <div className="mt-0.5 h-1 w-3 bg-slate-700" />
      <div className="h-2 w-16 rounded-sm bg-slate-700 ring-1 ring-slate-600" />
      <div className="h-3 w-1 bg-slate-700" />
      <div className="mt-2 text-[10px] font-medium text-slate-200">{employeeName}</div>
      <div
        className={`text-[9px] ${
          working ? 'text-emerald-400' : 'text-slate-500'
        } ${working ? 'animate-pulse' : ''}`}
      >
        {working ? '작업 중' : 'idle'}
      </div>
    </div>
  );
}

function FloorPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="floor" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="16" cy="16" r="1" fill="#475569" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#floor)" />
    </svg>
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
              Phase 4 PR1 — 픽셀 미니멀, PM 1명 (PR2에서 5명 + 책상 배치 확장)
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
        <section className="flex-1 overflow-hidden p-6">
          <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-b from-slate-800/30 to-slate-950 ring-1 ring-slate-800">
            <FloorPattern />
            <Desk employeeName="박PM" role="PM" working={pmWorking} x={50} y={62} />
          </div>
        </section>
        <footer className="border-t border-slate-800 px-5 py-2 text-[10px] text-slate-500">
          PM 상태:{' '}
          <span className={pmWorking ? 'text-emerald-400' : 'text-slate-400'}>
            {pmWorking ? '작업 중 (응답 생성 또는 sub-agent spawn)' : 'idle (사장 메시지 대기)'}
          </span>
        </footer>
      </div>
    </div>
  );
}
