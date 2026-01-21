'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { useSidebar } from '@/components/ui/sidebar'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Clock, Key, Workflow as WorkflowIcon, LogOut, User } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'

type Tab = 'workflows' | 'history'

interface WorkflowType {
  id: string
  title: string
  trigger?: {
    type: {
      id: string
      name: string
    }
  }
  actions: Array<{
    type: {
      name: string
    }
  }>
}

interface HistoryType {
  id: string
  workflowId: string
  status: string
  createdAt: string
  finishedAt?: string
  metadata: Record<string, any>
  errorMetadata?: Record<string, any>
  workflow: {
    title: string
  }
}

const Home = () => {
  const { state } = useSidebar()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('workflows')
  const [workflows, setWorkflows] = useState<WorkflowType[]>([])
  const [history, setHistory] = useState<HistoryType[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/workflows')
      if (response.ok) {
        const data = await response.json()
        setWorkflows(data.workflows || [])
      }
    } catch (error) {
      console.error('Failed to load workflows:', error)
    }
    setLoading(false)
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setWorkflows((prev) => prev.filter((w) => w.id !== workflowId))
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/signin')
  }

  return (
    <div
      className={`flex-1 overflow-auto transition-all duration-300 ${
        state === 'expanded' ? 'ml-64' : 'ml-16'
      }`}
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">FlowGrid</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/home/workflows/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Workflow
            </button>
            {session?.user && (
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name} className="w-full h-full rounded-full" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{session.user.name}</div>
                    <div className="text-gray-500">{session.user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 ${
              activeTab === 'workflows'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <WorkflowIcon className="inline mr-2" size={20} />
            Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Clock className="inline mr-2" size={20} />
            History ({history.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {activeTab === 'workflows' && (
              <div className="grid gap-4">
                {workflows.length === 0 ? (
                  <Card className="p-12 text-center">
                    <WorkflowIcon className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first workflow automation
                    </p>
                    <button
                      onClick={() => router.push('/home/workflows/new')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Workflow
                    </button>
                  </Card>
                ) : (
                  workflows.map((workflow) => (
                    <Card
                      key={workflow.id}
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
                      onClick={() => router.push(`/home/workflows/${workflow.id}`)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteWorkflow(workflow.id)
                        }}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                      <h3 className="text-lg font-semibold mb-2">
                        {workflow.title || 'Untitled Workflow'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {workflow.trigger && (
                          <>
                            <span>{workflow.trigger.type.name}</span>
                            <span>→</span>
                          </>
                        )}
                        {workflow.actions.map((action, i) => (
                          <React.Fragment key={i}>
                            <span>{action.type.name}</span>
                            {i < workflow.actions.length - 1 && <span>→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="grid gap-4">
                {history.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Clock className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-medium mb-2">No history yet</h3>
                    <p className="text-gray-600">
                      Workflow execution history will appear here
                    </p>
                  </Card>
                ) : (
                  history.map((item) => (
                    <Card key={item.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{item.workflow.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.status === 'Complete'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'Error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home
