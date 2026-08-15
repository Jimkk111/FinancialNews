import type { ArticleContent } from './content'

export interface Category {
  id: number
  name: string
}

export interface Tag {
  id: number
  name: string
}

export interface NewsItem {
  id: number
  title: string
  summary?: string
  content?: string
  contentJson?: ArticleContent | null
  source: string | null
  publishTime: string | null
  views: number
  hasImage?: boolean
  imageUrl?: string | null
  categoryId: number | null
  userId?: number
  category: Category | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface NewsDetail extends NewsItem {}

export interface NewsListResponse {
  data: NewsItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface SearchResultItem {
  id: number
  title: string
  summary: string
  source: string | null
  publishTime: string | null
  views: number
}

export interface SearchResponse {
  data: SearchResultItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface NewsDraft {
  id: string
  title: string
  content?: string | null
  contentJson?: ArticleContent | null
  coverImage: string | null
  categoryId: number | null
  tags?: number[]
  createdAt: string
  updatedAt: string
}

export interface PublishedNews extends NewsItem {}

export interface FavoriteItem {
  newsId: number
  title: string
  summary?: string
  source: string | null
  publishTime: string | null
  views: number
  hasImage?: boolean
  imageUrl?: string | null
  categoryId?: number | null
  favoritedAt: string
}

export interface HistoryItem {
  newsId: number
  title: string
  summary?: string
  source: string | null
  publishTime: string | null
  views: number
  hasImage?: boolean
  imageUrl?: string | null
  categoryId?: number | null
  viewedAt: string
}
