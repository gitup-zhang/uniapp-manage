import request from '@/utils/http'
import { ActivityListResponse, EventDetailApi, UserListResponse } from '@/api/modules/activity'

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
    return request.get<EventDetailApi>({
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
  // 获取活动已报名的人
  static getActivityEnrollList(id: number, pageParams?: { page?: number; page_size?: number }) {
    return request.get<UserListResponse>({
      url: `/api/event/regUsers/${id}`,
      params: pageParams
    })
  }
}
