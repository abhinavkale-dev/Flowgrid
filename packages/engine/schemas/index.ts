export * from './nodes.js'

export const nodeExecutors = {
  httpTrigger: 'executeHTTPTrigger',
  aiNode: 'executeAINode',
  slackNode: 'executeSlackNode',
  manualTrigger: 'executeManualTrigger',
} as const

export type NodeType = keyof typeof nodeExecutors
export type ExecutorName = typeof nodeExecutors[NodeType]










