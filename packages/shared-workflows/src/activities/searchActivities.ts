import { model, indexName } from '../utils/constants';
import { InternalServerError } from '../utils/types';
import { PineconeDbClient } from '../utils/pinecone';
import { AICohereClientV2 } from '../utils/cohere';
import { GoogleGenAIClient } from '../utils/gemini';

export interface SearchResult {
  id: string;
  score: number;
  gcsUrl?: string;
  metadata?: Record<string, any>;
  answer?: string;
}

// Activity: Search for similar vectors in Pinecone using query embedding
export async function searchSimilarVectors(
  query: string,
  namespace: string,
  userId: string,
  orgId: string,
  topK: number = 5
): Promise<{ results: SearchResult[], answer: string }> {
  try {
    console.log('[Activity] Starting vector search for query:', { 
      query, 
      namespace, 
      userId, 
      orgId, 
      topK 
    });

    // Generate embedding for the query using Cohere
    const response = await AICohereClientV2.embed({
      texts: [query],
      model: model,
      inputType: 'search_query',
      embeddingTypes: ['float'],
      outputDimension: 1536
    });

    console.log('[Activity] Response:', response);

    // Extract embedding from response
    let queryEmbedding: number[] | undefined;
    if (Array.isArray(response.embeddings)) {
      // Case: number[][]
      queryEmbedding = response.embeddings;
    } else if (response.embeddings && Array.isArray(response.embeddings.float)) {
      // Case: { float: number[][] }
      queryEmbedding = response.embeddings.float[0];
    }

    if (!queryEmbedding) {
      throw new InternalServerError('No embeddings generated from Cohere for search query');
    }

    // Search in Pinecone
    const index = PineconeDbClient.index(indexName);
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: topK,
      filter: {
        userId: userId,
        orgId: orgId,
      },
      includeMetadata: true
    });

    // Format results
    const results: SearchResult[] = searchResults.matches?.map(match => ({
      id: match.id || '',
      score: match.score || 0,
      gcsUrl: match.metadata?.['gcsUrl'] as string,
      metadata: match.metadata || {}
    })) || [];

    console.log('[Activity] Search completed successfully:', { 
      resultsCount: results.length,
      topScore: results[0]?.score || 0
    });

    const prompt = `
    Extract the financial data from this image into a structured humanily interactive chat. 

      Rules:
      1. ABSOLUTE VALUES ONLY: Even if a number is in parentheses like "(141)" or "(38)", you MUST extract it as a positive number (e.g., 141, 38). Do not include negative signs.
      2. Treat hyphens "-" or "N/A" as 0.
      3. Map the columns strictly as follows: [AdRise, Data Product, Data Science, Research & Development, Total].
      4. Ensure the "Category" matches the row labels on the left.
      5. Provide the output in valid humanily interactive chat format.
      The question is: ${query}
    `;

    const reasoningResponse = await new GoogleGenAIClient('gemini-2.5-pro', 'fox-et-video-intel-dev', 'us-west4').runModelWithObject(results[0].gcsUrl!, prompt);
    console.log('[Activity] Reasoning response:', reasoningResponse);
    return { results, answer: reasoningResponse as unknown as string };

  } catch (error) {
    console.error('[Activity] Vector search error:', error);
    throw new InternalServerError('Failed to search for similar vectors');
  }
}