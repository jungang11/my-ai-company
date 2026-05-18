import type { EmployeeProfile as Profile } from '../../../shared/ipc';

export type EmployeeUsage = {
  spawns: number;
  totalTokens: number;
};

type Props = {
  profile: Profile;
  onToggle: (id: string, next: boolean) => void;
  usage?: EmployeeUsage;
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const ROLE_COLOR: Record<string, string> = {
  PM: 'text-amber-300',
  개발자: 'text-sky-300',
  '수석 개발자 (아키텍처)': 'text-violet-300',
  기획자: 'text-emerald-300',
  QA: 'text-rose-300',
  잡일: 'text-slate-300',
};

function shortModel(model?: string): string {
  if (!model) return '?';
  return model.replace('claude-', '').replace('-20251001', '');
}

export function EmployeeProfileRow({ profile, onToggle, usage }: Props) {
  const isPM = profile.id === 'pm';
  const dim = !profile.active && !isPM;
  const roleColor = ROLE_COLOR[profile.role] ?? 'text-slate-300';
  const hasUsage = usage && usage.spawns > 0;

  return (
    <div
      className={`rounded-lg px-2 py-1.5 text-xs ${dim ? 'opacity-50' : ''} hover:bg-slate-900/60`}
    >
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={profile.active}
          disabled={isPM}
          onChange={(e) => onToggle(profile.id, e.target.checked)}
          className="h-3.5 w-3.5 cursor-pointer accent-emerald-500 disabled:cursor-not-allowed"
          title={isPM ? 'PM은 항상 활성 (사장 직통)' : profile.active ? '비활성으로 전환' : '활성으로 전환'}
        />
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <span className="font-medium text-slate-100">{profile.name}</span>
          <span className={`${roleColor} text-[10px]`}>{profile.role}</span>
          <span className="ml-auto text-[10px] text-slate-500">{shortModel(profile.model)}</span>
        </div>
      </label>
      {hasUsage && (
        <div className="mt-1 ml-6 text-[10px] text-slate-500" title="누적 spawn 횟수 · input+output 토큰">
          {usage.spawns}회 · {formatTokens(usage.totalTokens)} tok
        </div>
      )}
    </div>
  );
}
