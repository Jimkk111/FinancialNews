export interface UserInfo {
  uid: string
  displayId: string
  username: string
  email: string
  avatar: string | null
  createdAt: string
  updatedAt: string
  id?: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  code: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: UserInfo
}

export interface ResetPasswordRequest {
  username: string
  email: string
  code: string
  password: string
}

export interface MessageResponse {
  message: string
}

export interface AvatarUploadResponse {
  avatar: string
}

export interface CheckFavoriteResponse {
  is_favorite: boolean
}
