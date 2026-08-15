/** 爬虫模块类型定义 */

export type CrawlSourceStatus = 'pending' | 'approved' | 'disabled'

export type CrawlLogStatus = 'success' | 'failed' | 'duplicate' | 'skipped'

export interface NewsSource {
  id: number
  name: string
  domain: string
  rssUrl: string | null
  listUrl: string | null
  listItemSelector: string | null
  titleSelector: string | null
  contentSelector: string | null
  publishTimeSelector: string | null
  defaultCategoryId: number | null
  crawlIntervalSeconds: number
  rateLimitMs: number
  status: CrawlSourceStatus
  probeSummary: string | null
  lastCrawlAt: string | null
  createdAt: string
  updatedAt: string
}

export interface NewsSourceInput {
  name: string
  domain: string
  rssUrl?: string | null
  listUrl?: string | null
  listItemSelector?: string | null
  titleSelector?: string | null
  contentSelector?: string | null
  publishTimeSelector?: string | null
  defaultCategoryId?: number | null
  crawlIntervalSeconds?: number
  rateLimitMs?: number
}

export interface CrawlLog {
  id: number
  sourceId: number
  url: string
  urlHash: string
  title: string
  status: CrawlLogStatus
  errorMsg: string | null
  costMs: number
  createdAt: string
}

export interface CrawlResult {
  sourceId: number
  sourceName: string
  discovered: number
  success: number
  failed: number
  duplicate: number
  intervalSkipped: number
  error: string | null
}
