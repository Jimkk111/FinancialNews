import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = axios.create({
  baseURL,
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
    }
    return Promise.reject(error)
  }
)

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function get<T>(url: string, config?: Record<string, unknown>): Promise<T> {
  return request.get(url, config) as Promise<T>
}

export async function post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
  return request.post(url, data, config) as Promise<T>
}

export async function put<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
  return request.put(url, data, config) as Promise<T>
}

export async function del<T>(url: string, config?: Record<string, unknown>): Promise<T> {
  return request.delete(url, config) as Promise<T>
}

export async function getPaginated<T>(url: string, config?: Record<string, unknown>): Promise<PaginatedResponse<T>> {
  return request.get(url, config) as Promise<PaginatedResponse<T>>
}

export default request
