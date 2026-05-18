import { get, post, put, del, getPaginated } from './request'
import type { PaginatedResponse } from './request'
import type { NewsDraft, PublishedNews, MessageResponse } from '@/types'

export async function getDrafts(): Promise<NewsDraft[]> {
  return get<NewsDraft[]>('/drafts')
}

export async function getDraft(id: string): Promise<NewsDraft> {
  return get<NewsDraft>(`/drafts/${id}`)
}

export async function createDraft(draft: {
  title: string
  content?: string | null
  coverImage?: string | null
  categoryId?: number | null
}): Promise<NewsDraft> {
  return post<NewsDraft>('/drafts', draft)
}

export async function updateDraft(id: string, draft: {
  title?: string
  content?: string | null
  coverImage?: string | null
  categoryId?: number | null
}): Promise<NewsDraft> {
  return put<NewsDraft>(`/drafts/${id}`, draft)
}

export async function deleteDraft(id: string): Promise<MessageResponse> {
  return del<MessageResponse>(`/drafts/${id}`)
}

export async function publishDraft(draftId: string): Promise<PublishedNews> {
  return post<PublishedNews>(`/drafts/${draftId}/publish`)
}

export async function getPublishedNews(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<PublishedNews>> {
  return getPaginated<PublishedNews>(`/users/me/news?page=${page}&pageSize=${pageSize}`)
}

export async function getPublishedNewsById(id: number): Promise<PublishedNews> {
  return get<PublishedNews>(`/news/published/${id}`)
}

export async function deletePublishedNews(id: number): Promise<MessageResponse> {
  return del<MessageResponse>(`/news/published/${id}`)
}

export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || '上传失败')
  }
  
  return result.data
}

export async function uploadVideo(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData()
  formData.append('video', file)
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || '上传失败')
  }
  
  return result.data
}
