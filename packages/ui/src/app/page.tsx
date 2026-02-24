'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { Message, ImageResult } from '@/types';
import { search } from '@/lib/api';
import MessageComponent from '@/components/Message';
import InputBar from '@/components/InputBar';
import Sidebar from '@/components/Sidebar';
import UploadModal from '@/components/UploadModal';

interface Config {
  namespace: string;
  userId: string;
  orgId: string;
}

const DEFAULT_CONFIG: Config = {
  namespace: 'default',
  userId: 'user-123',
  orgId: 'org-456',
};

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
      {/* Search icon */}
      <div className="w-16 h-16 rounded-2xl bg-eden-accent/15 border border-eden-accent/30
                      flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#c9a882" strokeWidth="1.8">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <div>
        <h1 className="text-white text-2xl font-semibold mb-2">Vision RAG</h1>
        <p className="text-eden-text-secondary text-sm max-w-sm leading-relaxed">
          Ask questions about your documents. Results include the relevant pages as
          images alongside a structured AI-generated answer.
        </p>
      </div>

      {/* Hint chips */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {[
          'What are the Q2 revenue figures?',
          'Show me the cost breakdown',
          'What trends appear in this data?',
          'Summarise the key metrics',
        ].map((hint) => (
          <div
            key={hint}
            className="px-4 py-3 rounded-xl border border-eden-border bg-eden-bg-card
                       text-eden-text-secondary text-xs text-left leading-relaxed
                       hover:border-eden-accent/60 hover:text-white cursor-default transition-all"
          >
            {hint}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadToast, setUploadToast] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(query: string) {
    const userMsg: Message = { id: uuid(), role: 'user', content: query, timestamp: Date.now() };
    const loadingMsg: Message = { id: uuid(), role: 'assistant', content: '', loading: true, timestamp: Date.now() };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const res = await search({
        query,
        namespace: config.namespace,
        userId: config.userId,
        orgId: config.orgId,
        topK: 5,
      });

      const images: ImageResult[] = res.data.results
        .filter((r) => r.imageUrl)
        .map((r) => ({ id: r.id, score: r.score, imageUrl: r.imageUrl, metadata: r.metadata }));

      const assistantMsg: Message = {
        id: uuid(),
        role: 'assistant',
        content: res.data.answer || `Found ${res.data.totalResults} results.`,
        images,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev.slice(0, -1), assistantMsg]);
    } catch (err: unknown) {
      const errorMsg: Message = {
        id: uuid(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Search failed. Is the API running?'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleUploadSuccess(msg: string) {
    setShowUpload(false);
    setUploadToast(msg);
    setTimeout(() => setUploadToast(''), 4000);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-eden-bg-primary text-white">
      <Sidebar
        messages={messages}
        config={config}
        onConfigChange={setConfig}
        onNewChat={() => setMessages([])}
        onUpload={() => setShowUpload(true)}
      />

      {/* Main chat */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-eden-border-dim flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-eden-text-muted">namespace:</span>
            <span className="text-sm text-eden-accent font-medium">{config.namespace}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-eden-accent animate-pulse" />
            <span className="text-xs text-eden-text-muted">
              {messages.length > 0
                ? `${messages.filter((m) => m.role === 'user').length} queries`
                : 'Ready'}
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
              {messages.map((msg) => (
                <MessageComponent key={msg.id} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <InputBar onSend={handleSend} disabled={loading} onUpload={() => setShowUpload(true)} />
      </main>

      {showUpload && (
        <UploadModal
          config={config}
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Toast */}
      {uploadToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up
                        bg-eden-bg-card border border-eden-accent/30 text-eden-accent
                        text-sm px-5 py-3 rounded-2xl shadow-xl">
          ✓ {uploadToast}
        </div>
      )}
    </div>
  );
}
