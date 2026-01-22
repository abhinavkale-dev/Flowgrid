import 'dotenv/config';
import { worker } from './worker.js';

const WORKER_ID = `worker-${process.pid}-${Date.now()}`;

console.log('Flowfrid Worker Starting...');
console.log('Worker ID:', WORKER_ID);
console.log(`Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`);

worker.run();

console.log('Worker started and ready to process workflow runs');

process.on('SIGINT', async () => {
    console.log('Worker shutting down...');
    await worker.close();
    console.log('Worker gracefully stopped');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Worker shutting down...');
    await worker.close();
    console.log('Worker gracefully stopped');
    process.exit(0);
});