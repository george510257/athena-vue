import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface PhoneLoginParams {
  phone: string
  code: string
}

export interface LoginResult {
  token: string
  userInfo: {
    id: number
    username: string
    role: string
  }
}

export const login = (data: LoginParams) => {
  return request.post<LoginResult>('/auth/login', data)
}

export const sendCode = (phone: string) => {
  return request.post('/auth/sendCode', { phone })
}

export const phoneLogin = (data: PhoneLoginParams) => {
  return request.post<LoginResult>('/auth/phoneLogin', data)
} 