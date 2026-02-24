'use client';

import { Message as TMessage } from '@/types';
import ImageGallery from './ImageGallery';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-eden-accent"
          style={{ animation: `pulseDot 1.4s ease-in-out ${i * 0.16}s infinite` }}
        />
      ))}
    </div>
  );
}

export default function Message({ msg }: { msg: TMessage }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 w-full animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-eden-accent/15 border border-eden-accent/30 flex items-center justify-center mt-1 text-eden-accent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-eden-bg-card text-eden-text-primary rounded-tr-sm'
              : 'eden-glass text-eden-text-secondary rounded-tl-sm'
          }`}
        >
          {msg.loading ? (
            <TypingIndicator />
          ) : (
            <div
              className={isUser ? '' : 'prose-eden'}
              dangerouslySetInnerHTML={
                isUser ? undefined : { __html: renderMarkdown(msg.content) }
              }
            >
              {isUser ? msg.content : null}
            </div>
          )}
        </div>

        {/* Image gallery below assistant message */}
        {!isUser && !msg.loading && msg.images && msg.images.length > 0 && (
          <div className="w-full max-w-2xl">
            <ImageGallery images={msg.images} />
          </div>
        )}

        {/* Timestamp */}
        {!msg.loading && (
          <span className="text-xs text-eden-text-muted px-1">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-eden-border flex items-center justify-center mt-1 text-xs text-eden-text-secondary font-medium">
          U
        </div>
      )}
    </div>
  );
}

/** Very lightweight markdown renderer — no external deps */
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold/italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // bullet lists (simplified)
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    // numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // paragraphs: double newline
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupoli])(.+)$/gm, '$1')
    .trim();
}
