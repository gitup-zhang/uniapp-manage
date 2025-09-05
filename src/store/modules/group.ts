import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupService } from '@/api/groupApi'
import { GroupItem, MessageInfo } from '@/api/modules/group'
import { UserService } from '@/api/usersApi'
import { UseInfo } from '@/api/modules/user'
export const useGroupStore = defineStore('group', () => {
  const groupList = ref<GroupItem[]>([])
  const groupTotal = ref(0)
  // 全部用户信息
  const userList = ref<UseInfo[]>([])
  const userTotal = ref(0)
  // 群组的消息列表
  const MessageList = ref<MessageInfo[]>([])
  const MessageTotal = ref(0)
  // 不在群组的用户列表
  const notInGroupMembers = ref<UseInfo[]>([])
  const notInGroupTotal = ref(0)
  // 在群组中的用户列表
  const groupMembers = ref<UseInfo[]>([])
  const groupMemberTotal = ref(0)
  const getGroupList = async (params: any) => {
    try {
      const res = await groupService.getGroupList(params)
      groupList.value = res.data
      groupTotal.value = res.total
      console.log('群组列表：', groupList.value)
    } catch (e) {
      console.log(e)
    }
  }
  // 获取全部用户信息列表
  const getUserInfoList = async (params: any) => {
    try {
      const res = await UserService.getUserList(params)
      console.log('用户信息列表：', res)
      userList.value = res.data || []
      userTotal.value = res.total || 0
    } catch (error) {
      console.error('获取用户列表失败:', error)
      userList.value = []
      userTotal.value = 0
    }
  }
  // 获取某个群组的全部已发消息
  const getGroupMessage = async (id: number, params: any) => {
    try {
      const res = await groupService.getGroupMessage(id, params)
      MessageList.value = res.data
      MessageTotal.value = res.total
      console.log('群组消息列表：', res)
    } catch (error) {
      console.error('获取群组消息列表失败:', error)
    }
  }
  // 获取某个群组全部用户列表
  const getGroupMembers = async (id: number, params: any) => {
    try {
      const res = await groupService.getGroupMembers(id, params)
      groupMembers.value = res.data
      groupMemberTotal.value = res.total
      console.log('群组成员列表：', res)
    } catch (error) {
      console.error('获取群组成员列表失败:', error)
    }
  }
  // 获取不在某个群组的全部用户
  const getNotInGroupMembers = async (id: number, params: any) => {
    try {
      const res = await groupService.getNotInGroupMembers(id, params)
      notInGroupMembers.value = res.data
      notInGroupTotal.value = res.total
      console.log('不在群组内的用户列表：', res)
    } catch (error) {
      console.error('获取不在群组内的用户列表失败:', error)
    }
  }
  return {
    groupList,
    groupTotal,
    userList,
    userTotal,
    MessageList,
    MessageTotal,
    notInGroupMembers,
    notInGroupTotal,
    groupMembers,
    groupMemberTotal,

    getGroupList,
    getUserInfoList,
    getGroupMessage,
    getGroupMembers,
    getNotInGroupMembers
  }
})
