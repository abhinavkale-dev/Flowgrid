import { z } from 'zod'

export const HTTPTriggerSchema = z.object({
  url: z.string().url('Must be a valid URL').min(1, 'URL is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
    errorMap: () => ({ message: 'Method must be GET, POST, PUT, PATCH, or DELETE' })
  }).default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  timeout: z.number().min(1000).max(300000).optional(), // 1s to 5min
})

export const AINodeSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro'], {
    errorMap: () => ({ message: 'Invalid AI model selected' })
  }).default('gpt-4'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4000).optional(),
  systemPrompt: z.string().max(2000).optional(),
})

export const SlackNodeSchema = z.object({
  channel: z.string().min(1, 'Channel is required').regex(/^#/, 'Channel must start with #'),
  message: z.string().min(1, 'Message is required').max(4000, 'Message too long'),
  webhookUrl: z.string().url('Must be a valid webhook URL').optional(),
  username: z.string().max(80).optional(),
  iconEmoji: z.string().regex(/^:[^:]+:$/, 'Must be a valid emoji code').optional(),
})

export const ManualTriggerSchema = z.object({
  triggerName: z.string().min(1, 'Trigger name is required').max(100),
  description: z.string().max(500).optional(),
  confirmBeforeRun: z.boolean().default(false),
})

export const NodeDataSchema = z.union([
  HTTPTriggerSchema.extend({ nodeType: z.literal('httpTrigger') }),
  AINodeSchema.extend({ nodeType: z.literal('aiNode') }),
  SlackNodeSchema.extend({ nodeType: z.literal('slackNode') }),
  ManualTriggerSchema.extend({ nodeType: z.literal('manualTrigger') }),
])

export type HTTPTriggerData = z.infer<typeof HTTPTriggerSchema>
export type AINodeData = z.infer<typeof AINodeSchema>
export type SlackNodeData = z.infer<typeof SlackNodeSchema>
export type ManualTriggerData = z.infer<typeof ManualTriggerSchema>
export type NodeData = z.infer<typeof NodeDataSchema>

