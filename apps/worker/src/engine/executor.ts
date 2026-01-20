import { NodeStatus, prisma, WorkflowStatus } from "@repo/prisma";
import { findRunnableNodes } from "./nodeResolver.js";
import { executeNode } from "./nodeExecutor.js";
import { acquireLock, releaseLock } from "./lockManager.js";
import { parseWorkflowNodes, parseWorkflowEdges, type NodeRun } from "./types/index.js";

const WORKER_ID = `worker-${process.pid}-${Date.now()}`;

export async function executeWorkflow(workflowRunId: string): Promise<void> {
    const lockAcquired = await acquireLock(workflowRunId, WORKER_ID);

    if(!lockAcquired) {
        return;
    }

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
        
        const nodes = parseWorkflowNodes(workflowRun.workflow.nodes);
        const edges = parseWorkflowEdges(workflowRun.workflow.edges);

        console.log(`Starting execution of workflow run ${workflowRunId} (${nodes.length} nodes, ${edges.length} edges)`);

        let iteration = 0;
        const MAX_ITERATIONS = 1001;

        while(iteration < MAX_ITERATIONS) {
            iteration++;

            const currentNodeRuns = await prisma.nodeRun.findMany({
                where: { workflowRunId }
            });

            const nodeRunsMinimal: NodeRun[] = currentNodeRuns.map(run => ({
                id: run.id,
                nodeId: run.nodeId,
                status: run.status,
                retryCount: run.retryCount
            }));

            const runnableNodes = findRunnableNodes(nodes, edges, nodeRunsMinimal);

            if(runnableNodes.length === 0) {
                console.log(`Execution complete after ${iteration} iterations`);
                break;
            }

            console.log(`Iteration ${iteration}: Executing ${runnableNodes.length} node(s)`);

            for(const node of runnableNodes) {
                try {
                    await executeNode(workflowRunId, node, nodeRunsMinimal);
                } catch (error) {
                    console.error(`Node ${node.id} (${node.type}) failed:`, error);
                }
            }
        }

        if(iteration >= MAX_ITERATIONS) {
            throw new Error(`Maximum iterations (${MAX_ITERATIONS}) reached. Possible circular dependency.`);
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

    } catch (error) {
        console.error(`Workflow run ${workflowRunId} failed:`, error);

        await prisma.workflowRun.update({
            where: { id: workflowRunId },
            data: {
                status: WorkflowStatus.Error,
                finishedAt: new Date(),
                errorMetadata: {
                    message: error instanceof Error ? error.message : 'Unknown error'
                }
            }
        });

        throw error;
    }

    finally {
        await releaseLock(workflowRunId);
    }
}