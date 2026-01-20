import { z } from 'zod';

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
  webhookUrl: z.string().url().optional(),
  message: z.string().optional(),
  username: z.string().optional(),
}).passthrough();

const slackNodeDataSchema = z.object({
  webhookUrl: z.string().url().optional(),
  message: z.string().optional(),
  channel: z.string().optional(),
}).passthrough();

const telegramNodeDataSchema = z.object({
  botToken: z.string(),
  chatId: z.string(),
  message: z.string(),
});

const httpNodeDataSchema = z.object({
  url: z.string().url().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
}).passthrough();

const aiNodeDataSchema = z.object({
  prompt: z.string(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

const manualTriggerNodeDataSchema = z.object({
  payload: z.record(z.unknown()).optional(),
}).passthrough();

const workflowNodeSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('email'),
    data: emailNodeDataSchema,
    position: positionSchema.optional(),
  }).passthrough(),
  z.object({
    id: z.string(),
    type: z.literal('discordNode'),
    data: discordNodeDataSchema,
    position: positionSchema.optional(),
  }).passthrough(),
  z.object({
    id: z.string(),
    type: z.literal('slackNode'),
    data: slackNodeDataSchema,
    position: positionSchema.optional(),
  }).passthrough(),
  z.object({
    id: z.string(),
    type: z.literal('telegram'),
    data: telegramNodeDataSchema,
    position: positionSchema.optional(),
  }).passthrough(),
  z.object({
    id: z.string(),
    type: z.literal('httpTrigger'),
    data: httpNodeDataSchema,
    position: positionSchema.optional(),
  }).passthrough(),
  z.object({
    id: z.string(),
    type: z.literal('aiNode'),
    data: aiNodeDataSchema,
    position: positionSchema.optional(),
  }).passthrough(),
  z.object({
    id: z.string(),
    type: z.literal('triggerNode'),
    data: manualTriggerNodeDataSchema,
    position: positionSchema.optional(),
  }).passthrough(),
  z.object({
    id: z.string(),
    type: z.literal('manualTrigger'),
    data: manualTriggerNodeDataSchema,
    position: positionSchema.optional(),
  }).passthrough()
]);

const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export const workflowNodeArraySchema = z.array(workflowNodeSchema);
export const workflowEdgeArraySchema = z.array(workflowEdgeSchema);
