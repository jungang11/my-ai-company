import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../state/chat-store';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

type Props = {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  pending?: boolean;
};

export function Chat({ messages, onSend, pending }: Props) {
  const tail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tail.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, pending]);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="text-sm font-medium text-slate-100">PM 채팅방</div>
        <div className="text-xs text-slate-400">사장과 PM의 직통 라인</div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="mt-12 text-center text-sm text-slate-500">
            PM이 출근 대기 중. 일감을 보내면 시작합니다.
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        {pending && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-2 text-xs text-slate-300 ring-1 ring-slate-700">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            PM 응답 준비 중… (cold start 5~10초, 그 뒤 streaming)
          </div>
        )}
        <div ref={tail} />
      </div>

      <MessageInput onSend={onSend} />
    </div>
  );
}
