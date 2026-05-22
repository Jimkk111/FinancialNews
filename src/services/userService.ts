import type {
  ApiResponse,
  UserInfo,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  MessageResponse,
  AvatarUploadResponse,
  CheckFavoriteResponse,
  NewsItem,
  NewsDataBase,
} from '@/types'
import * as authApi from '@/api/auth'
import * as userApi from '@/api/user'
import * as favoriteApi from '@/api/favorite'
import * as historyApi from '@/api/history'
import type { PaginatedResponse } from '@/api/request'

export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await authApi.login(credentials)
    return { success: true, data: response.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '登录失败'
    return {
      success: false,
      error: { code: 'LOGIN_ERROR', message }
    }
  }
}

export async function register(
  userData: RegisterRequest
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await authApi.register(userData)
    return { success: true, data: response.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '注册失败'
    return {
      success: false,
      error: { code: 'REGISTER_ERROR', message }
    }
  }
}

export async function sendCode(
  email: string,
  username?: string
): Promise<ApiResponse<MessageResponse>> {
  try {
    const data = await authApi.sendVerificationCode(email, username)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '发送验证码失败'
    return {
      success: false,
      error: { code: 'SEND_CODE_ERROR', message }
    }
  }
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ApiResponse<MessageResponse>> {
  try {
    const result = await authApi.resetPassword(data)
    return { success: true, data: result }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '重置密码失败'
    return {
      success: false,
      error: { code: 'RESET_PASSWORD_ERROR', message }
    }
  }
}

export async function uploadAvatar(
  file: File
): Promise<ApiResponse<AvatarUploadResponse>> {
  try {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: '请选择有效的图片文件（PNG、JPEG、GIF、WebP）'
        }
      }
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: '图片大小不能超过 5MB'
        }
      }
    }

    const data = await userApi.uploadAvatar(file)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '上传头像失败'
    return {
      success: false,
      error: { code: 'UPLOAD_ERROR', message }
    }
  }
}

export async function addFavorite(
  newsId: number,
  newsData?: NewsDataBase
): Promise<ApiResponse<MessageResponse>> {
  if (!newsData) {
    return {
      success: false,
      error: { code: 'MISSING_DATA', message: '缺少新闻数据' }
    }
  }

  try {
    const data = await favoriteApi.addFavorite({
      newsId,
      title: newsData.title,
      source: newsData.source,
      publish_time: newsData.publish_time,
      views: newsData.views
    })
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '收藏失败'
    return {
      success: false,
      error: { code: 'FAVORITE_ERROR', message }
    }
  }
}

export async function removeFavorite(
  newsId: number
): Promise<ApiResponse<MessageResponse>> {
  try {
    const data = await favoriteApi.removeFavorite(newsId)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '取消收藏失败'
    return {
      success: false,
      error: { code: 'UNFAVORITE_ERROR', message }
    }
  }
}

export async function getFavorites(
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<NewsItem>>> {
  try {
    const data = await favoriteApi.getFavorites({ page, pageSize })
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取收藏列表失败'
    return {
      success: false,
      error: { code: 'GET_FAVORITES_ERROR', message }
    }
  }
}

export async function checkFavorite(
  newsId: number
): Promise<ApiResponse<CheckFavoriteResponse>> {
  try {
    const data = await favoriteApi.checkFavorite(newsId)
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '检查收藏状态失败'
    return {
      success: false,
      error: { code: 'CHECK_FAVORITE_ERROR', message }
    }
  }
}

export async function addHistory(
  newsId: number,
  newsData?: NewsDataBase
): Promise<ApiResponse<MessageResponse>> {
  if (!newsData) {
    return {
      success: false,
      error: { code: 'MISSING_DATA', message: '缺少新闻数据' }
    }
  }

  try {
    const data = await historyApi.addHistory({
      newsId,
      title: newsData.title,
      source: newsData.source,
      publish_time: newsData.publish_time,
      views: newsData.views
    })
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '添加历史记录失败'
    return {
      success: false,
      error: { code: 'ADD_HISTORY_ERROR', message }
    }
  }
}

export async function getHistory(
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<NewsItem>>> {
  try {
    const data = await historyApi.getHistory({ page, pageSize })
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取历史记录失败'
    return {
      success: false,
      error: { code: 'GET_HISTORY_ERROR', message }
    }
  }
}

export async function clearHistory(): Promise<ApiResponse<MessageResponse>> {
  try {
    const data = await historyApi.clearHistory()
    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '清空历史记录失败'
    return {
      success: false,
      error: { code: 'CLEAR_HISTORY_ERROR', message }
    }
  }
}

export type { UserInfo, RegisterRequest, LoginRequest, LoginResponse, ResetPasswordRequest, MessageResponse, AvatarUploadResponse, CheckFavoriteResponse, NewsItem }
