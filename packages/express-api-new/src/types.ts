// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Workflow input types
export interface ImageEmbedRequest {
  imageUrl: string;
  namespace: string;
  userId: string;
  orgId: string;
}

export interface PdfEmbedRequest {
  namespace: string;
  userId: string;
  orgId: string;
  file: Express.Multer.File;
}

export interface SearchRequest {
  query: string;
  namespace: string;
  userId: string;
  orgId: string;
  topK?: number;
}

// Response types
export interface EmbedResponse {
  workflowId: string;
  /** Protocol URL: gs:// or s3:// */
  storageUrl?: string;
  /** Public HTTP URL for browser rendering */
  imageUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  totalPages?: number;
}

export interface SearchResult {
  id: string;
  score: number;
  /** Public HTTP URL for browser image rendering */
  imageUrl?: string;
  metadata: {
    storageUrl?: string;
    imageUrl?: string;
    pageNumber?: number;
    type?: string;
    createdAt?: string;
    [key: string]: unknown;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  answer: string;
  namespace: string;
  totalResults: number;
}

export interface WorkflowStatusResponse {
  workflowId: string;
  status: string;
  result?: unknown;
}

// Error class for internal server errors
export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}
