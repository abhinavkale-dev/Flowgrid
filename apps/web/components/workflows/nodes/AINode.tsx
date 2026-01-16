"use client"

import { Handle, Position } from '@xyflow/react'
import { useEditor } from '@/contexts/EditorContext'
import { X } from 'lucide-react'

interface AINodeData {
  prompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export default function AINode({ data, id }: { data: AINodeData, id: string }) {
  const { deleteNode } = useEditor()
  return (
    <div className="p-3 bg-[#414243] border border-white/20 rounded-lg shadow-lg min-w-[180px] relative group">
      <button
        onClick={(e) => {
          e.stopPropagation()
          deleteNode(id)
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center nodrag"
      >
        <X size={12} />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="16" height="16" className="text-green-400">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8V4H8m4 16v-4m0-8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
          </svg>
        </div>
        <span className="font-semibold text-white text-sm">AI</span>
      </div>

      <div className="text-xs text-white/60 space-y-1 nodrag">
        <div>Model: {data.model || 'gpt-4'}</div>
        <div>Temp: {data.temperature || 0.7}</div>
        {data.prompt && <div>Prompt: {data.prompt.substring(0, 15)}...</div>}
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-400 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-400 border-2 border-white" />
    </div>
  )
}
