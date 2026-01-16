const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getSessionTokenFromCookies(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(cookie => 
    cookie.trim().startsWith('better-auth.session_token=')
  )

  if (!sessionCookie) {
    return null
  }

  return sessionCookie.split('=')[1] ?? null
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const sessionToken = getSessionTokenFromCookies()

  if (!sessionToken) {
    throw new Error('Not authenticated - no session token found')
  }

  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || 'API request failed')
  }

  return response.json()
}

export const credentialsApi = {
  getAll: () => 
    apiRequest('/api/v1/credentials'),

  create: (data: { title: string; platform: string; keys: any }) =>
    apiRequest('/api/v1/credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { title?: string; keys?: any }) =>
    apiRequest(`/api/v1/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/api/v1/credentials/${id}`, {
      method: 'DELETE',
    }),
}

export const workflowsApi = {
  getAll: () =>
    apiRequest('/api/v1/workflow'),

  getById: (id: string) =>
    apiRequest(`/api/v1/workflow/${id}`),

  create: (data: {
    id: string
    title: string
    availableTriggerId: string
    triggerMetadata?: any
    actions: Array<{
      availableActionId: string
      actionMetadata?: any
    }>
    nodes?: any
    edges?: any
  }) =>
    apiRequest('/api/v1/workflow', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: {
    title?: string
    availableTriggerId?: string
    triggerMetadata?: any
    actions?: Array<{
      availableActionId: string
      actionMetadata?: any
    }>
    nodes?: any
    edges?: any
  }) =>
    apiRequest(`/api/v1/workflow/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/api/v1/workflow/${id}`, {
      method: 'DELETE',
    }),

  getHistory: () =>
    apiRequest('/api/v1/workflow/status/history'),
}
