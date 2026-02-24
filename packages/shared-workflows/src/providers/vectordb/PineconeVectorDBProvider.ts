import { Pinecone } from '@pinecone-database/pinecone';
import { VectorDBProvider, VectorRecord, QueryResult } from './VectorDBProvider';

export class PineconeVectorDBProvider implements VectorDBProvider {
  private client: Pinecone;

  constructor() {
    const apiKey = process.env['PINECONE_API_KEY'];
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    this.client = new Pinecone({ apiKey });
  }

  async upsert(indexName: string, vectors: VectorRecord[]): Promise<void> {
    const index = this.client.index(indexName);
    await index.upsert(vectors);
  }

  async query(
    indexName: string,
    vector: number[],
    filter: Record<string, unknown>,
    topK: number,
  ): Promise<QueryResult[]> {
    const index = this.client.index(indexName);
    const result = await index.query({
      vector,
      topK,
      filter,
      includeMetadata: true,
    });

    return (result.matches || []).map((match) => ({
      id: match.id || '',
      score: match.score || 0,
      metadata: (match.metadata as Record<string, unknown>) || {},
    }));
  }
}
