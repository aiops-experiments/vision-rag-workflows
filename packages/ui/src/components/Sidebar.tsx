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

export default function Sidebar({ messages, config, onConfigChange, onNewChat, onUpload }: Props) {
  const userMessages = messages.filter((m) => m.role === 'user');

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-eden-bg-deep border-r border-eden-border h-full">
      {/* Logo / brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-eden-border-dim">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
          style={{
            background: 'linear-gradient(to bottom, #d4b490, #c09470)',
            border: '1px solid #9a7448',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 3px rgba(0,0,0,0.28)',
          }}
        >
          V
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">Vision RAG</p>
          <p className="text-eden-text-muted text-xs mt-0.5">Multimodal Search</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pt-4 flex flex-col gap-2">
        {/* Primary — macOS dusty brown */}
        <button
          onClick={onNewChat}
          className="btn-macos btn-macos-primary w-full px-3 py-2.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>

        {/* Secondary — white/cream */}
        <button
          onClick={onUpload}
          className="btn-macos btn-macos-secondary w-full px-3 py-2.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Embed Document
        </button>
      </div>

      {/* Recent searches */}
      {userMessages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-3 pt-5">
          <p className="text-xs text-eden-text-muted uppercase tracking-wider px-2 mb-2 font-medium">
            This session
          </p>
          <ul className="flex flex-col gap-1">
            {userMessages.slice(-12).reverse().map((m) => (
              <li
                key={m.id}
                className="px-3 py-2 rounded-lg text-eden-text-secondary text-xs truncate
                           hover:bg-eden-bg-card hover:text-white cursor-default transition-colors"
                title={m.content}
              >
                {m.content}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Config panel */}
      <div className="px-3 py-4 border-t border-eden-border-dim space-y-3">
        <p className="text-xs text-eden-text-muted uppercase tracking-wider px-1 font-medium">Context</p>
        {(
          [
            { key: 'namespace', label: 'Namespace', placeholder: 'default' },
            { key: 'userId',    label: 'User ID',   placeholder: 'user-123' },
            { key: 'orgId',     label: 'Org ID',    placeholder: 'org-456' },
          ] as { key: keyof Config; label: string; placeholder: string }[]
        ).map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-eden-text-muted block mb-1">{label}</label>
            <input
              value={config[key]}
              onChange={(e) => onConfigChange({ ...config, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full bg-eden-bg-input border border-eden-border-dim rounded-lg px-3 py-2
                         text-white text-xs outline-none focus:border-eden-accent transition-colors
                         placeholder-eden-text-muted"
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
