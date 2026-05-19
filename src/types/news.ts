export interface Category {
  id: number
  name: string
}

export interface Tag {
  id: number
  name: string
}

export interface IResponseNewsDetail {
  data: NewsDetail
}

export interface NewsItem {
  id: number
  title: string
  summary?: string
  content: string
  source: string | null
  publishTime: string | null
  views: number
  categoryId: number | null
  category: Category | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface NewsDetail extends NewsItem {}

export interface NewsDataBase {
  title: string
  source?: string | null
  publish_time?: string | null
  views?: number
}

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
  content: string | null
  coverImage: string | null
  categoryId: number | null
  createdAt: string
  updatedAt: string
}

export interface PublishedNews extends NewsItem {}

export interface FavoriteItem {
  newsId: number
  title: string
  source: string | null
  publishTime: string | null
  views: number
  createdAt: string
}

export interface HistoryItem {
  newsId: number
  title: string
  source: string | null
  publishTime: string | null
  views: number
  viewedAt: string
}
