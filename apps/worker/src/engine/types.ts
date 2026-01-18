import { z } from 'zod';
import type { NodeStatus } from '@repo/prisma';

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface EmailNodeData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export interface DiscordNodeData {
  webhookUrl: string;
  message: string;
  username?: string;
}

export interface SlackNodeData {
  webhookUrl: string;
  message: string;
  channel?: string;
}

export interface TelegramNodeData {
  botToken: string;
  chatId: string;
  message: string;
}

export interface HTTPNodeData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
}

export interface AINodeData {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ManualTriggerNodeData {
  payload?: Record<string, unknown>;
}

export interface HTTPTriggerNodeData {
  payload?: Record<string, unknown>;
}

export type WorkflowNode =
  | { id: string; type: 'email'; data: EmailNodeData; position?: Position }
  | { id: string; type: 'discord'; data: DiscordNodeData; position?: Position }
  | { id: string; type: 'slack'; data: SlackNodeData; position?: Position }
  | { id: string; type: 'telegram'; data: TelegramNodeData; position?: Position }
  | { id: string; type: 'http'; data: HTTPNodeData; position?: Position }
  | { id: string; type: 'aiNode'; data: AINodeData; position?: Position }
  | { id: string; type: 'manualTrigger'; data: ManualTriggerNodeData; position?: Position }
  | { id: string; type: 'httpTrigger'; data: HTTPTriggerNodeData; position?: Position };


export type NodeExecutionOutput = 
  | string 
  | number 
  | boolean 
  | null 
  | { [key: string]: NodeExecutionOutput }
  | NodeExecutionOutput[];

export interface NodeRun {
  id: string;
  nodeId: string;
  status: NodeStatus;
  retryCount: number;
}


const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const emailNodeDataSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  from: z.string().email().optional(),
});

const discordNodeDataSchema = z.object({
  webhookUrl: z.string().url(),
  message: z.string(),
  username: z.string().optional(),
});

const slackNodeDataSchema = z.object({
  webhookUrl: z.string().url(),
  message: z.string(),
  channel: z.string().optional(),
});

const telegramNodeDataSchema = z.object({
  botToken: z.string(),
  chatId: z.string(),
  message: z.string(),
});

const httpNodeDataSchema = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
});

const aiNodeDataSchema = z.object({
  prompt: z.string(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

const manualTriggerNodeDataSchema = z.object({
  payload: z.record(z.unknown()).optional(),
});

const httpTriggerNodeDataSchema = z.object({
  payload: z.record(z.unknown()).optional(),
});

const workflowNodeSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('email'),
    data: emailNodeDataSchema,
    position: positionSchema.optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('discord'),
    data: discordNodeDataSchema,
    position: positionSchema.optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('slack'),
    data: slackNodeDataSchema,
    position: positionSchema.optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('telegram'),
    data: telegramNodeDataSchema,
    position: positionSchema.optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('http'),
    data: httpNodeDataSchema,
    position: positionSchema.optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('aiNode'),
    data: aiNodeDataSchema,
    position: positionSchema.optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('manualTrigger'),
    data: manualTriggerNodeDataSchema,
    position: positionSchema.optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('httpTrigger'),
    data: httpTriggerNodeDataSchema,
    position: positionSchema.optional(),
  }),
]);

const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export const workflowNodeArraySchema = z.array(workflowNodeSchema);
export const workflowEdgeArraySchema = z.array(workflowEdgeSchema);

export function parseWorkflowNodes(json: unknown): WorkflowNode[] {
  if (!Array.isArray(json)) {
    throw new Error('Workflow nodes must be an array');
  }
  return workflowNodeArraySchema.parse(json) as WorkflowNode[];
}

export function parseWorkflowEdges(json: unknown): WorkflowEdge[] {
  if (!Array.isArray(json)) {
    throw new Error('Workflow edges must be an array');
  }
  return workflowEdgeArraySchema.parse(json) as WorkflowEdge[];
}

export function isEmailNode(node: WorkflowNode): node is Extract<WorkflowNode, { type: 'email' }> {
  return node.type === 'email';
}

export function isDiscordNode(node: WorkflowNode): node is Extract<WorkflowNode, { type: 'discord' }> {
  return node.type === 'discord';
}

export function isSlackNode(node: WorkflowNode): node is Extract<WorkflowNode, { type: 'slack' }> {
  return node.type === 'slack';
}

export function isTelegramNode(node: WorkflowNode): node is Extract<WorkflowNode, { type: 'telegram' }> {
  return node.type === 'telegram';
}

export function isHTTPNode(node: WorkflowNode): node is Extract<WorkflowNode, { type: 'http' }> {
  return node.type === 'http';
}

export function isAINode(node: WorkflowNode): node is Extract<WorkflowNode, { type: 'aiNode' }> {
  return node.type === 'aiNode';
}

export function isManualTriggerNode(node: WorkflowNode): node is Extract<WorkflowNode, { type: 'manualTrigger' }> {
  return node.type === 'manualTrigger';
}

export function isHTTPTriggerNode(node: WorkflowNode): node is Extract<WorkflowNode, { type: 'httpTrigger' }> {
  return node.type === 'httpTrigger';
}
