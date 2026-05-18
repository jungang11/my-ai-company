import type { StatusSnapshot, StatusInit, RateLimitInfo } from '../../../shared/ipc';

type Props = {
  init: StatusInit | null;
  status: StatusSnapshot | null;
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatCost(usd: number): string {
  return `$${usd.toFixed(4)}`;
}

function formatRelative(epochMs: number): string {
  if (!epochMs) return '?';
  const diff = epochMs - Date.now();
  if (diff <= 0) return '곧';
  const min = Math.floor(diff / 60_000);
  const h = Math.floor(min / 60);
  if (h > 0) return `${h}h${min % 60}m`;
  return `${min}m`;
}

function rateLimitChip(info: RateLimitInfo) {
  const label =
    info.type === 'five_hour' ? '5h' : info.type === 'seven_day' ? '7d' : info.type;
  const ok = info.status === 'allowed';
  const msLeft = info.resetsAtMs - Date.now();
  // limited면 빨강, 30분 이내 임박이면 amber, 그 외 slate.
  const colorClass = !ok
    ? 'bg-rose-900/40 text-rose-300'
    : msLeft > 0 && msLeft < 30 * 60 * 1000
      ? 'bg-amber-900/40 text-amber-300'
      : 'bg-slate-800 text-slate-400';
  return (
    <span key={info.type} className={`rounded px-1.5 py-0.5 ${colorClass}`}>
      {label} {ok ? '·' : '!'} {formatRelative(info.resetsAtMs)}
    </span>
  );
}

export function StatusBar({ init, status }: Props) {
  // ctx = 마지막 turn에서 PM이 실제 사용한 context window 점유분.
  // = fresh input + cache read (이전 turn 누적이 cache로 hit) + cache creation (새 cache).
  // 1M 한도 대비 몇 % 차지하고 있는지 사장이 한 turn 기준으로 보고 싶어함.
  const lastTurnCtx = status
    ? status.lastInputTokens + status.lastCacheReadTokens + status.lastCacheCreationTokens
    : 0;
  const ctxPct =
    status && status.contextWindow > 0
      ? Math.round((lastTurnCtx / status.contextWindow) * 100)
      : 0;

  // cache hit rate: cache_read / (cache_read + fresh_input + cache_creation).
  // 0~100%. 직원 시스템 프롬프트·카탈로그가 안정적이면 시간이 갈수록 올라가야 정상.
  const cacheTotal = status
    ? status.totalCacheReadTokens +
      status.totalInputTokens // 이미 input + cache_create 합산 누적
    : 0;
  const cacheHitPct =
    status && cacheTotal > 0
      ? Math.round((status.totalCacheReadTokens / cacheTotal) * 100)
      : 0;

  return (
    <footer className="flex items-center gap-3 border-t border-slate-800 bg-slate-950/80 px-3 py-1.5 text-[11px] text-slate-400">
      <span className="font-medium text-slate-200">{init?.projectName ?? '?'}</span>
      <span className="text-slate-600">·</span>
      <span>
        <span className="text-slate-500">branch</span> {init?.branch ?? '?'}
      </span>
      <span className="text-slate-600">·</span>
      <span>
        <span className="text-slate-500">model</span>{' '}
        <span className="text-emerald-400">{status?.model || '?'}</span>
      </span>

      <span className="ml-auto flex items-center gap-3">
        <span title="마지막 turn의 context 점유: fresh input + cache read + cache creation">
          <span className="text-slate-500">ctx</span>{' '}
          {status ? `${formatTokens(lastTurnCtx)} / ${formatTokens(status.contextWindow)}` : '0 / ?'}{' '}
          <span className="text-slate-500">({ctxPct}%)</span>
        </span>
        <span title="세션 누적 — fresh input + cache creation은 매 turn 새로 청구, output은 매 turn 새로 생성">
          <span className="text-slate-500">tok 누적</span>{' '}
          {status
            ? `↑${formatTokens(status.totalInputTokens)} ↓${formatTokens(status.totalOutputTokens)}`
            : '↑0 ↓0'}
        </span>
        <span title="cache read / (cache read + fresh input + cache creation)">
          <span className="text-slate-500">cache</span>{' '}
          <span className={cacheHitPct >= 50 ? 'text-emerald-400' : 'text-slate-300'}>
            {cacheHitPct}%
          </span>{' '}
          <span className="text-slate-500">
            (R {status ? formatTokens(status.totalCacheReadTokens) : '0'} / C{' '}
            {status ? formatTokens(status.totalCacheCreationTokens) : '0'})
          </span>
        </span>
        <span>
          <span className="text-slate-500">cost</span>{' '}
          {status ? formatCost(status.totalCostUsd) : '$0.0000'}
        </span>
        {(status?.rateLimits ?? []).map((r) => rateLimitChip(r))}
      </span>
    </footer>
  );
}
