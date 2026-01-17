'use client'

import React from 'react'
import { GripVertical } from 'lucide-react'

interface KeySidebarProps {
  keys: Record<string, any>
  title?: string
  onKeyDrag?: (key: string) => void
}

export function KeySidebar({ keys, title = 'Available Keys', onKeyDrag }: KeySidebarProps) {
  const flattenKeys = (obj: Record<string, any>, prefix = ''): string[] => {
    const result: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result.push(...flattenKeys(value, fullKey))
      } else {
        result.push(fullKey)
      }
    }

    return result
  }

  const availableKeys = flattenKeys(keys)

  if (availableKeys.length === 0) {
    return null
  }

  const handleDragStart = (e: React.DragEvent, key: string) => {
    e.dataTransfer.setData('text/plain', `{${key}}`)
    e.dataTransfer.effectAllowed = 'copy'
    if (onKeyDrag) {
      onKeyDrag(key)
    }
  }

  return (
    <div className="fixed left-0 top-14 bottom-0 w-64 bg-[#30302e] border-r border-[#4a4945] p-4 overflow-y-auto z-40">
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-2">
        {availableKeys.map((key) => (
          <div
            key={key}
            draggable
            onDragStart={(e) => handleDragStart(e, key)}
            className="flex items-center gap-2 px-3 py-2 bg-[#3a3938] border border-[#4a4945] rounded-lg text-[#faf9f5] text-sm font-mono cursor-grab active:cursor-grabbing hover:bg-[#4a4945] hover:border-[#c6613f] transition-all group"
          >
            <GripVertical className="w-3 h-3 text-[#a6a29e] group-hover:text-[#c6613f]" />
            <span className="truncate">{key}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-[#262624] rounded-lg border border-[#4a4945]">
        <p className="text-xs text-[#a6a29e]">
          <strong className="text-[#faf9f5]">Tip:</strong> Drag these keys into action fields to use
          dynamic data. They'll appear as <code className="text-[#c6613f]">{'{key}'}</code>
        </p>
      </div>
    </div>
  )
}





