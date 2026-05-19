import type {
  Category,
  Tag,
  NewsItem,
  NewsDetail,
} from '@/types'
import * as newsApi from '@/api/news'
import type { PaginatedResponse } from '@/api/request'
import type { IResponseNewsDetail } from '@/types/news'

export type { Category, Tag, NewsItem, NewsDetail,IResponseNewsDetail }

export async function getNewsList(
  page: number = 1,
  pageSize: number = 20,
  categoryId?: number,
  sort: 'newest' | 'popular' = 'newest'
): Promise<PaginatedResponse<NewsItem>> {
  return newsApi.getNewsList({
    page,
    pageSize,
    categoryId,
    sort,
  })
}

export async function getNewsDetail(newsId: number): Promise<IResponseNewsDetail> {
  return newsApi.getNewsDetail(newsId)
}

export async function incrementNewsViews(newsId: number): Promise<{ views: number }> {
  return newsApi.incrementViews(newsId)
}

export async function getNewsCategories(): Promise<Category[]> {
  return newsApi.getCategories()
}

export async function getNewsTags(): Promise<Tag[]> {
  return newsApi.getTags()
}

export async function searchNews(
  keyword: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<NewsItem>> {
  if (!keyword || !keyword.trim()) {
    return {
      data: [],
      pagination: { page, pageSize, total: 0, totalPages: 0 }
    }
  }

  return newsApi.searchNews({
    keyword: keyword.trim(),
    page,
    pageSize,
  })
}
