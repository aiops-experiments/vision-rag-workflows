import { VectorDBProvider } from './VectorDBProvider';
import { PineconeVectorDBProvider } from './PineconeVectorDBProvider';

let _provider: VectorDBProvider | null = null;

/**
 * Returns a singleton VectorDB provider selected by the VECTOR_DB_PROVIDER env var.
 * Defaults to 'pinecone'. Adding a new provider: implement VectorDBProvider and add a case here.
 */
export function getVectorDBProvider(): VectorDBProvider {
  if (_provider) return _provider;

  const type = process.env['VECTOR_DB_PROVIDER'] || 'pinecone';

  switch (type) {
    case 'pinecone':
      _provider = new PineconeVectorDBProvider();
      break;
    default:
      throw new Error(
        `Unknown VECTOR_DB_PROVIDER "${type}". Supported values: pinecone`,
      );
  }

  return _provider;
}

export type { VectorDBProvider, VectorRecord, QueryResult } from './VectorDBProvider';
