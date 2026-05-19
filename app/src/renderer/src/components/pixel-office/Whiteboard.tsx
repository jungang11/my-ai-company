import { useEffect, useRef, useState } from 'react';
import type { QuarterMeta } from '../../../../shared/ipc';

// 화이트보드 sprite — 회의실 위쪽에 부착. 분기 목표/진척 표시 (PR4).
// PR11: quarter.quarterId 변경 시 3초 amber pulse cue.

type Props = {
  x: number;
  y: number;
  quarter: QuarterMeta | null;
};

function shortTitle(title: string, max = 14): string {
  const t = title.trim() || 'Untitled';
  return t.length <= max ? t : t.slice(0, max - 1) + '…';
}

export function Whiteboard({ x, y, quarter }: Props) {
  const sessions = quarter?.sessionIds.length ?? 0;
  // 진척: 첫 10건은 0~100%. 이후도 100% 유지 (단순 시각).
  const progressPct = Math.min(100, sessions * 10);

  // 분기 변경 시 3초 amber pulse cue. 첫 mount는 skip.
  const isFirstMount = useRef(true);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!quarter) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 3000);
    return () => clearTimeout(t);
  }, [quarter?.quarterId]);

  return (
    <div
      className="absolute transition-transform duration-300"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${pulse ? 1.15 : 1})`,
      }}
    >
      <div
        className="relative transition-all duration-300"
        style={{
          filter: pulse
            ? 'drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 12px #fbbf24)'
            : 'none',
        }}
      >
        <svg viewBox="0 0 42 12" width="140" height="40" shapeRendering="crispEdges">
          <rect x="0" y="0" width="42" height="12" fill="#94a3b8" />
          <rect x="1" y="1" width="40" height="10" fill="#f8fafc" />
          {/* default dot 무늬는 quarter 없을 때만 — 분기 활성 시 텍스트가 대체 */}
          {!quarter && (
            <>
              <rect x="3" y="3" width="3" height="1" fill="#1e293b" />
              <rect x="7" y="3" width="2" height="1" fill="#3b82f6" />
              <rect x="10" y="3" width="4" height="1" fill="#1e293b" />
              <rect x="15" y="3" width="2" height="1" fill="#f43f5e" />
              <rect x="3" y="6" width="5" height="1" fill="#1e293b" />
              <rect x="9" y="6" width="3" height="1" fill="#10b981" />
            </>
          )}
        </svg>
        {quarter && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-1 pointer-events-none">
            <div
              className="truncate text-[7px] font-semibold leading-tight text-slate-800"
              title={quarter.title}
            >
              {shortTitle(quarter.title)}
            </div>
            <div className="mt-0.5 h-[2px] w-[80%] overflow-hidden rounded-full bg-slate-300">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-[6px] leading-none text-slate-600">{sessions}건</div>
          </div>
        )}
      </div>
    </div>
  );
}
