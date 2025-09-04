import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupService } from '@/api/groupApi'
import { GroupItem } from '@/api/modules/group'
import { UserService } from '@/api/usersApi'
import { UserInfo } from '@/api/modules/user'
export const useGroupStore = defineStore('group', () => {
  const groupList = ref<GroupItem[]>([])
  const groupTotal = ref(0)

  const userList = ref<UserInfo[]>([])
  const userTotal = ref(0)
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
  // 获取用户信息列表
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
  return {
    groupList,
    groupTotal,
    userList,
    userTotal,

    getGroupList,
    getUserInfoList
  }
})
