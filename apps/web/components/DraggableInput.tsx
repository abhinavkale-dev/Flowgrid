'use client'

import React, { useState } from 'react'

interface DraggableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void
}

export function DraggableInput({ onValueChange, className, ...props }: DraggableInputProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedText = e.dataTransfer.getData('text/plain')
    const input = e.target as HTMLInputElement
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    const currentValue = input.value || ''

    const newValue = currentValue.slice(0, start) + droppedText + currentValue.slice(end)

    input.value = newValue

    if (onValueChange) {
      onValueChange(newValue)
    }

    const event = new Event('input', { bubbles: true })
    input.dispatchEvent(event)


    setTimeout(() => {
      const newCursorPos = start + droppedText.length
      input.setSelectionRange(newCursorPos, newCursorPos)
      input.focus()
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <input
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





