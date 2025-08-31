import request from '@/utils/http'
import { GroupResponse } from '@/api/modules/group'
export class groupService {
  static getGroupList(params: any) {
    return request.get<GroupResponse>({
      url: '/api/message/messageGroups',
      params
    })
  }
  static createGroup(params: any) {
    return request.post({
      url: '/api/message/createGroup',
      params
    })
  }
}
