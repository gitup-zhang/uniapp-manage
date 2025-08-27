import request from '@/utils/http'
import { ActivityListResponse } from '@/api/modules/activity'

export class ActivityService {
  static getActivityList(params: any) {
    return request.get<ActivityListResponse>({
      url: '/api/event',
      params
    })
  }
}
