import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from './activities/imageActivities';

const { embedImageAndStore } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 2,
    initialInterval: '5s',
  },
});

export interface ImageEmbedWorkflowInput {
  /** Protocol URL: gs:// or s3:// */
  storageUrl: string;
  /** Public HTTP URL for browser rendering */
  imageUrl: string;
  base64: string;
  userId: string;
  namespace: string;
  orgId: string;
}

export async function ImageEmbedWorkflow(
  input: ImageEmbedWorkflowInput,
): Promise<string> {
  log.info('[ImageEmbedWorkflow] Starting', {
    storageUrl: input.storageUrl,
    userId: input.userId,
    namespace: input.namespace,
    orgId: input.orgId,
  });

  try {
    await embedImageAndStore(
      input.base64,
      input.storageUrl,
      input.imageUrl,
      input.userId,
      input.namespace,
      input.orgId,
    );

    log.info('[ImageEmbedWorkflow] Completed — vector stored in vector DB');
    return 'Image successfully embedded and stored in vector DB.';
  } catch (error) {
    log.error('[ImageEmbedWorkflow] Failed to embed image', { error });
    throw error;
  }
}