'use client';

import { Message } from '@/types';

interface Config {
  namespace: string;
  userId: string;
  orgId: string;
}

interface Props {
  messages: Message[];
  config: Config;
  onConfigChange: (c: Config) => void;
  onNewChat: () => void;
  onUpload: () => void;
}

export default function Sidebar({ messages, onNewChat, onUpload }: Props) {
  const userMessages = messages.filter((m) => m.role === 'user');

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-eden-bg-deep border-r border-eden-border h-full">
      {/* Logo / brand */}
      <div className="flex items-center justify-center px-5 py-6 border-b border-eden-border-dim">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 29"
          className="h-12 w-auto text-eden-accent">
          <g fill="currentColor" fillRule="evenodd">
            <path d="M0 0v29h8.18l-.021-9.375h8.03v-7.912H8.226V7.929H18L17.463 0z" />
            <path d="M57.98 0l-3.519 6.261L51.01 0h-9.518l8.323 13.998L41 28.983l9.251.017 4.097-7.348 4.149 7.331H68l-8.978-15.082L67.181 0z" />
            <path d="M31.04 22.089a2.376 2.376 0 0 1-2.377-2.376l.003-11.47c0-1.311 1.061-2.485 2.374-2.485 1.311 0 2.478 1.174 2.478 2.486v11.502c0 1.313-1.167 2.343-2.479 2.343M31 0c-7.732 0-14 6.268-14 14s6.268 14 14 14 14-6.268 14-14S38.733 0 31 0" />
          </g>
        </svg>
      </div>

      {/* Actions */}
      <div className="px-3 pt-4 flex flex-col gap-2">
        <button
          onClick={onNewChat}
          className="btn-eden btn-eden-primary w-full px-3 py-2.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>

        <button
          onClick={onUpload}
          className="btn-eden btn-eden-secondary w-full px-3 py-2.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Embed Document
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-3 pt-5">
        <p className="text-xs text-eden-text-muted uppercase tracking-wider px-2 mb-2 font-medium">
          Conversations
        </p>
        {userMessages.length === 0 ? (
          <p className="text-xs text-eden-text-muted px-2 py-3">No conversations yet</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {userMessages.slice(-20).reverse().map((m) => (
              <li
                key={m.id}
                className="px-3 py-2 rounded-lg text-eden-text-secondary text-xs truncate
                           hover:bg-eden-bg-card hover:text-eden-text-primary cursor-default transition-colors"
                title={m.content}
              >
                <span className="text-eden-text-muted font-mono mr-1.5">
                  {m.id.slice(0, 6)}
                </span>
                {m.content}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
