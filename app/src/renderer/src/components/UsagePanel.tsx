import { useEffect, useMemo, useState } from 'react';
import type { EmployeeProfile, QuarterMeta } from '../../../shared/ipc';
import type { EmployeeRow } from '../state/employee-store';

type Props = {
  rows: EmployeeRow[];
  profiles: EmployeeProfile[];
  quarter: QuarterMeta | null;
  onClose: () => void;
};

type Scope = 'total' | 'quarter';

type Usage = {
  spawns: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  durationMs: number;
};

function defaultUsage(): Usage {
  return {
    spawns: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    durationMs: 0,
  };
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function shortModel(model?: string): string {
  if (!model) return '?';
  return model.replace('claude-', '').replace('-20251001', '');
}

const ROLE_COLOR: Record<string, string> = {
  PM: 'text-amber-300',
  개발자: 'text-sky-300',
  '수석 개발자 (아키텍처)': 'text-violet-300',
  기획자: 'text-emerald-300',
  QA: 'text-rose-300',
  잡일: 'text-slate-300',
};

export function UsagePanel({ rows, profiles, quarter, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [scope, setScope] = useState<Scope>('total');
  const quarterSet = useMemo(
    () => (quarter ? new Set(quarter.sessionIds) : null),
    [quarter],
  );

  const usageByEmployee = useMemo(() => {
    const map = new Map<string, Usage>();
    for (const r of rows) {
      if (!r.metrics) continue;
      if (scope === 'quarter' && quarterSet && !quarterSet.has(r.sessionId)) continue;
      const cur = map.get(r.employeeId) ?? defaultUsage();
      cur.spawns += 1;
      cur.inputTokens += r.metrics.inputTokens;
      cur.outputTokens += r.metrics.outputTokens;
      cur.cacheReadTokens += r.metrics.cacheReadTokens;
      cur.cacheCreationTokens += r.metrics.cacheCreationTokens;
      if (r.endedAt) cur.durationMs += r.endedAt - r.startedAt;
      map.set(r.employeeId, cur);
    }
    return map;
  }, [rows, scope, quarterSet]);

  // PM 본인 + sub 직원 모두 노출. PM은 다른 시스템 (메인 channel)이라 아직 데이터 X.
  const items = profiles
    .map((profile) => ({ profile, usage: usageByEmployee.get(profile.id) ?? defaultUsage() }))
    .filter((it) => it.usage.spawns > 0 || it.profile.active);

  // 막대 정규화 기준 — input+output 토큰 합산의 최댓값.
  const maxTokens = Math.max(
    ...items.map((it) => it.usage.inputTokens + it.usage.outputTokens),
    1,
  );

  const totals = items.reduce(
    (acc, { usage }) => ({
      spawns: acc.spawns + usage.spawns,
      inputTokens: acc.inputTokens + usage.inputTokens,
      outputTokens: acc.outputTokens + usage.outputTokens,
      cacheReadTokens: acc.cacheReadTokens + usage.cacheReadTokens,
      cacheCreationTokens: acc.cacheCreationTokens + usage.cacheCreationTokens,
      durationMs: acc.durationMs + usage.durationMs,
    }),
    defaultUsage(),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-900 ring-1 ring-slate-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <div>
            <div className="text-sm font-medium text-slate-100">직원 사용량</div>
            <div className="text-[10px] text-slate-500">
              {scope === 'total'
                ? '전체 누적 (historical 포함 — workspace/sessions 영속 데이터)'
                : `현 분기 "${quarter?.title ?? 'Untitled'}" — ${quarter?.sessionIds.length ?? 0}건`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md ring-1 ring-slate-700">
              <button
                type="button"
                onClick={() => setScope('total')}
                className={`rounded-l-md px-2 py-1 text-[10px] ${
                  scope === 'total'
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setScope('quarter')}
                disabled={!quarter}
                className={`rounded-r-md px-2 py-1 text-[10px] ${
                  scope === 'quarter'
                    ? 'bg-amber-700/60 text-amber-100'
                    : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
                }`}
              >
                현 분기
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              닫기 (Esc)
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto px-5 py-3">
          {items.every((it) => it.usage.spawns === 0) ? (
            <div className="mt-12 text-center text-sm text-slate-500">
              아직 sub 직원 spawn 기록이 없습니다. PM에게 일감을 보내보세요.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ profile, usage }) => {
                const totalTok = usage.inputTokens + usage.outputTokens;
                const barPct = maxTokens > 0 ? (totalTok / maxTokens) * 100 : 0;
                const roleColor = ROLE_COLOR[profile.role] ?? 'text-slate-300';
                return (
                  <div
                    key={profile.id}
                    className="rounded-lg bg-slate-950/50 p-3 ring-1 ring-slate-800"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
                      <span className="font-medium text-slate-100">{profile.name}</span>
                      <span className={`${roleColor} text-[10px]`}>{profile.role}</span>
                      <span className="text-[10px] text-slate-600">({profile.id})</span>
                      <span className="ml-auto text-[10px] text-slate-500">
                        {shortModel(profile.model)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 sm:grid-cols-4">
                      <div>
                        <span className="text-slate-500">spawn</span>{' '}
                        <span className="text-slate-200">{usage.spawns}회</span>
                      </div>
                      <div>
                        <span className="text-slate-500">in</span>{' '}
                        <span className="text-slate-200">{formatTokens(usage.inputTokens)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">out</span>{' '}
                        <span className="text-slate-200">{formatTokens(usage.outputTokens)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">cache R/C</span>{' '}
                        <span className="text-slate-200">
                          {formatTokens(usage.cacheReadTokens)}/{formatTokens(usage.cacheCreationTokens)}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-500">dur</span>{' '}
                        <span className="text-slate-200">{formatDuration(usage.durationMs)}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-500/70"
                            style={{ width: `${barPct}%` }}
                            title={`${formatTokens(totalTok)} / ${formatTokens(maxTokens)} (max)`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <footer className="border-t border-slate-800 px-5 py-2 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              <span className="text-slate-500">합계 spawn</span>{' '}
              <span className="text-slate-100">{totals.spawns}회</span>
            </span>
            <span>
              <span className="text-slate-500">in</span> {formatTokens(totals.inputTokens)}
            </span>
            <span>
              <span className="text-slate-500">out</span> {formatTokens(totals.outputTokens)}
            </span>
            <span>
              <span className="text-slate-500">cache R/C</span>{' '}
              {formatTokens(totals.cacheReadTokens)}/{formatTokens(totals.cacheCreationTokens)}
            </span>
            <span>
              <span className="text-slate-500">dur</span> {formatDuration(totals.durationMs)}
            </span>
            <span className="ml-auto text-slate-600">
              Task tool sub-agent는 PM과 합산 청구라 별도 cost X
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
