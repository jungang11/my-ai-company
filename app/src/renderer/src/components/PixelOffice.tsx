import { useEffect } from 'react';
import { Desk } from './pixel-office/Desk';
import { Floor } from './pixel-office/Floor';
import { Walls } from './pixel-office/Walls';

type Props = {
  pmWorking: boolean;
  onClose: () => void;
};

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
              Phase 4 PR2.1 — 카이로 톤 (비례 +1px / 책상 5종 디테일 / 컴포넌트 분리) · PM 1명. PR2.2에서 5명 + 셔츠 5색.
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
            톤 reference: docs/skills/pixel-office-design.md
          </span>
        </footer>
      </div>
    </div>
  );
}
