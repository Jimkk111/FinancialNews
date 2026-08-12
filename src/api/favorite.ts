import { get, getPaginated, post, del } from './request'
import type { FavoriteItem, MessageResponse } from '@/types'
import type { PaginatedResponse } from './request'

export async function getFavorites(params: {
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<FavoriteItem>> {
  return getPaginated<FavoriteItem>('/favorites', { params })
}

export async function addFavorite(newsId: number): Promise<MessageResponse> {
  return post<MessageResponse>('/favorites', { newsId })
}

export async function removeFavorite(newsId: number): Promise<MessageResponse> {
  return del<MessageResponse>(`/favorites/${newsId}`)
}

export async function checkFavorite(newsId: number): Promise<{ is_favorite: boolean }> {
  return get<{ is_favorite: boolean }>(`/favorites/check/${newsId}`)
}
