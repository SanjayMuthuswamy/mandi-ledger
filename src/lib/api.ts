export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export class ApiError extends Error {
  status: number
  data: any

  constructor(status: number, message: string, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function handleResponse(response: Response) {
  if (response.status === 204) return null
  
  const data = await response.json().catch(() => null)
  
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || response.statusText || 'API Error',
      data
    )
  }
  
  return data
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken')
  
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle token expiration
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken')
    
    // Don't try to refresh if the endpoint itself was the refresh endpoint
    if (refreshToken && endpoint !== '/auth/refresh') {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })
        
        if (refreshResponse.ok) {
          const { accessToken, refreshToken: newRefreshToken } = await refreshResponse.json()
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          // Retry original request
          headers['Authorization'] = `Bearer ${accessToken}`
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
          })
          return handleResponse(retryResponse)
        } else {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new ApiError(401, 'Session expired')
        }
      } catch (err) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw err
      }
    } else {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      if(endpoint !== '/auth/login') {
         window.location.href = '/login'
      }
    }
  }

  return handleResponse(response)
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchApi(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  put: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchApi(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  patch: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchApi(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  delete: (endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'DELETE' }),
}
