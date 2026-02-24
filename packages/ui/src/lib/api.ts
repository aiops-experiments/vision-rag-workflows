import { SearchPayload, EmbedImagePayload, EmbedPdfPayload } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function search(payload: SearchPayload) {
  const res = await fetch(`${BASE}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return json<{
    success: boolean;
    data: {
      results: { id: string; score: number; imageUrl?: string; metadata?: Record<string, unknown> }[];
      query: string;
      answer: string;
      namespace: string;
      totalResults: number;
    };
    message: string;
  }>(res);
}

export async function embedImage(payload: EmbedImagePayload) {
  const res = await fetch(`${BASE}/api/embed/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return json<{ success: boolean; data: { workflowId: string; imageUrl?: string; status: string }; message: string }>(res);
}

export async function embedPdf(payload: EmbedPdfPayload) {
  const form = new FormData();
  form.append('pdf', payload.file);
  form.append('namespace', payload.namespace);
  form.append('userId', payload.userId);
  form.append('orgId', payload.orgId);

  const res = await fetch(`${BASE}/api/embed/pdf`, { method: 'POST', body: form });
  return json<{ success: boolean; data: { workflowId: string; totalPages: number; status: string }; message: string }>(res);
}

export async function getWorkflowStatus(workflowId: string) {
  const res = await fetch(`${BASE}/api/embed/status/${workflowId}`);
  return json<{ success: boolean; data: { workflowId: string; status: string; result: unknown } }>(res);
}
