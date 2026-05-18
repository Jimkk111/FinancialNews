import type { ApiResponse, NewsDraft, PublishedNews, PaginationInfo } from '@/types'
import type { PaginatedResponse } from '@/api/request'
import * as draftApi from '@/api/draft'

export type { NewsDraft, PublishedNews }

export interface UploadResponse {
  url: string
  filename: string
}

export async function uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: {
        code: 'INVALID_TYPE',
        message: '请选择有效的图片文件（PNG、JPEG、GIF、WebP）',
      },
    }
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: '图片大小不能超过 5MB',
      },
    }
  }

  try {
    const data = await draftApi.uploadImage(file)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '上传图片失败'
    return {
      success: false,
      error: { code: 'UPLOAD_ERROR', message },
    }
  }
}

export async function uploadVideo(file: File): Promise<ApiResponse<UploadResponse>> {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: {
        code: 'INVALID_TYPE',
        message: '请选择有效的视频文件（MP4、WebM、OGG）',
      },
    }
  }

  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: '视频大小不能超过 100MB',
      },
    }
  }

  try {
    const data = await draftApi.uploadVideo(file)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '上传视频失败'
    return {
      success: false,
      error: { code: 'UPLOAD_ERROR', message },
    }
  }
}

export async function getDraftsList(): Promise<ApiResponse<NewsDraft[]>> {
  try {
    const data = await draftApi.getDrafts()
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取草稿列表失败'
    return {
      success: false,
      error: { code: 'GET_DRAFTS_ERROR', message },
    }
  }
}

export async function getDraft(id: string): Promise<ApiResponse<NewsDraft>> {
  try {
    const data = await draftApi.getDraft(id)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取草稿失败'
    return {
      success: false,
      error: { code: 'GET_DRAFT_ERROR', message },
    }
  }
}

export async function createDraftService(draft: {
  title: string
  content?: string | null
  coverImage?: string | null
  categoryId?: number | null
}): Promise<ApiResponse<NewsDraft>> {
  try {
    const data = await draftApi.createDraft(draft)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '创建草稿失败'
    return {
      success: false,
      error: { code: 'CREATE_DRAFT_ERROR', message },
    }
  }
}

export async function updateDraftService(id: string, draft: {
  title?: string
  content?: string | null
  coverImage?: string | null
  categoryId?: number | null
}): Promise<ApiResponse<NewsDraft>> {
  try {
    const data = await draftApi.updateDraft(id, draft)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '更新草稿失败'
    return {
      success: false,
      error: { code: 'UPDATE_DRAFT_ERROR', message },
    }
  }
}

export async function deleteDraftService(id: string): Promise<ApiResponse<null>> {
  try {
    await draftApi.deleteDraft(id)
    return { success: true, data: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '删除草稿失败'
    return {
      success: false,
      error: { code: 'DELETE_DRAFT_ERROR', message },
    }
  }
}

export async function publishNewsService(draft: NewsDraft): Promise<ApiResponse<PublishedNews>> {
  try {
    if (!draft.title.trim()) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '请输入新闻标题' },
      }
    }
    if (!draft.content?.trim()) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '请输入新闻内容' },
      }
    }

    const data = await draftApi.publishDraft(draft.id)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '发布失败'
    return {
      success: false,
      error: { code: 'PUBLISH_ERROR', message },
    }
  }
}

export async function getPublishedList(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<PublishedNews[]> & { pagination?: PaginationInfo }> {
  try {
    const result = await draftApi.getPublishedNews(page, pageSize)
    return { success: true, data: result.data, pagination: result.pagination }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取已发布列表失败'
    return {
      success: false,
      error: { code: 'GET_PUBLISHED_ERROR', message },
    }
  }
}

export async function getPublishedDetail(id: number): Promise<ApiResponse<PublishedNews>> {
  try {
    const data = await draftApi.getPublishedNewsById(id)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取新闻失败'
    return {
      success: false,
      error: { code: 'GET_NEWS_ERROR', message },
    }
  }
}
