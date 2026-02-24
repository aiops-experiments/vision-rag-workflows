import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vision RAG',
  description: 'Multimodal document search powered by Cohere embeddings and Temporal workflows',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </body>
    </html>
  );
}
