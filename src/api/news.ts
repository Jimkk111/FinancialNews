import { get, getPaginated, post } from './request'
import type { NewsItem, NewsDetail, Category, Tag ,IResponseNewsDetail} from '@/types'
import type { PaginatedResponse } from './request'

export async function getNewsList(params: {
  page?: number
  pageSize?: number
  categoryId?: number
  sort?: 'newest' | 'popular'
}): Promise<PaginatedResponse<NewsItem>> {
  return getPaginated<NewsItem>('/news', { params })
}

export async function getNewsDetail(id: number): Promise<IResponseNewsDetail> {
  return get<IResponseNewsDetail>(`/news/${id}`)
}

export async function incrementViews(id: number): Promise<{ views: number }> {
  return post<{ views: number }>(`/news/${id}/views`)
}

export async function getCategories(): Promise<Category[]> {
  return get<Category[]>('/news/categories')
}

export async function getTags(): Promise<Tag[]> {
  return get<Tag[]>('/news/tags')
}

export async function searchNews(params: {
  keyword: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<NewsItem>> {
  return getPaginated<NewsItem>('/news/search', { params })
}
