/**
 * AI 微服务相关类型定义
 */

// ============ 索引请求 ============

/** 文章索引请求 */
export interface ArticleIndexRequest {
  article_id: number
  article_title: string
  article_content?: string
  brief_content?: string
  article_type?: string
  field_name?: string
}

/** 活动索引请求 */
export interface EventIndexRequest {
  id: number
  title: string
  detail?: string
  event_address?: string
  event_start_time?: string
  event_end_time?: string
  registration_fee?: number | string
}

// ============ 响应 ============

/** 索引操作响应 */
export interface IndexResponse {
  success: boolean
  message: string
  count?: number
}

/** 向量库状态响应 */
export interface IndexStatusResponse {
  articles_count: number
  events_count: number
  chroma_db_path: string
}
