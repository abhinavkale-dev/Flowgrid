import { NodeStatus, prisma, WorkflowStatus } from "@repo/prisma";
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
        console.log(`Workflow has ${nodes.length} nodes and ${edges.length} edges brroo`);

        let iteration = 0;
        const MAX_ITERATIONS = 1001;

        while(iteration < MAX_ITERATIONS) {
            iteration++;

            const currentNodeRuns = await prisma.nodeRun.findMany({
                where: { workflowRunId }
            });

            const runnableNodes = findRunnableNodes(nodes, edges, currentNodeRuns);

            console.log(`Iteration ${iteration}: Found ${runnableNodes.length} runnable nodes`);

            if(runnableNodes.length === 0) {
                console.log('No runnable nodes here. Execution is complete my boyy.')
                break;
            }

            for(const node of runnableNodes) {
                console.log(`Executing node ${node.id} in iteration ${iteration} of type ${node.type}`);
                
                try {
                    await executeNode(workflowRunId, node, currentNodeRuns);
                    console.log(`Node ${node.id} executed successfully in iteration ${iteration}`);
                } catch (error) {
                    console.error(`Error executing node ${node.id} failed`, error);
                }
            }
        }

        if(iteration >= MAX_ITERATIONS) {
            throw new Error(`Max iterations reached. Execution is incomplete. Brroo! (${MAX_ITERATIONS})`);
        }

        const finalNodeRuns = await prisma.nodeRun.findMany({
            where: { workflowRunId }
        });

        const hasFailedNodes = finalNodeRuns.some(run => run.status === NodeStatus.Failed);
        const finalStatus = hasFailedNodes ? WorkflowStatus.Error : WorkflowStatus.Complete;

        await prisma.workflowRun.update({
            where: { id: workflowRunId },
            data: {
                status: finalStatus,
                finishedAt: new Date()
            }
        });

        console.log(`Workflow run ${workflowRunId} completed with status ${finalStatus}`);

    } catch (error) {
        console.error(`Error executing workflow run ${workflowRunId}:`, error);

        await prisma.workflowRun.update({
            where: { id: workflowRunId },
            data: {
                status: WorkflowStatus.Error,
                finishedAt: new Date(),
                errorMetadata: {
                    message: error instanceof Error ? error.message : 'Unknown error'
                },
                finishedAt: new Date()
            }
        });

        throw error;
    }

    finally {
        await releaseLock(workflowRunId);
        console.log(`Lock released for workflow run ${workflowRunId}`);
    }
}