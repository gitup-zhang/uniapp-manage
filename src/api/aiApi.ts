/**
 * AI 微服务 API
 *
 * 独立的 axios 实例，不复用主 HTTP 工具（AI 服务响应格式与 Java 后端不同）。
 * 所有方法采用 fire-and-forget 模式调用，失败不阻塞主业务。
 */

import axios from 'axios'
import type {
  ArticleIndexRequest,
  EventIndexRequest,
  IndexResponse,
  IndexStatusResponse
} from './modules/ai'

// 创建独立的 axios 实例，专门用于 AI 微服务
const aiAxios = axios.create({
  baseURL: import.meta.env.DEV ? '/ai-api' : import.meta.env.VITE_AI_API_URL,
  timeout: 30000, // AI 操作可能较慢，给 30s
  headers: {
    'Content-Type': 'application/json'
  }
})

export class AIService {
  // ============ 文章索引 ============

  /** 写入/更新文章索引 */
  static async indexArticle(data: ArticleIndexRequest): Promise<IndexResponse> {
    const res = await aiAxios.post<IndexResponse>('/api/ai/index/article', data)
    return res.data
  }

  /** 删除文章索引 */
  static async deleteArticleIndex(articleId: string | number): Promise<IndexResponse> {
    const res = await aiAxios.delete<IndexResponse>(`/api/ai/index/article/${articleId}`)
    return res.data
  }

  // ============ 活动索引 ============

  /** 写入/更新活动索引 */
  static async indexEvent(data: EventIndexRequest): Promise<IndexResponse> {
    const res = await aiAxios.post<IndexResponse>('/api/ai/index/event', data)
    return res.data
  }

  /** 删除活动索引 */
  static async deleteEventIndex(eventId: string | number): Promise<IndexResponse> {
    const res = await aiAxios.delete<IndexResponse>(`/api/ai/index/event/${eventId}`)
    return res.data
  }

  // ============ 状态查询 ============

  /** 查询向量库状态 */
  static async getIndexStatus(): Promise<IndexStatusResponse> {
    const res = await aiAxios.get<IndexStatusResponse>('/api/ai/index/status')
    return res.data
  }

  /** 获取已索引文章列表 */
  static async listArticleIndex(): Promise<{ items: any[]; total: number }> {
    const res = await aiAxios.get('/api/ai/index/articles')
    return res.data
  }

  /** 获取已索引活动列表 */
  static async listEventIndex(): Promise<{ items: any[]; total: number }> {
    const res = await aiAxios.get('/api/ai/index/events')
    return res.data
  }

  /** 清空某类型的所有索引 */
  static async clearIndex(contentType: 'article' | 'event'): Promise<IndexResponse> {
    const res = await aiAxios.delete<IndexResponse>(`/api/ai/index/clear/${contentType}`)
    return res.data
  }
}
