'use client';

import { useState } from 'react';
import { ImageResult } from '@/types';

interface Props {
  images: ImageResult[];
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    score >= 0.85
      ? 'bg-eden-accent text-eden-bg-deep'
      : score >= 0.65
      ? 'bg-eden-text-secondary text-eden-bg-deep'
      : 'bg-eden-border text-eden-text-secondary';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

function ImageCard({ result, onClick }: { result: ImageResult; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden border border-eden-border-dim hover:border-eden-accent
                 transition-all duration-200 bg-eden-bg-card aspect-[4/3] w-full eden-hover-ready
                 hover:shadow-[0_0_16px_rgba(209,213,219,0.08)]
                 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
    >
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-eden-border border-t-eden-accent rounded-full animate-spin" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-eden-text-muted">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5
                 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M6.75 19.5h10.5a2.25
                 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 17.25 4.5H6.75A2.25 2.25
                 0 0 0 4.5 6.75v10.5A2.25 2.25 0 0 0 6.75 19.5Z" />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={result.imageUrl}
          alt={`Result ${result.id}`}
          className={`w-full h-full object-cover transition-transform duration-300
                      group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      <div className="absolute bottom-2 right-2">
        <ScoreBadge score={result.score} />
      </div>
    </button>
  );
}

export default function ImageGallery({ images }: Props) {
  const [lightbox, setLightbox] = useState<ImageResult | null>(null);

  if (!images.length) return null;

  return (
    <>
      <div className="mt-4">
        <p className="text-xs text-eden-text-muted mb-3 uppercase tracking-wider font-medium">
          Related Images — {images.length} result{images.length !== 1 ? 's' : ''}
        </p>
        <div
          className={`grid gap-3 ${
            images.length === 1
              ? 'grid-cols-1 max-w-sm'
              : images.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {images.map((img) => (
            <ImageCard key={img.id} result={img} onClick={() => setLightbox(img)} />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] p-4 eden-glass rounded-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 text-eden-text-muted hover:text-eden-text-primary
                         transition-colors w-8 h-8 flex items-center justify-center
                         rounded-full bg-eden-bg-primary"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.imageUrl}
              alt="Full view"
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            <div className="mt-3 flex items-center gap-3">
              <ScoreBadge score={lightbox.score} />
              {lightbox.metadata && typeof lightbox.metadata === 'object' && 'createdAt' in lightbox.metadata && (
                <span className="text-xs text-eden-text-muted">
                  {new Date(String((lightbox.metadata as Record<string, unknown>)['createdAt'])).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
