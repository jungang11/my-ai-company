import { useState, type KeyboardEvent } from 'react';

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [draft, setDraft] = useState('');

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft('');
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-slate-800 bg-slate-900 p-3">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        rows={2}
        placeholder="PM에게 지시... (Enter 전송, Shift+Enter 줄바꿈)"
        className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={commit}
        disabled={!draft.trim()}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        보내기
      </button>
    </div>
  );
}
