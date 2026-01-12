"use client"

import React, { createContext, useContext, useRef } from 'react'

interface EditorContextType {
  updateNodeData: (nodeId: string, data: any) => void
  deleteNode: (nodeId: string) => void
  addNode: (type: string, position?: { x: number; y: number }) => void
  duplicateNode: (nodeId: string) => void
  getNodeData: (nodeId: string) => any
}

const EditorContext = createContext<EditorContextType | null>(null)

interface EditorProviderProps {
  children: React.ReactNode
  onUpdateNodeData?: (nodeId: string, data: any) => void
  onDeleteNode?: (nodeId: string) => void
  onAddNode?: (type: string, position?: { x: number; y: number }) => void
  onDuplicateNode?: (nodeId: string) => void
  getNodeData?: (nodeId: string) => any
}

export function EditorProvider({
  children,
  onUpdateNodeData,
  onDeleteNode,
  onAddNode,
  onDuplicateNode,
  getNodeData,
}: EditorProviderProps) {
  const contextValue: EditorContextType = {
    updateNodeData: onUpdateNodeData || (() => {}),
    deleteNode: onDeleteNode || (() => {}),
    addNode: onAddNode || (() => {}),
    duplicateNode: onDuplicateNode || (() => {}),
    getNodeData: getNodeData || (() => null),
  }

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}


export const runtimeCallbacks = {

}





























