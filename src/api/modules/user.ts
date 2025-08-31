// 单个用户信息
export interface UserInfo {
  user_id: number // 用户ID
  nickname: string // 昵称
  name: string // 姓名
  gender_code: string // 性别代码
  gender: string // 性别
  phone_number: string // 手机号
  email: string // 邮箱
  unit: string // 单位
  department: string // 部门
  position: string // 岗位
  industry: string // 行业代码
  industry_name: string // 行业名称
  role_name: string // 用户角色
}

// 返回的分页数据
export interface UserListResponse {
  data: UserInfo[]
  page: number // 当前页码
  page_size: number // 每页条数
  total: number // 总数
}
