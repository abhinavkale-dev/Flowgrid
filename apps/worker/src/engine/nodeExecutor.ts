import { prisma, NodeStatus } from "@repo/prisma";
import type { WorkflowNode, NodeRun, NodeExecutionOutput } from "./types.js";

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
        });
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
        });
    }

    try {
        const output = await executeNodeLogic(node, nodeRun.id);
        
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

async function executeNodeLogic(node: WorkflowNode, nodeRunId: string): Promise<NodeExecutionOutput> {
    switch(node.type) {
        case 'email':
            return await executeEmailNode(node.data, nodeRunId);
        case 'slack':
            return await executeSlackNode(node.data, nodeRunId);
        case 'telegram':
            return await executeTelegramNode(node.data, nodeRunId);
        case 'discord':
            return await executeDiscordNode(node.data, nodeRunId);
        case 'httpTrigger':
            return await executeHTTPTriggerNode(node.data, nodeRunId);
        case 'aiNode':
            return await executeAINode(node.data, nodeRunId);
        case 'manualTrigger':
            return await executeManualTriggerNode(node.data, nodeRunId);
        default:
            throw new Error(`Unsupported node type: ${node.type}`);
    }
}

function findNodeRunForNode(existingNodeRuns: NodeRun[], nodeId: string): NodeRun | undefined {
    return existingNodeRuns.find(run => run.nodeId === nodeId);
}
