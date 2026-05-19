import { useEffect, useMemo } from 'react';
import type { EmployeeProfile } from '../../../shared/ipc';
import type { EmployeeRow } from '../state/employee-store';
import { Desk } from './pixel-office/Desk';
import { Floor } from './pixel-office/Floor';
import { MeetingTable } from './pixel-office/MeetingTable';
import { Sofa } from './pixel-office/Sofa';
import { Walls } from './pixel-office/Walls';
import { WaterCooler } from './pixel-office/WaterCooler';
import { Whiteboard } from './pixel-office/Whiteboard';
import { Zones } from './pixel-office/Zones';
import type { Role } from './pixel-office/palette';

type Props = {
  pmPending: boolean;
  roster: EmployeeRow[];
  profiles: EmployeeProfile[];
  onClose: () => void;
};

type Seat = {
  employeeId: string;
  name: string;
  role: Role;
  x: number;
  y: number;
};

// 6직군 좌석 배치 — 좌측 65% 영역에 모음. 우측 30%는 회의실/휴게실 zone.
// 위 row: Engineer 좌 / PM 중앙 / Architect 우 — 아래 row: Planner 좌 / Utility 중앙 / QA 우
const SEATS: readonly Seat[] = [
  { employeeId: 'dev-1', name: '김개발', role: 'Engineer', x: 18, y: 32 },
  { employeeId: 'pm', name: '박PM', role: 'PM', x: 40, y: 32 },
  { employeeId: 'dev-arch', name: '박아키', role: 'Architect', x: 62, y: 32 },
  { employeeId: 'planner-1', name: '이기획', role: 'Planner', x: 18, y: 72 },
  { employeeId: 'utility-1', name: '막내', role: 'Utility', x: 40, y: 72 },
  { employeeId: 'qa-1', name: '정검증', role: 'QA', x: 62, y: 72 },
];

export function PixelOffice({ pmPending, roster, profiles, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 직원별 working 여부 — PM은 pmPending(응답 생성 중) OR 본인 roster row(드물게)
  const workingMap = useMemo(() => {
    const map: Record<string, boolean> = { pm: pmPending };
    for (const r of roster) {
      if (r.status === 'working') {
        map[r.employeeId] = true;
      }
    }
    return map;
  }, [pmPending, roster]);

  // 직원별 active 여부 — 비활성은 흐릿하게 (책상은 있지만 캐릭터 opacity 낮춤)
  const activeMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const p of profiles) {
      map[p.id] = p.active;
    }
    return map;
  }, [profiles]);

  const workingCount = Object.values(workingMap).filter(Boolean).length;

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
              Phase 4 PR2.3 — 6직군 + 회의실/휴게실 zone + 가구 (회의 테이블/화이트보드/소파/식수기) · 작업 중 {workingCount}명
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
            <Zones />
            <Whiteboard x={82} y={18} />
            <MeetingTable x={82} y={30} />
            <WaterCooler x={75} y={64} />
            <Sofa x={84} y={75} />
            {SEATS.map((seat) => {
              const active = activeMap[seat.employeeId] ?? true;
              return (
                <div
                  key={seat.employeeId}
                  style={{ opacity: active ? 1 : 0.35 }}
                  className="transition-opacity"
                >
                  <Desk
                    x={seat.x}
                    y={seat.y}
                    role={seat.role}
                    name={seat.name}
                    working={!!workingMap[seat.employeeId]}
                  />
                </div>
              );
            })}
          </div>
        </section>
        <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-800 px-5 py-2 text-[10px] text-slate-500">
          <span>
            PM:{' '}
            <span className={pmPending ? 'text-emerald-400' : 'text-slate-400'}>
              {pmPending ? '응답 생성 중' : 'idle'}
            </span>
          </span>
          {SEATS.filter((s) => s.employeeId !== 'pm').map((s) => (
            <span key={s.employeeId}>
              {s.name}:{' '}
              <span className={workingMap[s.employeeId] ? 'text-emerald-400' : 'text-slate-600'}>
                {workingMap[s.employeeId] ? '작업 중' : 'idle'}
              </span>
            </span>
          ))}
          <span className="ml-auto text-amber-700/80">skill: pixel-office-design</span>
        </footer>
      </div>
    </div>
  );
}
