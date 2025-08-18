import axios, { InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError } from './error'
import { $t } from '@/locales'

// 常量定义
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 1000
const MAX_RETRIES = 2
const RETRY_DELAY = 1000

// 扩展 AxiosRequestConfig 类型
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

// 创建 Axios 实例
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: import.meta.env.DEV ? '' : VITE_API_URL, // 开发环境走代理
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType && contentType.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()

    if (accessToken) {
      request.headers.set('Authorization', accessToken)
    }

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(new HttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

// 响应拦截器：直接返回响应数据
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(handleError(error))
)

// 请求函数
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // 对 POST | PUT 请求特殊处理
  if (config.method?.toUpperCase() === 'POST' || config.method?.toUpperCase() === 'PUT') {
    if (config.params && !config.data) {
      config.data = config.params
      config.params = undefined
    }
  }

  try {
    const res = await axiosInstance.request<T>(config)
    return res as T // 直接返回拦截器处理后的数据
  } catch (error) {
    if (error instanceof HttpError) {
      const showErrorMessage = config.showErrorMessage !== false
      showError(error, showErrorMessage)
    }
    return Promise.reject(error)
  }
}

// 请求重试函数
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

// 判断是否需要重试
function shouldRetry(statusCode: number): boolean {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

// 退出登录函数
// const logOut = (): void => {
//   setTimeout(() => {
//     useUserStore().logOut()
//   }, LOGOUT_DELAY)
// }

// API 方法集合
const api = {
  get<T>(config: ExtendedAxiosRequestConfig): Promise<T> {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig): Promise<T> {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig): Promise<T> {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig): Promise<T> {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig): Promise<T> {
    return retryRequest<T>({ ...config })
  }
}

export default api
