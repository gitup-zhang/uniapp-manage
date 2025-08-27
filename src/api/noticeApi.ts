import request from '@/utils/http'
import {
  NoticeListResponse,
  Notice,
  CreateNoticeRequest,
  UpdateNoticeRequest
} from '@/api/modules/notice'

export class NoticeService {
  // 获取公告列表
  static getNoticeList(params: any) {
    return request.get<NoticeListResponse>({
      url: '/api/notice',
      params
    })
  }

  // 获取公告详情
  static getNoticeDetail(id: number) {
    return request.get<Notice>({
      url: `/api/notice/${id}`
    })
  }

  // 创建公告
  static createNotice(data: CreateNoticeRequest) {
    return request.post<Notice>({
      url: '/api/notice',
      data
    })
  }

  // 更新公告
  static updateNotice(data: UpdateNoticeRequest) {
    return request.put<Notice>({
      url: `/api/notice/${data.id}`,
      data
    })
  }

  // 删除公告
  static deleteNotice(id: number) {
    return request.del({
      url: `/api/notice/${id}`
    })
  }
}
