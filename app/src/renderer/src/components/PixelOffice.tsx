import { useEffect, useMemo, useState } from 'react';
import type { EmployeeProfile, QuarterMeta } from '../../../shared/ipc';
import type { EmployeeRow } from '../state/employee-store';
import { MessageInput } from './MessageInput';
import { WorkerAtSeat } from './pixel-office/Desk';
import {
  fromHour,
  TIME_CYCLE,
  TimeOverlay,
  timeOfDayLabel,
  type TimeOfDay,
} from './pixel-office/TimeOverlay';
import { Whiteboard } from './pixel-office/Whiteboard';
import type { Role } from './pixel-office/palette';
import officeBg from '../assets/pixel-office/office-bg.png';

type Props = {
  pmPending: boolean;
  meetingMode: boolean;
  retroMode: boolean;
  roster: EmployeeRow[];
  profiles: EmployeeProfile[];
  quarter: QuarterMeta | null;
  onClose: () => void;
  onSend: (text: string) => void;
};

type Seat = {
  employeeId: string;
  name: string;
  role: Role;
  x: number; // 책상 자리
  y: number;
  meetingX: number; // 회의 테이블 둘레
  meetingY: number;
};

// gpt-image-2 isometric 배경(office-bg.png, 3:2) 기준 % anchor.
// PM=상단 단독 책상, 직원 5명=대각 2열 (6번째 책상은 공석 — 신규 직원 슬롯).
// 회의 테이블 중심 ≈ (74,41). 둘레 6명 — PM이 top center에서 주재.
const SEATS: readonly Seat[] = [
  { employeeId: 'pm',        name: '박PM',   role: 'PM',        x: 56, y: 20, meetingX: 74, meetingY: 32 },
  { employeeId: 'dev-1',     name: '김개발', role: 'Engineer',  x: 25, y: 38, meetingX: 66, meetingY: 36 },
  { employeeId: 'dev-arch',  name: '박아키', role: 'Architect', x: 35, y: 44, meetingX: 82, meetingY: 36 },
  { employeeId: 'planner-1', name: '이기획', role: 'Planner',   x: 45, y: 50, meetingX: 66, meetingY: 46 },
  { employeeId: 'qa-1',      name: '정검증', role: 'QA',        x: 17, y: 53, meetingX: 82, meetingY: 46 },
  { employeeId: 'utility-1', name: '막내',   role: 'Utility',   x: 27, y: 59, meetingX: 74, meetingY: 50 },
];

