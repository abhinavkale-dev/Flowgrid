import { Queue } from 'bullmq'
import type { QueueOptions } from 'bullmq'

const queueOptions: QueueOptions = {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: null,
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {count: 100, age: 24 * 3600},
        removeOnFail: {count: 100, age: 24 * 3600},
    }
};

export const workflowQueue = new Queue('workflow-runs', queueOptions);

export interface WorkflowJobData {
    workflowRunId: string;
}