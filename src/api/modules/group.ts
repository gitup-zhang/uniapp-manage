// 单个群组信息
export interface GroupItem {
  id: number // 群组ID
  group_name: string // 群名
  desc: string // 群描述
  event_id: number // 关联活动ID
  event_title: string // 关联活动标题
  include_all_user: string // 是否包含全体用户（Y/N）
  is_deleted: string // 软删除标志（Y/N）
}

// 响应结构
export interface GroupResponse {
  data: GroupItem[]
  page: number
  page_size: number
  total: number
}
