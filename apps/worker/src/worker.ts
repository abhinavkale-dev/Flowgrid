import { Worker } from 'bullmq';
import { executeWorkflow } from './engine/executor.js';
import type { WorkflowJobData } from '@repo/shared';

const WORKER_ID = `worker-${process.pid}`;

export const worker = new Worker<WorkflowJobData>(
    'workflow-runs',
    async(job) => {
        console.log(`[${WORKER_ID}] Processing job ${job.id}: workflow run ${job.data.workflowRunId}`);

        try {
            await executeWorkflow(job.data.workflowRunId);
            console.log(`[${WORKER_ID}] Completed job ${job.id}`);
        } catch (error) {
            console.error(`[${WORKER_ID}] Job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: null,
        },
        concurrency: 5,
        autorun: false,
    }
);

worker.on('completed', (job) => {
    console.log(`[${WORKER_ID}] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`[${WORKER_ID}] Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
    console.error(`[${WORKER_ID}] Worker error:`, err);
});
