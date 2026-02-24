/** Cohere embedding model — override via COHERE_EMBED_MODEL env var */
export const model = process.env['COHERE_EMBED_MODEL'] || 'embed-v4.0';

/** Vector DB index name — override via VECTOR_DB_INDEX_NAME or legacy PINECONE_INDEX_NAME */
export const indexName =
  process.env['VECTOR_DB_INDEX_NAME'] ||
  process.env['PINECONE_INDEX_NAME'] ||
  'vision-rag';