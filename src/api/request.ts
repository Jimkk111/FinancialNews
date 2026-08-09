import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

// ============================================================
// 统一 Axios 实例
// ============================================================

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
})

// ---------- 请求拦截器：注入 Authorization token ----------

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---------- 响应拦截器：解包 data + 401 统一处理 ----------

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
    }
    return Promise.reject(error)
  },
)

// ============================================================
// 类型
// ============================================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// ============================================================
// 基础 HTTP 方法（在 axios 实例之上按业务习惯封装）
// ============================================================

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.get(url, config) as Promise<T>
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request.post(url, data, config) as Promise<T>
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request.put(url, data, config) as Promise<T>
}

export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.delete(url, config) as Promise<T>
}

export function getPaginated<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<PaginatedResponse<T>> {
  return request.get(url, config) as Promise<PaginatedResponse<T>>
}

// ============================================================
// Streaming / fetch 场景辅助工具
// 对于 SSE 等 axios 无法原生支持的场景，提供统一的方式获取
// baseURL 和 auth headers，避免各模块分散拼接
// ============================================================

/** 根据相对路径拼接完整请求 URL */
export function resolveUrl(path: string): string {
  return `${baseURL}${path}`
}

/** 获取当前存储的 Authorization 头，供 fetch 等场景复用 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default request
