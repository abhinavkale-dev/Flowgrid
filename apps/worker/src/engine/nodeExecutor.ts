import { prisma, NodeStatus } from "@repo/prisma";
import type { WorkflowNode, NodeRun, NodeExecutionOutput } from "./types.js";
import { executeDiscordNode, executeHTTPNode } from "../executors/index.js";

export async function executeNode(workflowRunId: string, node: WorkflowNode, existingNodeRuns: NodeRun[]): Promise<void> {
    let nodeRun = findNodeRunForNode(existingNodeRuns, node.id);

    if(nodeRun) {
        if(nodeRun.status === NodeStatus.Success) {
            return;
        }

        if(nodeRun.status === NodeStatus.Failed && nodeRun.retryCount >= 3) {
            throw new Error(`Node ${node.id} failed permanently after 3 retries`);
        }

        nodeRun = await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: {
                status: NodeStatus.Running,
                retryCount: nodeRun.retryCount + 1,
                startedAt: new Date()
            }
        }) as NodeRun;
    }

    else {
        nodeRun = await prisma.nodeRun.create({
            data: {
                workflowRunId,
                nodeId: node.id,
                nodeType: node.type,
                status: NodeStatus.Running,
                retryCount: 0,
                startedAt: new Date()
            }
        }) as NodeRun;
    }

    try {
        const runMetadata: Record<string, NodeExecutionOutput> = {};
        for (const run of existingNodeRuns) {
            if (run.status === NodeStatus.Success && run.output) {
                runMetadata[run.nodeId] = run.output;
            }
        }

        const output = await executeNodeLogic(node, nodeRun.id, runMetadata);
        
        if (output !== null) {
            await prisma.nodeRun.update({
                where: { id: nodeRun.id },
                data: {
                    status: NodeStatus.Success,
                    completedAt: new Date(),
                    output: output
                }
            });
        } else {
            await prisma.nodeRun.update({
                where: { id: nodeRun.id },
                data: {
                    status: NodeStatus.Success,
                    completedAt: new Date()
                }
            });
        }
    } catch (error) {
        await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: {
                status: NodeStatus.Failed,
                completedAt: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        });
        throw error;
    }
}

async function executeNodeLogic(node: WorkflowNode, nodeRunId: string, runMetadata: Record<string, NodeExecutionOutput>): Promise<NodeExecutionOutput> {
    switch(node.type) {
        case 'discord':
            return await executeDiscordNode(node.data, nodeRunId, runMetadata);
        case 'http':
            return await executeHTTPNode(node.data, nodeRunId, runMetadata);
        default:
            throw new Error(`Unsupported node type: ${node.type}`);
    }
}

function findNodeRunForNode(existingNodeRuns: NodeRun[], nodeId: string): NodeRun | undefined {
    return existingNodeRuns.find(run => run.nodeId === nodeId);
}
