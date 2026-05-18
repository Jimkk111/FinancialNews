import { get, getPaginated, post, del } from './request'
import type { NewsItem, MessageResponse } from '@/types'
import type { PaginatedResponse } from './request'

export interface AddFavoriteRequest {
  newsId: number
  title: string
  source?: string | null
  publish_time?: string | null
  views?: number
}

export async function getFavorites(params: {
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<NewsItem>> {
  return getPaginated<NewsItem>('/favorites', { params })
}

export async function addFavorite(data: AddFavoriteRequest): Promise<MessageResponse> {
  return post<MessageResponse>('/favorites', data)
}

export async function removeFavorite(newsId: number): Promise<MessageResponse> {
  return del<MessageResponse>(`/favorites/${newsId}`)
}

export async function checkFavorite(newsId: number): Promise<{ is_favorite: boolean }> {
  return get<{ is_favorite: boolean }>(`/favorites/check/${newsId}`)
}
