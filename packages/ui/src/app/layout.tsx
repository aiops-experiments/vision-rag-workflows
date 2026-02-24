import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vision RAG',
  description: 'Multimodal document search powered by Cohere embeddings and Temporal workflows',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={inter.className}
        style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </body>
    </html>
  );
}
