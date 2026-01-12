import { Node, Edge } from '@xyflow/react'

export interface WorkflowData {
  id: string
  title: string
  nodes: Node[]
  edges: Edge[]
}

export async function getWorkflow(id: string): Promise<WorkflowData> {
  const response = await fetch(`/api/workflows/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch workflow: ${response.statusText}`)
  }

  return response.json()
}

export async function createWorkflow(data: {
  title: string
  nodes?: Node[]
  edges?: Edge[]
}): Promise<WorkflowData> {
  const response = await fetch('/api/workflows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create workflow: ${response.statusText}`)
  }

  return response.json()
}

export async function saveWorkflow(id: string, data: {
  title?: string
  nodes?: Node[]
  edges?: Edge[]
}): Promise<WorkflowData> {
  const response = await fetch(`/api/workflows/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to save workflow: ${response.statusText}`)
  }

  return response.json()
}

























