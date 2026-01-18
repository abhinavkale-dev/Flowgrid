import { prisma, WorkflowStatus } from "@repo/prisma";
import { findRunnableNodes } from "./nodeResolver.js";
import { executeNode } from "./nodeExecutor.js";
import { acquireLock, releaseLock } from "./lockManager.js";


const WORKER_ID = `worker-${process.pid}-${Date.now()}`;

export async function executeWorkflow(workflowRunId: string): Promise<void> {
    const lockAcquired = await acquireLock(workflowRunId, WORKER_ID);

    if(!lockAcquired) {
        console.log(`Workflow run ${workflowRunId} is already being executed by another worker`);
        return;
    }

    console.log(`Lock acquired for workflow run ${workflowRunId}`);

    try {
        const workflowRun = await prisma.workflowRun.findUnique({
            where: { id: workflowRunId },
            include: {
                workflow: true,
                nodeRuns: true
            }
        });

        if(!workflowRun) {
            throw new Error(`Workflow run ${workflowRunId} not found`);
        }
        
        const nodes = workflowRun.workflow.nodes as WorkflowNode[];
        const edges = workflowRun.workflow.edges as WorkflowEdge[];

        console.log(`Starting execution of workflow run ${workflowRunId}`);
        console.log(`Workflow has ${nodes.length} nodes and ${edges.length} edges`);
    } catch (error) {
        
    }
}