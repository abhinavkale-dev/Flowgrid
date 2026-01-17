'use client'

import React, { useState } from 'react'

interface DraggableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void
}

export function DraggableTextarea({ onValueChange, className, ...props }: DraggableTextareaProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedText = e.dataTransfer.getData('text/plain')
    const textarea = e.target as HTMLTextAreaElement
    const start = textarea.selectionStart ?? 0
    const end = textarea.selectionEnd ?? 0
    const currentValue = textarea.value || ''

    const newValue = currentValue.slice(0, start) + droppedText + currentValue.slice(end)

    textarea.value = newValue

    if (onValueChange) {
      onValueChange(newValue)
    }

    const event = new Event('input', { bubbles: true })
    textarea.dispatchEvent(event)

    setTimeout(() => {
      const newCursorPos = start + droppedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <textarea
      {...props}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`${className} ${
        isDragOver ? 'border-[#c6613f] ring-2 ring-[#c6613f]/30 bg-[#c6613f]/10' : ''
      } transition-all`}
    />
  )
}





