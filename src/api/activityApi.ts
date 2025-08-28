import request from '@/utils/http'
import { ActivityListResponse, EventDetail } from '@/api/modules/activity'

export class ActivityService {
  // 获取活动列表
  static getActivityList(params: any) {
    return request.get<ActivityListResponse>({
      url: '/api/event',
      params
    })
  }
  // 创建活动
  static createActivity(params: any) {
    return request.post({
      url: '/api/event/create',
      params
    })
  }
  // 活动详情
  static getActivityDetail(params: number) {
    return request.get<EventDetail>({
      url: `/api/event/${params}`
    })
  }

  // 更新活动
  static updateActivity(id: number, params: any) {
    return request.put({
      url: `/api/event/update/${id}`,
      params
    })
  }
  //删除活动
  static deleteActivity(id: number) {
    return request.del({
      url: `/api/event/delete/${id}`
    })
  }
}
