import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NoticeService } from '@/api/noticeApi'
import { Notice } from '@/api/modules/notice'
export const useNoticeStore = defineStore('notice', () => {
  const noticeList = ref<Notice[]>([])
  const noticeTotal = ref(0)
  const noticeDetail = ref<Notice>({
    id: 0,
    title: '',
    content: '',
    status: 'published',
    release_time: ''
  })
  // 获取公告列表
  const getNoticeList = async (params: any) => {
    const res = await NoticeService.getNoticeList(params)
    noticeList.value = res.data
    noticeTotal.value = res.total
  }
  // 获取公告详情
  const getNoticeDetail = async (id: number) => {
    const res = await NoticeService.getNoticeDetail(id)
    noticeDetail.value = res.data
  }
  return {
    noticeList,
    noticeTotal,
    noticeDetail,
    getNoticeList,
    getNoticeDetail
  }
})
