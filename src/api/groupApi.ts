import request from '@/utils/http'
import { GroupResponse, GroupDetailResponse } from '@/api/modules/group'
import { UserListResponse } from '@/api/modules/user'
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
  static updateGroup(params: any, id: number) {
    return request.put({
      url: `/api/message/updateGroup/${id}`,
      params
    })
  }
  static deleteGroup(id: number) {
    return request.del({
      url: `/api/message/deleteGroup/${id}`
    })
  }
  // 获取群组详情
  static getGroupDetail(id: number) {
    return request.get<GroupDetailResponse>({
      url: `/api/message/messageGroups/${id}`
    })
  }
  // 获取群组成员列表
  static getGroupMembers(id: number, params: any) {
    return request.get<UserListResponse>({
      url: `/api/message/groupUsers/${id}`,
      params
    })
  }
}
