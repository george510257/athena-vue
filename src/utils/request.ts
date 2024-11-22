import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import type { LoadingInstance } from 'element-plus/lib/components/loading/src/loading'
import router from '@/router'
import { storage } from '@/utils'

interface RequestConfig extends AxiosRequestConfig {
  loading?: boolean
}

class Request {
  private instance: AxiosInstance
  private loading?: LoadingInstance

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const newConfig = config as RequestConfig
        if (newConfig.loading) {
          this.loading = ElLoading.service({
            lock: true,
            text: '加载中...',
            background: 'rgba(0, 0, 0, 0.7)'
          })
        }

        const token = storage.get('token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        this.loading?.close()
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.loading?.close()
        const { code, message, data } = response.data
        
        if (code === 200) {
          return data
        }
        
        ElMessage.error(message || '请求失败')
        return Promise.reject(new Error(message || '请求失败'))
      },
      (error) => {
        this.loading?.close()
        
        if (error.response?.status === 401) {
          storage.remove('token')
          storage.remove('userInfo')
          router.push('/login')
          ElMessage.error('登录已过期，请重新登录')
        } else {
          ElMessage.error(error.message || '网络错误')
        }
        
        return Promise.reject(error)
      }
    )
  }

  request<T = any>(config: RequestConfig): Promise<T> {
    return this.instance.request(config)
  }

  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }
}

export default new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}) 