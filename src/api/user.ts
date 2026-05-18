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
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me/avatar`, {
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

export async function changePassword(data: {
  old_password: string
  new_password: string
}): Promise<MessageResponse> {
  return post<MessageResponse>('/users/me/password', data)
}
