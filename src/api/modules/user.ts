// 单个用户信息
export interface UseInfo {
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
export interface UseListResponse {
  data: UseInfo[]
  page: number // 当前页码
  page_size: number // 每页条数
  total: number // 总数
}
// 用户数据,用户登录账号
export interface UserData {
  nickname: string // 昵称
  avatar_url: string // 头像url
  name: string // 姓名
  gender: string // 性别
  phone_number: string // 手机号
  email: string // 邮箱地址
  unit: string // 所在单位
  department: string // 部门
  position: string // 职位
  industry: string // 行业编码，关联 industry
  industry_name: string // 行业名称
  role: string[] // 角色标识
  role_name: string // 角色名称
}
interface UserDatate {
  nickname: string
  avatar_url: string
  name: string
  gender: string
  phone_number: string
  email: string
  unit: string
  department: string
  position: string
  industry: string
  industry_name: string
  role: string // 数组
  role_name: string // 数组
}

export interface UserResponse {
  data: UserDatate
}
