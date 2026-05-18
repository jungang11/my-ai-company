import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../state/chat-store';

const ROLE_LABEL: Record<ChatMessage['role'], string> = {
  boss: '사장',
  pm: 'PM',
};

const md = {
  h1: (p: any) => <h1 className="my-2 text-base font-semibold text-slate-100" {...p} />,
  h2: (p: any) => <h2 className="mt-3 mb-1.5 text-sm font-semibold text-slate-100" {...p} />,
  h3: (p: any) => <h3 className="mt-2 mb-1 text-sm font-semibold text-slate-200" {...p} />,
  p: (p: any) => <p className="my-1.5 leading-relaxed" {...p} />,
  ul: (p: any) => <ul className="my-1.5 ml-4 list-disc space-y-0.5" {...p} />,
  ol: (p: any) => <ol className="my-1.5 ml-5 list-decimal space-y-0.5" {...p} />,
  li: (p: any) => <li className="leading-relaxed" {...p} />,
  code: ({ inline, className, children, ...rest }: any) =>
    inline ? (
      <code className="rounded bg-slate-700/60 px-1 py-0.5 font-mono text-[12px] text-emerald-200" {...rest}>
        {children}
      </code>
    ) : (
      <code className={`block ${className ?? ''}`} {...rest}>
        {children}
      </code>
    ),
  pre: (p: any) => (
    <pre
      className="my-2 overflow-x-auto rounded-lg bg-slate-950/80 p-3 font-mono text-[12px] leading-relaxed text-slate-100 ring-1 ring-slate-800"
      {...p}
    />
  ),
  table: (p: any) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-[12px]" {...p} />
    </div>
  ),
  thead: (p: any) => <thead className="border-b border-slate-700 text-slate-300" {...p} />,
  th: (p: any) => <th className="px-2 py-1 text-left font-medium" {...p} />,
  td: (p: any) => <td className="border-b border-slate-800 px-2 py-1" {...p} />,
  a: (p: any) => <a className="text-sky-300 underline hover:text-sky-200" target="_blank" rel="noreferrer" {...p} />,
  blockquote: (p: any) => (
    <blockquote className="my-2 border-l-2 border-slate-600 pl-3 text-slate-400" {...p} />
  ),
  hr: () => <hr className="my-3 border-slate-700" />,
  strong: (p: any) => <strong className="font-semibold text-slate-50" {...p} />,
  em: (p: any) => <em className="italic text-slate-200" {...p} />,
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  const fromBoss = message.role === 'boss';
  return (
    <div className={`flex w-full ${fromBoss ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        <div
          className={`mb-1 text-xs ${
            fromBoss ? 'text-right text-slate-400' : 'text-left text-emerald-400'
          }`}
        >
          {ROLE_LABEL[message.role]}
        </div>
        <div
          className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
            fromBoss
              ? 'whitespace-pre-wrap bg-sky-600 text-white'
              : 'bg-slate-800 text-slate-100 ring-1 ring-slate-700'
          }`}
        >
          {fromBoss ? (
            <>{message.text}</>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md as any}>
              {message.text}
            </ReactMarkdown>
          )}
          {message.streaming && (
            <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-emerald-400 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
