'use client';

import { useState, useRef, useCallback } from 'react';
import { embedImage, embedPdf } from '@/lib/api';

interface Config {
  namespace: string;
  userId: string;
  orgId: string;
}

interface Props {
  config: Config;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

type Tab = 'image' | 'pdf';
type Status = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export default function UploadModal({ config, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>('pdf');
  const [imageUrl, setImageUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') setPdfFile(file);
  }, []);

  async function handleSubmit() {
    setStatus('uploading');
    try {
      if (tab === 'image') {
        setStatusMsg('Uploading image...');
        const res = await embedImage({ imageUrl, ...config });
        setStatusMsg(`Embedding started — workflow ${res.data.workflowId.slice(-8)}`);
      } else if (pdfFile) {
        setStatusMsg(`Uploading ${pdfFile.name}...`);
        const res = await embedPdf({ file: pdfFile, ...config });
        setStatusMsg(`Processing ${res.data.totalPages} page(s) — workflow ${res.data.workflowId.slice(-8)}`);
      }
      setStatus('processing');
      setTimeout(() => { setStatus('done'); onSuccess(statusMsg); }, 800);
    } catch (err: unknown) {
      setStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  const canSubmit =
    status === 'idle' &&
    ((tab === 'image' && imageUrl.length > 5) || (tab === 'pdf' && !!pdfFile));

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md eden-glass rounded-2xl
                   p-6 flex flex-col gap-5 animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-eden-text-primary font-semibold text-lg">Embed Document</h2>
          <button
            onClick={onClose}
            className="btn-eden btn-eden-secondary w-7 h-7 flex items-center justify-center
                       text-xs !px-0 !py-0"
          >
            ✕
          </button>
        </div>

        {/* Tabs — segmented style */}
        <div className="flex gap-1.5 bg-eden-bg-deep rounded-xl p-1">
          {(['pdf', 'image'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`btn-eden flex-1 py-2 text-sm ${
                tab === t ? 'btn-eden-primary' : 'btn-eden-secondary'
              }`}
            >
              {t === 'pdf' ? '📄 PDF' : '🖼 Image URL'}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'image' ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-eden-text-muted uppercase tracking-wider">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-eden-bg-input border border-eden-border rounded-xl px-4 py-3
                         text-eden-text-primary placeholder-eden-text-muted text-sm outline-none
                         focus:border-eden-accent transition-colors"
            />
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
                        py-10 cursor-pointer transition-all ${
                          dragging
                            ? 'border-eden-accent bg-eden-accent/5'
                            : pdfFile
                            ? 'border-eden-accent/50 bg-eden-bg-primary'
                            : 'border-eden-border hover:border-eden-accent/40 bg-eden-bg-primary'
                        }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setPdfFile(e.target.files[0])}
            />
            {pdfFile ? (
              <>
                <span className="text-3xl">📄</span>
                <span className="text-sm text-eden-text-primary font-medium">{pdfFile.name}</span>
                <span className="text-xs text-eden-text-muted">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl">⬆</span>
                <span className="text-sm text-eden-text-secondary">Drop PDF here or click to browse</span>
                <span className="text-xs text-eden-text-muted">Max 50 MB</span>
              </>
            )}
          </div>
        )}

        {/* Status */}
        {status !== 'idle' && (
          <div
            className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
              status === 'error'
                ? 'bg-red-900/30 text-red-300 border border-red-800'
                : status === 'done'
                ? 'bg-eden-accent/10 text-eden-accent border border-eden-accent/20'
                : 'bg-eden-bg-primary text-eden-text-secondary'
            }`}
          >
            {status === 'uploading' || status === 'processing' ? (
              <div className="w-4 h-4 border-2 border-eden-border border-t-eden-accent rounded-full animate-spin" />
            ) : status === 'done' ? '✓' : '✗'}
            {statusMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-eden btn-eden-secondary flex-1 py-3">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-eden btn-eden-primary flex-1 py-3"
          >
            Embed
          </button>
        </div>
      </div>
    </div>
  );
}
