import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserService } from '@/api/usersApi'
import { UseInfo } from '@/api/modules/user'
export const useAdminStore = defineStore('admin', () => {
  const adminlist = ref<UseInfo[]>([])
  const admintotal = ref(0)

  const getAdmin = async (params: any) => {
    const res = await UserService.getUserList(params)
    adminlist.value = res.data
    admintotal.value = res.total
  }

  return { adminlist, admintotal, getAdmin }
})
