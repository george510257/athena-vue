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

// 社交登录类型
export type SocialType = 'wechat' | 'feishu'

// 获取社交登录二维码
export const getSocialQrCode = (type: SocialType) => {
  return request.get<{ qrCode: string, state: string }>(`/auth/${type}/qrcode`)
}

// 检查扫码状态
export const checkScanStatus = (type: SocialType, state: string) => {
  return request.get<LoginResult>(`/auth/${type}/check`, { params: { state } })
} 