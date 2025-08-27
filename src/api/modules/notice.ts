// 单个公告的类型
export interface Notice {
  id: number // 公告id
  title: string // 公告标题
  content: string // 公告内容
  status: 'published' // 公告状态：已发布
  create_time: string // 创建时间
  update_time: string // 更新时间
  publish_time?: string // 发布时间
  author: string // 作者
  views: number // 浏览次数
}

// 分页响应的类型
export interface PaginatedResponse<T> {
  data: T[] // 当前页的数据
  page: number // 当前页码
  page_size: number // 每页大小
  total: number // 总数
}

// 公告列表接口的响应
export type NoticeListResponse = PaginatedResponse<Notice>

// 创建公告的请求参数
export interface CreateNoticeRequest {
  title: string
  content: string
}

// 更新公告的请求参数
export interface UpdateNoticeRequest extends Partial<CreateNoticeRequest> {
  id: number
}
