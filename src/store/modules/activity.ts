import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ActivityService } from '@/api/activityApi'
import { Activity, EventDetail } from '@/api/modules/activity'

export const useActivityStore = defineStore('activity', () => {
  // 数据
  const ActivityListing = ref<Activity[]>([])
  const ActivityTotal = ref(0)
  const ActivityDetail = ref<EventDetail>({
    id: 0,
    title: '',
    detail: '',
    event_start_time: '',
    event_end_time: '',
    registration_start_time: '',
    registration_end_time: '',
    event_address: '',
    registration_fee: 0,
    images: []
  })

  const getActivityList = async (params: any) => {
    try {
      const res = await ActivityService.getActivityList(params)
      ActivityListing.value = res.data
      ActivityTotal.value = res.total
    } catch (e) {
      console.log(e)
    }
  }
  const getActivityDetail = async (params: number) => {
    try {
      const res = await ActivityService.getActivityDetail(params)
      ActivityDetail.value = res
    } catch (e) {
      console.log(e)
    }
  }
  return {
    ActivityListing,
    ActivityTotal,
    getActivityList,
    getActivityDetail,
    ActivityDetail
  }
})
