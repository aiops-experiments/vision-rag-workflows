export interface ImageResult {
  id: string;
  score: number;
  /** Public HTTP URL — rendered directly in <img> */
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  images?: ImageResult[];
  loading?: boolean;
  timestamp: number;
}

export interface SearchPayload {
  query: string;
  namespace: string;
  userId: string;
  orgId: string;
  topK: number;
}

export interface EmbedImagePayload {
  imageUrl: string;
  namespace: string;
  userId: string;
  orgId: string;
}

export interface EmbedPdfPayload {
  file: File;
  namespace: string;
  userId: string;
  orgId: string;
}
