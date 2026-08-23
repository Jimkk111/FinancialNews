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
  return post<CrawlResponse>('/crawler/crawl', data)
}
