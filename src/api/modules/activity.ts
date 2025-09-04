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
  status: string
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

interface EventImage {
  image_id: number // 图片ID
  url: string // 图片地址
}

// 活动详情接口
export interface EventDetail {
  id?: number
  title: string // 活动标题
  detail: string // 活动详情
  event_start_time: string // 活动开始时间，例如 "2025-08-28 10:00:00"
  event_end_time: string // 活动结束时间
  registration_start_time: string // 报名开始时间
  registration_end_time: string // 报名截止时间
  event_address: string // 活动地点
  registration_fee: number // 报名费用
  cover_image_url: string // 封面图片URL
  images: EventImage[] // 关联图片列表
}
export interface EventDetailApi {
  data: EventDetail
}
// 活动报名的人接口
// 单个用户信息
export interface UserInfo {
  nickname: string // 昵称
  name: string // 姓名
  gender_code: string // 性别代码，例如：M / F
  gender: string // 性别名称，例如：男 / 女
  phone_number: string // 手机号
  email: string // 邮箱
  unit: string // 单位
  department: string // 部门
  position: string // 职位
  industry: string // 行业代码或分类
  industry_name: string // 行业名称
}

// 接口返回结构
export interface UserListResponse {
  data: UserInfo[] // 用户列表数据
  page: number // 当前页码
  page_size: number // 每页大小
  total: number // 总条数
}
