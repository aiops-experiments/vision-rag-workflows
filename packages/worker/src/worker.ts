import { Worker, NativeConnection } from '@temporalio/worker';
import { searchSimilarVectors } from '../../shared-workflows/dist/activities/searchActivities';
import { embedImageAndStore } from '../../shared-workflows/dist/activities/imageActivities';
const TASK_QUEUE = 'vision-rag-queue';

async function run() {
  const address = process.env['TEMPORAL_ADDRESS']
    ? `${process.env['TEMPORAL_ADDRESS']}:7233`
    : (process.env['TEMPORAL_SERVER_URL'] || 'localhost:7233');

  const connection = await NativeConnection.connect({ address });

  const worker = await Worker.create({
    connection,
    activities: { searchSimilarVectors, embedImageAndStore },
    workflowsPath: require.resolve('@vision-rag/shared-workflows'),
    taskQueue: TASK_QUEUE,
    namespace: process.env['TEMPORAL_NAMESPACE'] || 'default',
  });

  console.log(`✅ Worker running on: ${TASK_QUEUE}`);
  await worker.run();
}

run().catch(console.error);
