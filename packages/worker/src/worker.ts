import { Worker, NativeConnection } from '@temporalio/worker';
import { searchSimilarVectors } from '../../shared-workflows/dist/activities/searchActivities';
import { embedImageAndStoreInPinecone } from '../../shared-workflows/dist/activities/imageActivities';
const TASK_QUEUE = 'vision-rag-queue';

async function run() {
  const connection = await NativeConnection.connect({ address: `${process.env['TEMPORAL_ADDRESS']}:7233` });

  const worker = await Worker.create({
    connection,
    activities: { searchSimilarVectors, embedImageAndStoreInPinecone },
    workflowsPath: require.resolve('@vision-rag/shared-workflows'),
    taskQueue: TASK_QUEUE,
    namespace: 'default',
  });

  console.log(`✅ Worker running on: ${TASK_QUEUE}`);
  await worker.run();
}

run().catch(console.error);
