import { get, put, post } from './request'
import type { UserInfo, MessageResponse } from '@/types'

export async function getUserProfile(): Promise<UserInfo> {
  return get<UserInfo>('/users/me')
}

export async function updateProfile(data: Partial<UserInfo>): Promise<UserInfo> {
  return put<UserInfo>('/users/me', data)
}

export async function uploadAvatar(file: File): Promise<{ avatar: string }> {
  const formData = new FormData()
  formData.append('avatar', file)
  // axios 自动识别 FormData 并设置正确的 Content-Type（含 boundary）
  const result = await post<{
    success: boolean
    data: { avatar: string }
    error?: { message?: string }
  }>('/users/me/avatar', formData)
  if (!result.success) {
    throw new Error(result.error?.message || '上传失败')
  }
  return result.data
}

export async function changePassword(data: {
  old_password: string
  new_password: string
}): Promise<MessageResponse> {
  return post<MessageResponse>('/users/me/password', data)
}
