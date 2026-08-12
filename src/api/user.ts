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
  return post<{ avatar: string }>('/users/me/avatar', formData)
}

export async function changePassword(data: {
  old_password: string
  new_password: string
}): Promise<MessageResponse> {
  return post<MessageResponse>('/users/me/password', data)
}
