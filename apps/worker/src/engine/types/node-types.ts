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

export type WorkflowNode =
  | { id: string; type: 'email'; data: EmailNodeData; position?: Position }
  | { id: string; type: 'discordNode'; data: DiscordNodeData; position?: Position }
  | { id: string; type: 'slackNode'; data: SlackNodeData; position?: Position }
  | { id: string; type: 'telegram'; data: TelegramNodeData; position?: Position }
  | { id: string; type: 'httpTrigger'; data: HTTPNodeData; position?: Position }
  | { id: string; type: 'aiNode'; data: AINodeData; position?: Position }
  | { id: string; type: 'triggerNode'; data: ManualTriggerNodeData; position?: Position }
  | { id: string; type: 'manualTrigger'; data: ManualTriggerNodeData; position?: Position }

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
  output?: NodeExecutionOutput | null;
}
