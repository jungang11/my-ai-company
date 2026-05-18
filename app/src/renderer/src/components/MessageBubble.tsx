import type { ChatMessage } from '../state/chat-store';
import { Markdown } from './Markdown';

const ROLE_LABEL: Record<ChatMessage['role'], string> = {
  boss: '사장',
  pm: 'PM',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const fromBoss = message.role === 'boss';
  return (
    <div className={`flex w-full ${fromBoss ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        <div
          className={`mb-1 flex items-baseline gap-1.5 text-xs ${
            fromBoss ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className={fromBoss ? 'text-slate-400' : 'text-emerald-400'}>
            {ROLE_LABEL[message.role]}
          </span>
          <span className="text-[10px] text-slate-600">{formatTime(message.ts)}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
            fromBoss
              ? 'whitespace-pre-wrap bg-sky-600 text-white'
              : 'bg-slate-800 text-slate-100 ring-1 ring-slate-700'
          }`}
        >
          {fromBoss ? <>{message.text}</> : <Markdown>{message.text}</Markdown>}
          {message.streaming && (
            <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-emerald-400 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
