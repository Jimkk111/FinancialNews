import { get, post, del, getPaginated } from './request'
import type { PaginatedResponse } from './request'
import type { NewsSource, NewsSourceInput, CrawlLog, CrawlResult } from '@/types/crawler'

export function getSources(): Promise<NewsSource[]> {
  return get<NewsSource[]>('/crawler/sources')
}

export function createSource(data: NewsSourceInput): Promise<NewsSource> {
  return post<NewsSource>('/crawler/sources', data)
}

export function probeSource(domain: string): Promise<NewsSource> {
  return post<NewsSource>('/crawler/sources/probe', null, { params: { domain } })
}

export function approveSource(id: number): Promise<NewsSource> {
  return post<NewsSource>(`/crawler/sources/${id}/approve`)
}

export function disableSource(id: number): Promise<NewsSource> {
  return post<NewsSource>(`/crawler/sources/${id}/disable`)
}

export function deleteSource(id: number): Promise<null> {
  return del<null>(`/crawler/sources/${id}`)
}

export function runCrawl(sourceId?: number): Promise<CrawlResult[]> {
  return post<CrawlResult[]>('/crawler/run', null, {
    params: sourceId != null ? { sourceId } : undefined,
    // 采集为同步长耗时接口，覆盖全局 10s 超时
    timeout: 600000,
  })
}

export function getCrawlLogs(params: {
  page?: number
  pageSize?: number
  sourceId?: number
}): Promise<PaginatedResponse<CrawlLog>> {
  return getPaginated<CrawlLog>('/crawler/logs', { params })
}
