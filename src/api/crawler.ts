import { post } from './request'

export interface CrawlResponse {
  role: string
  content: string
  sessionId: string
}

export interface CrawlRequest {
  instruction: string
  sessionId?: string
}

export async function crawlNews(data: CrawlRequest): Promise<CrawlResponse> {
  return post<CrawlResponse>('/crawler/crawl', data, {
    timeout: 120000, // 爬虫操作耗时较长，单独设置 2 分钟超时
  })
}
