import AINode from '@/components/workflows/nodes/AINode'
import TriggerNode from '@/components/workflows/nodes/TriggerNode'
import HTTPNode from '@/components/workflows/nodes/HTTPNode'
import SlackNode from '@/components/workflows/nodes/SlackNode'

export const nodeTypes = {
  aiNode: AINode,
  triggerNode: TriggerNode,
  httpTrigger: HTTPNode,
  slackNode: SlackNode,
} as const

export type NodeType = keyof typeof nodeTypes


















