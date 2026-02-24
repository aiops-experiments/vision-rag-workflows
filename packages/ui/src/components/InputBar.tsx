'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface Props {
  onSend: (query: string) => void;
  disabled?: boolean;
  onUpload: () => void;
}

export default function InputBar({ onSend, disabled, onUpload }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function send() {
    const q = value.trim();
    if (!q || disabled) return;
    onSend(q);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  return (
    <div className="px-4 pb-5 pt-3 border-t border-eden-border-dim bg-eden-bg-primary">
      <div className="max-w-3xl mx-auto">
        <div
          className="flex items-end gap-3 bg-eden-bg-input border border-eden-border
                     rounded-2xl px-4 py-3 focus-within:border-eden-accent
                     focus-within:shadow-[0_0_12px_rgba(209,213,219,0.1)]
                     transition-all duration-200"
        >
          {/* Upload button */}
          <button
            type="button"
            onClick={onUpload}
            disabled={disabled}
            title="Embed document"
            className="btn-eden-icon-secondary flex-shrink-0 w-9 h-9 flex items-center justify-center mb-0.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => { setValue(e.target.value); handleInput(); }}
            onKeyDown={handleKey}
            placeholder="Ask anything about your documents..."
            className="flex-1 bg-transparent text-eden-text-primary placeholder-eden-text-muted text-sm
                       outline-none resize-none leading-relaxed max-h-48 overflow-y-auto
                       disabled:opacity-50"
            style={{ minHeight: '24px' }}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={send}
            disabled={disabled || !value.trim()}
            className="btn-eden-icon-primary flex-shrink-0 w-9 h-9 flex items-center justify-center mb-0.5"
          >
            {disabled ? (
              <div className="w-4 h-4 border-2 border-eden-text-primary/40 border-t-eden-text-primary rounded-full animate-spin" />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 7.374 7.374 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-eden-text-muted mt-2">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
