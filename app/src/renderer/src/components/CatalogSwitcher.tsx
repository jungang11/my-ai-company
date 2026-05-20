import { useEffect, useState } from 'react';
import type { Catalog } from '../../../shared/ipc';

type Props = {
  /** 활성 catalog 변경 후 부모가 호출 (직원 명부 + StatusBar 갱신용) */
  onChange?: (activeId: string) => void;
};

function VendorChip({ vendor }: { vendor: 'anthropic' | 'openai' }) {
  const label = vendor === 'anthropic' ? 'Claude' : 'GPT';
  const color =
    vendor === 'anthropic'
      ? 'bg-amber-900/30 text-amber-300 ring-amber-700/40'
      : 'bg-emerald-900/30 text-emerald-300 ring-emerald-700/40';
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[8px] ring-1 ${color}`}>{label}</span>
  );
}

export function CatalogSwitcher({ onChange }: Props) {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [activeId, setActiveId] = useState<string>('claude-only');
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    Promise.all([window.api.listCatalogs(), window.api.fetchActiveCatalog()])
      .then(([list, active]) => {
        setCatalogs(list);
        setActiveId(active);
      })
      .catch((err) => console.error('[CatalogSwitcher] init failed:', err));
  }, []);

  const active = catalogs.find((c) => c.id === activeId);

  async function pick(id: string) {
    if (id === activeId) {
      setOpen(false);
      return;
    }
    setPending(true);
    try {
      await window.api.setActiveCatalog(id);
      setActiveId(id);
      onChange?.(id);
    } catch (e) {
      console.error('[CatalogSwitcher] setActive failed:', e);
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 hover:border-amber-500/40 hover:text-amber-200 disabled:opacity-50"
        title="catalog 선택 (vendor + model preset 일괄 적용)"
      >
        <span className="truncate">{active ? active.name : 'catalog 로드 중…'}</span>
        <span className="text-[10px] text-slate-500">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-1 w-full max-h-72 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          {catalogs.map((c) => {
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c.id)}
                className={`block w-full px-3 py-2 text-left text-xs hover:bg-slate-800/80 ${
                  isActive ? 'bg-slate-800/60' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isActive ? 'text-amber-300' : 'text-slate-100'}>
                    {c.name}
                  </span>
                  {isActive && <span className="text-[9px] text-emerald-400">active</span>}
                </div>
                <div className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                  {c.description}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(c.overrides).map(([empId, ov]) => (
                    <span
                      key={empId}
                      className="flex items-center gap-1 rounded bg-slate-950/50 px-1.5 py-0.5 text-[9px] text-slate-400"
                    >
                      {empId}
                      {ov.vendor && <VendorChip vendor={ov.vendor} />}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
