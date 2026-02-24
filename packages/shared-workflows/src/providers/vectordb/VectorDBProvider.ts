export interface VectorRecord {
  id: string;
  values: number[];
  metadata: Record<string, unknown>;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface VectorDBProvider {
  upsert(indexName: string, vectors: VectorRecord[]): Promise<void>;
  query(
    indexName: string,
    vector: number[],
    filter: Record<string, unknown>,
    topK: number,
  ): Promise<QueryResult[]>;
}
