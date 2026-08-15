import type { ApiResponse, PaginationInfo } from '@/types'
import type { NewsSource, NewsSourceInput, CrawlLog, CrawlResult } from '@/types/crawler'
import type { PaginatedResponse } from '@/api/request'
import { ApiError } from '@/api/request'
import * as crawlerApi from '@/api/crawler'

/** 保留后端业务错误码（如 CRAWL_AGENT_UNAVAILABLE），便于前端按类型区分处理 */
function toError(error: unknown, fallback: string): { code: string; message: string } {
  if (error instanceof ApiError) return { code: error.code, message: error.message }
  return { code: 'UNKNOWN', message: error instanceof Error ? error.message : fallback }
}

export async function getSourcesService(): Promise<ApiResponse<NewsSource[]>> {
  try {
    const data = await crawlerApi.getSources()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: toError(error, '获取数据源列表失败') }
  }
}

export async function createSourceService(input: NewsSourceInput): Promise<ApiResponse<NewsSource>> {
  try {
    const data = await crawlerApi.createSource(input)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: toError(error, '登记数据源失败') }
  }
}

export async function probeSourceService(domain: string): Promise<ApiResponse<NewsSource>> {
  try {
    const data = await crawlerApi.probeSource(domain)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: toError(error, '探测失败') }
  }
}

export async function approveSourceService(id: number): Promise<ApiResponse<NewsSource>> {
  try {
    const data = await crawlerApi.approveSource(id)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: toError(error, '审核失败') }
  }
}

export async function disableSourceService(id: number): Promise<ApiResponse<NewsSource>> {
  try {
    const data = await crawlerApi.disableSource(id)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: toError(error, '停用失败') }
  }
}

export async function deleteSourceService(id: number): Promise<ApiResponse<null>> {
  try {
    await crawlerApi.deleteSource(id)
    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: toError(error, '删除失败') }
  }
}

export async function runCrawlService(sourceId?: number): Promise<ApiResponse<CrawlResult[]>> {
  try {
    const data = await crawlerApi.runCrawl(sourceId)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: toError(error, '采集失败') }
  }
}

export async function getCrawlLogsService(
  page: number = 1,
  pageSize: number = 20,
  sourceId?: number,
): Promise<ApiResponse<CrawlLog[]> & { pagination?: PaginationInfo }> {
  try {
    const result: PaginatedResponse<CrawlLog> = await crawlerApi.getCrawlLogs({ page, pageSize, sourceId })
    return { success: true, data: result.data, pagination: result.pagination }
  } catch (error) {
    return { success: false, error: toError(error, '获取日志失败') }
  }
}
