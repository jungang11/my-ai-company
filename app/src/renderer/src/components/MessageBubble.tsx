import type { ChatMessage } from '../state/chat-store';

const ROLE_LABEL: Record<ChatMessage['role'], string> = {
  boss: '사장',
  pm: 'PM',
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  const fromBoss = message.role === 'boss';
  return (
    <div className={`flex w-full ${fromBoss ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[70%]">
        <div
          className={`mb-1 text-xs ${
            fromBoss ? 'text-right text-slate-400' : 'text-left text-emerald-400'
          }`}
        >
          {ROLE_LABEL[message.role]}
        </div>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
            fromBoss
              ? 'bg-sky-600 text-white'
              : 'bg-slate-800 text-slate-100 ring-1 ring-slate-700'
          }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
