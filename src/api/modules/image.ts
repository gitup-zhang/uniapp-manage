// 文件上传返回的数据结构
export interface UploadFileResponse {
  code: number
  data: UploadFileData
  message: string
}

// data 字段的具体内容
export interface UploadFileData {
  id: number
  article_id?: number
  object_name: string // MinIO 中的对象名
  url: string // 图片 url 地址
  file_name: string // 图片原始名称
  file_size: number // 文件大小（字节数）
  content_type: string // 文件 MIME 类型
  file_type: string // 文件分类（比如 image / video / doc）
  upload_user_id: number // 上传用户 id
}
