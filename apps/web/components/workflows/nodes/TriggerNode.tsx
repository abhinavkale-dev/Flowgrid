"use client"

import { Handle, Position } from '@xyflow/react'
import { useEditor } from '@/contexts/EditorContext'
import { X } from 'lucide-react'

interface TriggerNodeData {
  triggerType?: string
  schedule?: string
  manual?: boolean
}

export default function TriggerNode(props: any) {
  const { data, id } = props
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
        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="16" height="16" className="text-orange-400">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.586 12.586L19 19M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"/>
          </svg>
        </div>
        <span className="font-semibold text-white text-sm">Trigger</span>
      </div>

      <div className="text-xs text-white/60 space-y-1 nodrag">
        <div>Type: {data.triggerType || 'Manual'}</div>
        {data.schedule && <div>Schedule: {data.schedule}</div>}
        <div>Ready to trigger workflow</div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-400 border-2 border-white" />
      </div>
    )
}