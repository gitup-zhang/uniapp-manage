import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ActivityService } from '@/api/activityApi'
import { Activity } from '@/api/modules/activity'

export const useActivityStore = defineStore('activity', () => {
  // 数据
  const ActivityListing = ref<Activity[]>([])
  const ActivityTotal = ref(0)

  const getActivityList = async (params: any) => {
    try {
      const res = await ActivityService.getActivityList(params)
      ActivityListing.value = res.data
      ActivityTotal.value = res.total
    } catch (e) {
      console.log(e)
    }
  }
  return {
    ActivityListing,
    ActivityTotal,
    getActivityList
  }
})
