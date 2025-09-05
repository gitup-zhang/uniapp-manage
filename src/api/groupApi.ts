import request from '@/utils/http'
import { GroupResponse, GroupDetailResponse, MessageListResponse } from '@/api/modules/group'
import { UseListResponse } from '@/api/modules/user'
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
  // 删除群组
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
    return request.get<UseListResponse>({
      url: `/api/message/groupUsers/${id}`,
      params
    })
  }
  // 获取群组消息
  static getGroupMessage(id: number, params: any) {
    return request.get<MessageListResponse>({
      url: `/api/message/byGroups/${id}`,
      params
    })
  }
  // 发送消息
  static sendMessage(id: number, params: any) {
    return request.post({
      url: `/api/message/sendMessage/${id}`,
      params
    })
  }
  // 删除消息
  static deleteMessage(id: number) {
    return request.del({
      url: `/api/message/revokeMessage/${id}`
    })
  }
  // 获取不在群的成员列表
  static getNotInGroupMembers(id: number, params: any) {
    return request.get<UseListResponse>({
      url: `/api/message/notIngroupUsers/${id}`,
      params
    })
  }
  // 添加群组成员
  static addGroupMembers(id: number, params: any) {
    return request.post({
      url: `/api/message/addUserToGroup/${id}`,
      params
    })
  }
  // 删除群组成员
  static deleteGroupMembers(id: number, data: any) {
    return request.del({
      url: `/api/message/removeUserFromGroup/${id}`,
      data
    })
  }
}
