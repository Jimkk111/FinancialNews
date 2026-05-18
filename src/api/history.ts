import { get, getPaginated, post, del } from './request'
import type { NewsItem, MessageResponse } from '@/types'
import type { PaginatedResponse } from './request'

export interface AddHistoryRequest {
  newsId: number
  title: string
  source?: string | null
  publish_time?: string | null
  views?: number
}

export async function getHistory(params: {
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<NewsItem>> {
  return getPaginated<NewsItem>('/history', { params })
}

export async function addHistory(data: AddHistoryRequest): Promise<MessageResponse> {
  return post<MessageResponse>('/history', data)
}

export async function clearHistory(): Promise<MessageResponse> {
  return del<MessageResponse>('/history')
}
