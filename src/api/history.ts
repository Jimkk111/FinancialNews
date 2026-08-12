import { get, getPaginated, post, del } from './request'
import type { HistoryItem, MessageResponse } from '@/types'
import type { PaginatedResponse } from './request'

export async function getHistory(params: {
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<HistoryItem>> {
  return getPaginated<HistoryItem>('/history', { params })
}

export async function addHistory(newsId: number): Promise<MessageResponse> {
  return post<MessageResponse>('/history', { newsId })
}

export async function clearHistory(): Promise<MessageResponse> {
  return del<MessageResponse>('/history')
}
