// 单个活动的类型
export interface Activity {
  id: number // 活动id
  title: string // 标题
  event_start_time: string // 活动开始时间，建议后端返回ISO时间字符串
  event_end_time: string // 活动结束时间
  registration_start_time: string // 报名开始时间
  registration_end_time: string // 报名截止时间
  event_address: string // 活动地点
  registration_fee: number // 报名费用
  cover_image_url: string // 封面图片url
}

// 分页响应的类型
export interface PaginatedResponse<T> {
  data: T[] // 当前页的数据
  page: number // 当前页码
  page_size: number // 每页大小
  total: number // 总数
}

// 活动列表接口的响应
export type ActivityListResponse = PaginatedResponse<Activity>
