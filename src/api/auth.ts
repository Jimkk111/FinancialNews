import { post } from './request'
import type { LoginRequest, LoginResponse, RegisterRequest, MessageResponse } from '@/types'

interface BackendResponse<T> {
  success: boolean
  data: T
  message?: string
}

export async function login(data: LoginRequest): Promise<BackendResponse<LoginResponse>> {
  return post<BackendResponse<LoginResponse>>('/auth/login', data)
}

export async function register(data: RegisterRequest): Promise<BackendResponse<LoginResponse>> {
  return post<BackendResponse<LoginResponse>>('/auth/register', data)
}

export async function sendVerificationCode(email: string, username?: string): Promise<MessageResponse> {
  return post<MessageResponse>('/auth/send-code', { email, username }, { timeout: 30000 })
}

export async function resetPassword(data: {
  username: string
  email: string
  code: string
  password: string
}): Promise<MessageResponse> {
  return post<MessageResponse>('/auth/reset-password', data)
}

export async function logout(): Promise<MessageResponse> {
  return post<MessageResponse>('/auth/logout')
}
