/**
 * 文章相关类型定义
 */

// 文章类型 (新命名规范)
export interface Article {
  id?: number
  blogClass: string
  title: string
  count?: number
  htmlContent: string
  createTime: string
  homeImg: string
  brief: string
  typeName?: string
  status?: number
  author?: string
  tags?: string[]
}

// 兼容原有的文章类型命名
export interface ArticleType {
  article_id: number // 文章ID
  article_title: string // 标题
  article_type_code: string // 类型编码，例如 POLICY
  article_type: string // 类型名称，例如 政策
  field_name: string // 所属领域
  release_time: string // 发布时间 ISO 格式
  brief_content: string // 摘要内容
  is_selection: number // 是否精选，1 表示精选
  cover_image_url: string // 封面图片 URL
  article_source?: string // 来源，可选字段
}

// 文章分类类型 (新命名规范)
export interface ArticleCategory {
  id: number
  name: string
  icon: string
  count: number
  description?: string
  sortOrder?: number
}

// 兼容原有的文章分类类型命名
export interface ArticleCategoryType {
  id: number
  name: string
  icon: string
  count: number
}

// 文章查询参数
export interface ArticleQueryParams {
  page?: number
  size?: number
  searchVal?: string
  year?: string
  categoryId?: number
  status?: number
}

// 文章创建/更新参数
export interface ArticleFormData {
  blogClass: string
  title: string
  htmlContent: string
  homeImg: string
  brief: string
  author?: string
  tags?: string[]
  status?: number
}
// // 领域类型
// export interface Field {
//   field_id: number
//   field_code: string
//   field_name: string
//   create_time: string | null
//   update_time: string | null
// }
// 单个领域对象的类型
export interface Field {
  field_id: number // 领域id
  field_code: string // 领域类型编码
  field_name: string // 领域类型名称
}

// 响应数据的类型
export interface FieldListResponse {
  data: Field[] // 领域数组
}
// 单条文章对象
export interface Article {
  article_id: number // 文章id
  article_title: string // 文章标题
  field_name: string // 领域类型
  release_time: string // 发布时间，建议ISO字符串
  article_content: string // 文章内容
  article_type_code: 'POLICY' | 'NEWS' // 文章类型编码
  article_type: string // 文章类型（政策，新闻）
}

// 接口响应
export interface ArticleResponse {
  data: Article
}
