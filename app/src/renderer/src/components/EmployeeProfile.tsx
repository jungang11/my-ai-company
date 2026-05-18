import type { EmployeeProfile as Profile } from '../../../shared/ipc';

type Props = {
  profile: Profile;
  onToggle: (id: string, next: boolean) => void;
};

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

export function EmployeeProfileRow({ profile, onToggle }: Props) {
  const isPM = profile.id === 'pm';
  const dim = !profile.active && !isPM;
  const roleColor = ROLE_COLOR[profile.role] ?? 'text-slate-300';

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
        dim ? 'opacity-50' : ''
      } hover:bg-slate-900/60`}
    >
      <label className="flex flex-1 cursor-pointer items-center gap-2">
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
    </div>
  );
}
