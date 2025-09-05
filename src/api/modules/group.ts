// 单个群组信息
export interface GroupItem {
  id: number // 群组ID
  group_name: string // 群名
  desc: string // 群描述
  event_id: number // 关联活动ID
  event_title: string // 关联活动标题
  include_all_user: string // 是否包含全体用户（Y/N）
  is_deleted: string // 软删除标志（Y/N）
  created_at?: string // 创建时间
  updated_at?: string // 更新时间
  member_count?: number // 成员数量
}

// 群组成员信息
export interface GroupMember {
  user_id: number // 用户ID
  nickname: string // 昵称
  name: string // 姓名
  email: string // 邮箱
  phone_number: string // 手机号
  gender: string // 性别
  unit: string // 单位
  department: string // 部门
  position: string // 岗位
  industry_name: string // 行业
  role_name: string // 角色
  joined_at?: string // 加入时间
}

// 响应结构
export interface GroupResponse {
  data: GroupItem[]
  page: number
  page_size: number
  total: number
}

// 群组详情响应
export interface GroupDetailResponse {
  data: GroupItem
}

// 群组成员响应
export interface GroupMembersResponse {
  data: GroupMember[]
  page: number
  page_size: number
  total: number
}
// 群组内的单条消息信息
export interface MessageInfo {
  id: number // 消息ID
  map_id?: number // 消息-群组映射ID
  title: string // 标题
  content: string // 内容
  send_time: string // 发送时间（建议用 ISO 字符串，如 "2025-09-04T12:00:00Z"）
}

// 群组的全部信息
export interface MessageListResponse {
  data: MessageInfo[] // 消息列表
  page: number // 当前页码
  page_size: number // 每页大小
  total: number // 总条数
}
