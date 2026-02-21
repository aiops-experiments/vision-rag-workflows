import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from './activities/searchActivities';

const { searchSimilarVectors } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 2,
    initialInterval: '3s',
  },
});

export interface SearchWorkflowInput {
  query: string;
  namespace: string;
  userId: string;
  orgId: string;
  topK?: number;
}

export interface SearchWorkflowResult {
  results: activities.SearchResult[];
  query: string;
  totalResults: number;
  answer: string;
}

export async function SearchWorkflow(input: SearchWorkflowInput): Promise<SearchWorkflowResult> {
  log.info('[SearchWorkflow] Starting search workflow...', {
    query: input.query,
    namespace: input.namespace,
    userId: input.userId,
    orgId: input.orgId,
    topK: input.topK || 5
  });

  try {
    const results = await searchSimilarVectors(
      input.query,
      input.namespace,
      input.userId,
      input.orgId,
      input.topK || 5
    );

    log.info('[SearchWorkflow] Search completed successfully', {
      resultsCount: results.results.length,
      topScore: results.results[0]?.score || 0
    });

    return {
      results: results.results,
      query: input.query,
      totalResults: results.results.length,
      answer: results.answer || '',
    };
  } catch (error) {
    log.error('[SearchWorkflow] Failed to complete search', { error });
    throw error;
  }
}