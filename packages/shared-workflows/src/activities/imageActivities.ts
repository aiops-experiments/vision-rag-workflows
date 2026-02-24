import { AICohereClientV2 } from '../utils/cohere';
import { getVectorDBProvider } from '../providers/vectordb';
import { InternalServerError } from '../utils/types';

/**
 * Activity: Embed an image (base64) via Cohere and store the vector in the
 * configured vector DB provider (default: Pinecone).
 *
 * @param base64      - base64 data URI of the image
 * @param storageUrl  - Protocol URL for backend use (gs:// or s3://)
 * @param imageUrl    - Public HTTP URL served to the browser
 * @param userId      - Owner user ID
 * @param namespace   - Logical namespace / collection
 * @param orgId       - Organisation ID
 */
export async function embedImageAndStore(
  base64: string,
  storageUrl: string,
  imageUrl: string,
  userId: string,
  namespace: string,
  orgId: string,
): Promise<void> {
  const indexName =
    process.env['VECTOR_DB_INDEX_NAME'] ||
    process.env['PINECONE_INDEX_NAME'] ||
    'vision-rag';

  console.log('[imageActivity] Embedding image', { storageUrl, userId, namespace, orgId });

  const response = await AICohereClientV2.embed({
    images: [base64],
    model: process.env['COHERE_EMBED_MODEL'] || 'embed-v4.0',
    inputType: 'image',
    embeddingTypes: ['float'],
    outputDimension: 1536,
  });

  let embedding: number[] | undefined;
  if (Array.isArray(response.embeddings)) {
    embedding = response.embeddings[0];
  } else if (response.embeddings && Array.isArray(response.embeddings.float)) {
    embedding = response.embeddings.float[0];
  }

  if (
    !embedding ||
    !Array.isArray(embedding) ||
    embedding.length === 0 ||
    embedding.some((v) => typeof v !== 'number' || isNaN(v))
  ) {
    throw new InternalServerError('Embedding is empty or malformed');
  }

  const vectorDB = getVectorDBProvider();
  await vectorDB.upsert(indexName, [
    {
      id: `${orgId}-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      values: embedding,
      metadata: {
        namespace,
        userId,
        orgId,
        storageUrl,
        imageUrl,
        type: 'image',
        createdAt: new Date().toISOString(),
      },
    },
  ]);

  console.log('[imageActivity] Upserted vector to', process.env['VECTOR_DB_PROVIDER'] || 'pinecone');
}
