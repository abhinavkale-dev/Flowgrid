"use client"

import { Handle, Position } from '@xyflow/react'
import { useEditor } from '@/contexts/EditorContext'
import { X } from 'lucide-react'

interface SlackNodeData {
  channel?: string
  message?: string
  webhookUrl?: string
}

export default function SlackNode(props: any) {
  const { data, id } = props;
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
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="16" height="16" className="text-purple-400">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span className="font-semibold text-white text-sm">Slack</span>
      </div>

      <div className="text-xs text-white/60 space-y-1">
        <div>Channel: {data.channel || '#general'}</div>
        <div>Message: {data.message ? `${data.message.substring(0, 20)}...` : 'Hello!'}</div>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-400 border-2 border-white" />
    </div>
  )
}
