<!-- 活动详情 -->
<template>
  <div class="activity-detail-page">
    <ElCard v-loading="loading" shadow="never">
      <template #header>
        <div class="detail-header">
          <ElButton type="primary" :icon="ArrowLeft" @click="handleBack"> 返回列表 </ElButton>
          <div class="header-actions">
            <!-- <ElButton v-if="activityData.status === 'pending'" type="primary" @click="handleEdit">
              编辑活动
            </ElButton>
            <ElButton v-if="activityData.status === 'active'" type="warning" @click="handleEnd">
              结束活动
            </ElButton> -->
            <!-- <ElButton type="danger" @click="handleDelete"> 删除活动 </ElButton> -->
          </div>
        </div>
      </template>

      <div class="activity-detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>基本信息</h3>
            <!-- <ElTag :type="getActivityStatusConfig(activityData.status).type" size="large">
              {{ getActivityStatusConfig(activityData.status).text }}
            </ElTag> -->
          </div>

          <ElRow :gutter="24">
            <ElCol :span="12">
              <div class="detail-item">
                <span class="item-label">活动名称：</span>
                <span class="item-value">{{ activityStore.ActivityDetail.title }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="item-label">活动费用：</span>
                <span class="item-value">{{ activityStore.ActivityDetail.registration_fee }}</span>
              </div>
            </ElCol>
            <!-- <ElCol :span="12">
              <div class="detail-item">
                <span class="item-label">活动类型：</span>
                <span class="item-value">{{ getActivityTypeText(activityData.type) }}</span>
              </div>
            </ElCol> -->
            <ElCol :span="12">
              <div class="detail-item">
                <span class="item-label">报名开始时间：</span>
                <span class="item-value">{{
                  formatTime(activityStore.ActivityDetail.registration_start_time)
                }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="item-label">报名结束时间：</span>
                <span class="item-value">{{
                  formatTime(activityStore.ActivityDetail.registration_end_time)
                }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="item-label">活动开始时间：</span>
                <span class="item-value">{{
                  formatTime(activityStore.ActivityDetail.event_start_time)
                }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="item-label">活动结束时间：</span>
                <span class="item-value">{{
                  formatTime(activityStore.ActivityDetail.event_end_time)
                }}</span>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="detail-item">
                <span class="item-label">创建者：</span>
                <span class="item-value">管理员</span>
              </div>
            </ElCol>
            <ElCol :span="24">
              <div class="detail-item">
                <span class="item-label">地址：</span>
                <span class="item-value">{{ activityStore.ActivityDetail.event_address }}</span>
              </div>
            </ElCol>
          </ElRow>
        </div>

        <!-- 活动封面 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>活动封面</h3>
          </div>
          <div class="cover-container">
            <ElImage
              :src="activityStore.ActivityDetail.cover_image_url"
              :preview-src-list="[activityStore.ActivityDetail.cover_image_url]"
              fit="cover"
              class="activity-cover"
            />
          </div>
        </div>

        <!-- 活动展示图片 -->
        <div
          class="detail-section"
          v-if="
            activityStore.ActivityDetail.images && activityStore.ActivityDetail.images.length > 0
          "
        >
          <div class="section-header">
            <h3>活动展示图片</h3>
          </div>
          <div class="display-images-container">
            <ElImage
              v-for="image in activityStore.ActivityDetail.images"
              :key="image.image_id"
              :src="image.url"
              :preview-src-list="[image.url]"
              :initial-index="image.image_id"
              fit="cover"
              class="display-image"
            />
          </div>
        </div>

        <!-- 活动详情 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>活动详情</h3>
          </div>
          <div class="content-container" v-html="activityStore.ActivityDetail.detail"></div>
        </div>

        <!-- 参与者列表 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>参与者列表</h3>
            <ElButton size="small" @click="handleExportParticipants"> 导出参与者 </ElButton>
          </div>
          <ElTable :data="activityStore.ActivityEnrollList" style="width: 100%">
            <ElTableColumn prop="name" label="姓名" width="120" />
            <ElTableColumn prop="phone_number" label="手机号" width="140" />
            <ElTableColumn prop="email" label="邮箱" width="200" />

            <ElTableColumn label="操作" width="100">
              <template #default="{ row }">
                <ElButton size="small" type="text" @click="handleViewParticipant(row)">
                  详情
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- 分页组件 -->
          <div class="pagination-container">
            <ElPagination
              v-model:current-page="pageParams.page"
              v-model:page-size="pageParams.pageSize"
              :total="pageParams.total"
              layout="total,prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElImage } from 'element-plus'
  import { ArrowLeft } from '@element-plus/icons-vue'
  import { useActivityStore } from '@/store/modules/activity'
  import { formatTime } from '@/utils/date'

  defineOptions({ name: 'ActivityDetail' })

  const activityStore = useActivityStore()

  interface ActivityDetailData {
    id: number
    title: string
    type: string
    status: string
    cover: string
    displayImages: string[] // 活动展示图片
    description: string
    content: string
    registrationStartTime: string
    registrationEndTime: string
    startTime: string
    endTime: string
    participants: number
    maxParticipants: number
    createTime: string
    creator: string
    tags: string[]
  }

  interface Participant {
    id: number
    name: string
    phone: string
    email: string
    joinTime: string
    source: string
  }

  const route = useRoute()
  const router = useRouter()
  const loading = ref(true)

  // 分页相关数据
  const pageParams = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // 活动数据
  const activityData = ref<ActivityDetailData>({
    id: 0,
    title: '',
    type: '',
    status: '',
    cover: '',
    displayImages: [],
    description: '',
    content: '',
    registrationStartTime: '',
    registrationEndTime: '',
    startTime: '',
    endTime: '',
    participants: 0,
    maxParticipants: 0,
    createTime: '',
    creator: '',
    tags: []
  })

  // 参与者列表
  const participantsList = ref<Participant[]>([])

  // 活动状态配置
  // const ACTIVITY_STATUS_CONFIG = {
  //   pending: { type: 'warning' as const, text: '未开始' },
  //   active: { type: 'success' as const, text: '进行中' },
  //   ended: { type: 'info' as const, text: '已结束' },
  //   expired: { type: 'danger' as const, text: '已过期' }
  // } as const

  // 活动类型配置
  // const ACTIVITY_TYPE_CONFIG = {
  //   marketing: '营销活动',
  //   brand: '品牌活动',
  //   promotion: '促销活动',
  //   user: '用户活动'
  // } as const

  /**
   * 获取活动状态配置
   */
  // const getActivityStatusConfig = (status: string) => {
  //   return (
  //     ACTIVITY_STATUS_CONFIG[status as keyof typeof ACTIVITY_STATUS_CONFIG] || {
  //       type: 'info' as const,
  //       text: '未知'
  //     }
  //   )
  // }

  /**
   * 获取活动类型文本
   */
  // const getActivityTypeText = (type: string) => {
  //   return ACTIVITY_TYPE_CONFIG[type as keyof typeof ACTIVITY_TYPE_CONFIG] || '未知'
  // }

  // 计算参与率
  // const participationRate = computed(() => {
  //   if (activityData.value.maxParticipants <= 0) {
  //     return '--'
  //   }
  //   return `${((activityData.value.participants / activityData.value.maxParticipants) * 100).toFixed(1)}%`
  // })

  // 计算剩余天数
  // const remainingDays = computed(() => {
  //   const endDate = new Date(activityData.value.endTime)
  //   const today = new Date()
  //   const timeDiff = endDate.getTime() - today.getTime()
  //   const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  //   if (daysDiff < 0) {
  //     return '已过期'
  //   } else if (daysDiff === 0) {
  //     return '今天结束'
  //   } else {
  //     return `${daysDiff}天`
  //   }
  // })

  // 获取活动详情
  const fetchActivityDetail = async (id: number) => {
    try {
      loading.value = true

      // 获取活动详情和第一页的参与者列表
      await activityStore.getActivityDetail(id, {
        page: pageParams.page,
        page_size: pageParams.pageSize
      })

      // 更新分页数据
      pageParams.total = activityStore.ActivityEnrollTotal

      // 模拟参与者数据
      participantsList.value = Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        name: `参与者${index + 1}`,
        phone: `138****${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        email: `user${index + 1}@example.com`,
        joinTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString(),
        source: ['微信', '官网', 'APP', '朋友圈'][Math.floor(Math.random() * 4)]
      }))
    } catch (error) {
      ElMessage.error('获取活动详情失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  // 获取参与者列表（带分页）
  const fetchParticipantsList = async (id: number) => {
    try {
      loading.value = true
      await activityStore.getActivityDetail(id, {
        page: pageParams.page,
        page_size: pageParams.pageSize
      })
      pageParams.total = activityStore.ActivityEnrollTotal
    } catch (error) {
      ElMessage.error('获取参与者列表失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    pageParams.page = newPage
    const activityId = route.params.id as string
    if (activityId) {
      fetchParticipantsList(parseInt(activityId, 10))
    }
  }

  // 返回列表
  const handleBack = () => {
    router.push('/activity/list')
  }

  // 编辑活动
  // const handleEdit = () => {
  //   router.push(`/activity/create?id=${activityData.value.id}&mode=edit`)
  // }

  // 结束活动
  // const handleEnd = () => {
  //   ElMessageBox.confirm('确定要结束此活动吗？结束后将无法恢复。', '结束活动', {
  //     confirmButtonText: '确定',
  //     cancelButtonText: '取消',
  //     type: 'warning'
  //   }).then(() => {
  //     //activityData.value.status = 'ended'
  //     ElMessage.success('活动已结束')
  //   })
  // }

  // 删除活动
  // const handleDelete = () => {
  //   ElMessageBox.confirm(
  //     `确定要删除活动"${activityData.value.title}"吗？此操作不可恢复。`,
  //     '删除活动',
  //     {
  //       confirmButtonText: '确定',
  //       cancelButtonText: '取消',
  //       type: 'error'
  //     }
  //   ).then(() => {
  //     ElMessage.success('删除成功')
  //     router.push('/activity/list')
  //   })
  // }

  // 导出参与者
  const handleExportParticipants = () => {
    ElMessage.success('参与者列表导出成功')
  }

  // 查看参与者详情
  const handleViewParticipant = (participant: Participant) => {
    ElMessage.info(`查看参与者: ${participant.name}`)
  }

  // 初始化
  onMounted(() => {
    const activityId = route.params.id as string

    if (activityId) {
      activityData.value.id = parseInt(activityId, 10)
      fetchActivityDetail(activityData.value.id)
    }
  })
</script>

<style lang="scss" scoped>
  .activity-detail-page {
    padding: 20px;
    min-height: 100vh;
    overflow-y: auto;

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .activity-detail-content {
      .detail-section {
        margin-bottom: 32px;

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--el-border-color-light);

          h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--art-text-gray-800);
          }
        }

        .detail-item {
          margin-bottom: 16px;
          display: flex;
          align-items: center;

          .item-label {
            font-weight: 500;
            color: var(--art-text-gray-600);
            min-width: 100px;
          }

          .item-value {
            color: var(--art-text-gray-800);
          }
        }

        .cover-container {
          .activity-cover {
            max-width: 400px;
            max-height: 300px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }

        .display-images-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 8px;

          .display-image {
            width: 100%;
            height: 150px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: transform 0.2s ease;

            &:hover {
              transform: scale(1.02);
            }
          }
        }

        .description-content {
          background: var(--el-fill-color-lighter);
          padding: 16px;
          border-radius: 8px;
          line-height: 1.6;
          color: var(--art-text-gray-700);
        }

        .stat-card {
          text-align: center;
          padding: 20px;
          background: var(--el-fill-color-lighter);
          border-radius: 8px;

          .stat-number {
            font-size: 32px;
            font-weight: 600;
            color: var(--el-color-primary);
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            color: var(--art-text-gray-600);
          }
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .activity-tag {
            margin: 0;
          }
        }

        .content-container {
          background: var(--el-fill-color-lighter);
          padding: 20px;
          border-radius: 8px;
          line-height: 1.6;
          min-height: 200px;
          max-height: none;
          overflow: visible;

          :deep(h3) {
            margin-top: 0;
            color: var(--art-text-gray-800);
          }

          :deep(h4) {
            color: var(--art-text-gray-700);
            margin: 16px 0 8px 0;
          }

          :deep(ul) {
            padding-left: 20px;
          }

          :deep(li) {
            margin-bottom: 4px;
          }

          :deep(p) {
            margin: 12px 0;
            color: var(--art-text-gray-700);
          }
        }

        // 分页容器样式
        .pagination-container {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-top: 20px;
          padding: 16px 0;
          border-top: 1px solid var(--el-border-color-light);
        }
      }
    }
  }
</style>
