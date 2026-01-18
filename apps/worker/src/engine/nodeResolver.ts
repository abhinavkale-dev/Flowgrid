import { NodeStatus } from "@repo/prisma";
import type { WorkflowNode, WorkflowEdge, NodeRun } from "./types.js";

export function findRunnableNodes(nodes: WorkflowNode[], edges: WorkflowEdge[], nodeRuns: NodeRun[]): WorkflowNode[] {
    const runnableNodes: WorkflowNode[] = [];

    for (const node of nodes) {
        const nodeRun = findNodeRunForNode(nodeRuns, node.id);

        if (nodeRun) {
            if (nodeRun.status === NodeStatus.Success) {
                continue;  
            }

            if (nodeRun.status === NodeStatus.Running) {
                continue;  
            }

            if (nodeRun.status === NodeStatus.Failed && nodeRun.retryCount >= 3) {
                continue;  
            }
        }

        const incomingEdges = findIncomingEdges(edges, node.id);

        if (areDependenciesSatisfied(incomingEdges, nodeRuns)) {
            runnableNodes.push(node);
        }
    }

    return runnableNodes;
}

function findNodeRunForNode(nodeRuns: NodeRun[], nodeId: string): NodeRun | undefined {
    return nodeRuns.find(run => run.nodeId === nodeId);
}

function findIncomingEdges(edges: WorkflowEdge[], nodeId: string): WorkflowEdge[] {
    return edges.filter(edge => edge.target === nodeId);
}

function areDependenciesSatisfied(incomingEdges: WorkflowEdge[], nodeRuns: NodeRun[]): boolean {
    for (const edge of incomingEdges) {
        const sourceNodeRun = findNodeRunForNode(nodeRuns, edge.source);
        
        if(!sourceNodeRun || sourceNodeRun.status !== NodeStatus.Success) {
            return false;
        }
    }
    return true;
}
