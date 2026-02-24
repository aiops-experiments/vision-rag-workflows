import { Client, WorkflowHandle } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';
import { ImageEmbedWorkflow, SearchWorkflow } from '@vision-rag/shared-workflows';

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

export interface PdfEmbedWorkflowInput {
  pages: {
    storageUrl: string;
    imageUrl: string;
    base64: string;
    userId: string;
    namespace: string;
    orgId: string;
    pageNumber: number;
  }[];
}

export interface SearchWorkflowInput {
  query: string;
  namespace: string;
  userId: string;
  orgId: string;
  topK?: number;
}

export interface SearchWorkflowResult {
  results: {
    id: string;
    score: number;
    /** Protocol URL: gs:// or s3:// */
    storageUrl?: string;
    /** Public HTTP URL for browser rendering */
    imageUrl?: string;
    metadata?: Record<string, unknown>;
  }[];
  query: string;
  answer: string;
  totalResults: number;
}

export class TemporalService {
  private client: Client | null = null;
  private readonly taskQueue = 'vision-rag-queue';

  async getClient(namespace?: string): Promise<Client> {
    if (!this.client) {
      const address =
        process.env['TEMPORAL_SERVER_URL'] || 'localhost:7233';
      const connection = await NativeConnection.connect({ address });
      this.client = new Client({
        connection,
        namespace: namespace || process.env['TEMPORAL_NAMESPACE'] || 'default',
      });
    }
    return this.client;
  }

  async startImageEmbedWorkflow(
    input: ImageEmbedWorkflowInput,
  ): Promise<WorkflowHandle> {
    const client = await this.getClient(input.namespace);
    return client.workflow.start(ImageEmbedWorkflow, {
      args: [input],
      taskQueue: this.taskQueue,
      workflowId: `image-embed-${input.userId}-${input.orgId}-${Date.now()}`,
    });
  }

  async startPdfEmbedWorkflow(
    input: PdfEmbedWorkflowInput,
  ): Promise<WorkflowHandle> {
    const client = await this.getClient();
    return client.workflow.start('PdfEmbedWorkflow', {
      args: [input],
      taskQueue: this.taskQueue,
      workflowId: `pdf-embed-${input.pages[0]?.userId}-${input.pages[0]?.orgId}-${Date.now()}`,
    });
  }

  async startSearchWorkflow(
    input: SearchWorkflowInput,
  ): Promise<SearchWorkflowResult> {
    const client = await this.getClient();
    const handle = await client.workflow.start(SearchWorkflow, {
      args: [input],
      taskQueue: this.taskQueue,
      workflowId: `search-${input.userId}-${input.orgId}-${Date.now()}`,
    });
    return await handle.result();
  }

  async getWorkflowResult(workflowId: string): Promise<unknown> {
    const client = await this.getClient();
    const handle = client.workflow.getHandle(workflowId);
    return await handle.result();
  }

  async getWorkflowStatus(workflowId: string): Promise<unknown> {
    const client = await this.getClient();
    const handle = client.workflow.getHandle(workflowId);
    return await handle.describe();
  }
}

export const temporalService = new TemporalService();