export function PixelOffice({
  pmPending,
  meetingMode,
  retroMode,
  roster,
  profiles,
  quarter,
  onClose,
  onSend,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const workingMap = useMemo(() => {
    const map: Record<string, boolean> = { pm: pmPending };
    for (const r of roster) {
      if (r.status === 'working') {
        map[r.employeeId] = true;
      }
    }
    return map;
  }, [pmPending, roster]);

  // 직원별 현재 일감 풍선 텍스트 — working row의 prompt 첫 줄 truncate.
  const bubbleMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of roster) {
      if (r.status !== 'working') continue;
      const first = r.prompt.split('\n')[0].trim();
      map[r.employeeId] = first.length <= 16 ? first : first.slice(0, 15) + '…';
    }
    return map;
  }, [roster]);

  // 현 분기 동안 spawn된 sessionIds set — 직원별 분기 누적 count 계산용.
  const quarterSpawnsByEmployee = useMemo(() => {
    if (!quarter) return {};
    const set = new Set(quarter.sessionIds);
    const counts: Record<string, number> = {};
    for (const r of roster) {
      if (set.has(r.sessionId)) {
        counts[r.employeeId] = (counts[r.employeeId] ?? 0) + 1;
      }
    }
    return counts;
  }, [quarter, roster]);

  // 직원별 누적 spawn+tokens → 5단계 레벨. PM은 사장 직속이라 Lv5 고정.
  const levelMap = useMemo(() => {
    const counts: Record<string, { spawns: number; tokens: number }> = {};
    for (const r of roster) {
      if (!r.metrics) continue;
      const cur = counts[r.employeeId] ?? { spawns: 0, tokens: 0 };
      cur.spawns += 1;
      cur.tokens += r.metrics.inputTokens + r.metrics.outputTokens;
      counts[r.employeeId] = cur;
    }
    const map: Record<string, number> = { pm: 5 };
    for (const [id, c] of Object.entries(counts)) {
      if (c.spawns >= 20 || c.tokens >= 100_000) map[id] = 5;
      else if (c.spawns >= 8 || c.tokens >= 20_000) map[id] = 4;
      else if (c.spawns >= 3 || c.tokens >= 5_000) map[id] = 3;
      else if (c.spawns >= 1) map[id] = 2;
      else map[id] = 1;
    }
    return map;
  }, [roster]);

  const activeMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const p of profiles) {
      map[p.id] = p.active;
    }
    return map;
  }, [profiles]);

  const workingCount = Object.values(workingMap).filter(Boolean).length;

  // 시간대 — 시스템 시간 자동 (1분마다 update) + 사장 manual override 가능.
  const [autoTime, setAutoTime] = useState<TimeOfDay>(() => fromHour(new Date().getHours()));
  const [override, setOverride] = useState<TimeOfDay | null>(null);
  useEffect(() => {
    const tick = setInterval(() => setAutoTime(fromHour(new Date().getHours())), 60_000);
    return () => clearInterval(tick);
  }, []);
  const timeOfDay = override ?? autoTime;
  function cycleOverride() {
    const cur = override ?? autoTime;
    const next = TIME_CYCLE[(TIME_CYCLE.indexOf(cur) + 1) % TIME_CYCLE.length];
    setOverride(next);
  }

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
          <div className="flex items-center gap-2">
            <div>
              <div className="text-sm font-medium text-slate-100">사무실</div>
              <div className="text-[10px] text-slate-500">
                isometric bg (gpt-image-2) · 회의: prefix 시 회의 테이블 집합 · 작업 중 {workingCount}명
              </div>
            </div>
            {meetingMode && (
              retroMode ? (
                <span className="rounded-full bg-rose-900/40 px-2 py-0.5 text-[10px] font-medium text-rose-300 ring-1 ring-rose-700/60">
                  ● 회고 중
                </span>
              ) : (
                <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-700/60">
                  ● 회의 중
                </span>
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleOverride}
              title={override ? 'manual override' : 'auto (시스템 시간)'}
              className="rounded-md border border-slate-700 px-2 py-1 text-[10px] text-slate-300 hover:border-amber-500/50 hover:text-amber-200"
            >
              {timeOfDayLabel(timeOfDay)} {override ? '·수동' : '·자동'}
            </button>
            {override && (
              <button
                type="button"
                onClick={() => setOverride(null)}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                ↺
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              닫기 (Esc)
            </button>
          </div>
        </header>
        <section className="flex-1 overflow-hidden p-4">
          {/* 배경이 3:2(1536x1024)라 aspect 고정 — % anchor가 이미지 위 동일 지점에 정착 */}
          <div
            className="relative mx-auto h-full max-w-full overflow-hidden rounded-lg ring-2 ring-amber-950 shadow-2xl"
            style={{ aspectRatio: '3 / 2' }}
          >
            {/* isometric 사무실 배경 (gpt-image-2, 레퍼런스: references/kairosoftgame_image.jpg).
                바닥/벽/책상/회의테이블/휴게존은 배경에 흡수 — 이전 SVG 컴포넌트는 보존(롤백용). */}
            <img
              src={officeBg}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* 회의/회고 모드 cue — 배경 위 테두리 glow (Zones 사각형은 iso와 안 맞아 회수) */}
            {meetingMode && (
              <div
                className={`pointer-events-none absolute inset-0 rounded-lg ring-4 ring-inset ${
                  retroMode ? 'ring-rose-500/40' : 'ring-emerald-500/40'
                }`}
              />
            )}
            <Whiteboard x={36} y={10} quarter={quarter} />

            {/* 캐릭터 — 회의 모드 시 회의 테이블 둘레로 transition */}
            {SEATS.map((seat) => {
              const active = activeMap[seat.employeeId] ?? true;
              const targetX = meetingMode ? seat.meetingX : seat.x;
              const targetY = meetingMode ? seat.meetingY : seat.y - 8;
              return (
                <div
                  key={`worker-${seat.employeeId}`}
                  className="transition-opacity"
                  style={{ opacity: active ? 1 : 0.35 }}
                >
                  <WorkerAtSeat
                    x={targetX}
                    y={targetY}
                    role={seat.role}
                    name={seat.name}
                    working={!!workingMap[seat.employeeId]}
                    meetingMode={meetingMode}
                    isPM={seat.employeeId === 'pm'}
                    bubbleText={bubbleMap[seat.employeeId]}
                    level={levelMap[seat.employeeId] ?? 1}
                    quarterSpawns={quarterSpawnsByEmployee[seat.employeeId] ?? 0}
                  />
                </div>
              );
            })}

            {/* 사장 캐릭터 — 입구(좌하단 문) 옆 default. 회의 모드 시 테이블 아래쪽에서 PM과 대면 — 둘레 6명 자리 안 침범. */}
            <WorkerAtSeat
              x={meetingMode ? 74 : 12}
              y={meetingMode ? 58 : 70}
              role="Boss"
              name="사장"
              working={false}
              meetingMode={meetingMode}
              isPM={false}
            />

            {/* 시간대 overlay — 최상위 (캐릭터/가구 모두 덮어 분위기 통일) */}
            <TimeOverlay timeOfDay={timeOfDay} />
          </div>
        </section>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-800 px-5 py-2 text-[10px] text-slate-500">
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
        </div>
        <MessageInput onSend={onSend} />
      </div>
    </div>
  );
}
