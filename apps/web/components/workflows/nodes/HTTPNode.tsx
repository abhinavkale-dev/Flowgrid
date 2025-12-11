"use client"

import { Handle, Position } from '@xyflow/react'
import { useEditor } from '@/contexts/EditorContext'
import { X } from 'lucide-react'

interface HTTPNodeData {
  url?: string
  method?: string
  headers?: Record<string, string>
}

export default function HTTPNode(props: any) {
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
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="16" height="16" className="text-blue-400">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
          </svg>
        </div>
        <span className="font-semibold text-white text-sm">HTTP Request</span>
      </div>

      <div className="text-xs text-white/60 space-y-1">
        <div>URL: {data.url || 'https://'}</div>
        <div>Method: {data.method || 'GET'}</div>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400 border-2 border-white" />
    </div>
  )
}
