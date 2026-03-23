<template>
  <div class="activity-list-page">
    <!-- 搜索栏 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" :inline="true" class="compact-form">
        <ElFormItem label="活动名称" class="form-item">
          <ElInput
            v-model="searchForm.name"
            placeholder="请输入活动名称"
            clearable
            style="width: 180px"
          />
        </ElFormItem>

        <ElFormItem class="form-item">
          <ElButton type="primary" @click="handleSearch" size="default"> 搜索 </ElButton>
          <ElButton @click="handleReset" size="default"> 重置 </ElButton>
          <ElButton type="primary" @click="handleCreate" size="default"> 新建活动 </ElButton>
          <ElButton :icon="Refresh" @click="refreshData" size="default"> 刷新 </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="table-card" shadow="never">
      <!-- 状态切换栏 -->
      <div class="status-tabs">
        <ElTabs v-model="activeTab" @tab-change="handleTabChange" class="compact-tabs">
          <!-- <ElTabPane label="全部活动" name="all" /> -->
          <ElTabPane label="进行中" name="InProgress" />
          <ElTabPane label="未开始" name="NotBegun" />
          <ElTabPane label="已过期" name="Completed" />
        </ElTabs>
      </div>

      <!-- 操作栏 -->
      <div class="table-header"></div>

      <!-- 表格 -->
      <div class="table-wrapper">
        <ElTable
          :data="activityStore.ActivityListing"
          @selection-change="handleSelectionChange"
          style="flex: 1; width: 100%"
          stripe
        >
          <ElTableColumn type="index" label="序号" width="60" />

          <ElTableColumn label="活动封面" width="120">
            <template #default="{ row }">
              <ElImage
                :src="row.cover_image_url"
                style="width: 80px; height: 60px; border-radius: 4px"
                fit="cover"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="活动名称" min-width="200">
            <template #default="{ row }">
              <div style="display: flex; flex-direction: column">
                <span style="margin-bottom: 4px; font-weight: 500">{{ row.title }}</span>
                <!-- <span style="font-size: 12px; color: #999">{{ row.description }}</span> -->
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="报名人数" width="100" prop="member_count" />
          <!-- <ElTableColumn label="活动类型" width="120">
            <template #default="{ row }">
              {{ getActivityTypeText(row.type) }}
            </template>
          </ElTableColumn> -->
          <!-- <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="getActivityStatusConfig(row.status).type">
                {{ getActivityStatusConfig(row.status).text }}
              </ElTag>
            </template>
          </ElTableColumn> -->
          <ElTableColumn label="活动时间" min-width="200">
            <template #default="{ row }">
              <div style="display: flex; flex-direction: column">
                <span style="margin-bottom: 4px">开始: {{ formatTime(row.event_start_time) }}</span>
                <span>结束: {{ formatTime(row.event_end_time) }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="报名时间" min-width="200">
            <template #default="{ row }">
              <div style="display: flex; flex-direction: column">
                <span style="margin-bottom: 4px"
                  >开始: {{ formatTime(row.registration_start_time) }}</span
                >
                <span>结束: {{ formatTime(row.registration_end_time) }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="所需费用" width="120">
            <template #default="{ row }">
              <div style="display: flex; flex-direction: column">
                <span style="margin-bottom: 4px">{{ row.registration_fee }}</span>
                <!-- <span style="font-size: 12px; color: #999">
                  {{ row.maxParticipants > 0 ? `限制${row.maxParticipants}人` : '不限制' }}
                </span> -->
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="地址" width="120" prop="event_address" />
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <ElButton type="primary" link @click="handleView(row)">查看</ElButton>
              <ElButton type="warning" link @click="handleEdit(row)">编辑</ElButton>
              <ElButton type="danger" link @click="handleDelete(row)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页组件 -->
        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="activityStore.ActivityTotal"
            :hide-on-single-page="true"
            layout="prev, pager, next, total,jumper"
            @current-change="onCurrentPageChange"
          />
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage, ElImage, ElTable, ElTableColumn, ElButton } from 'element-plus'
  import { Refresh } from '@element-plus/icons-vue'
  // import { useTable } from '@/composables/useTable'
  import { useActivityStore } from '@/store/modules/activity'
  import { ref, onMounted } from 'vue'
  import { formatTime } from '@/utils/date'
  import { ActivityService } from '@/api/activityApi'
  import { AIService } from '@/api/aiApi'

  defineOptions({ name: 'ActivityList' })

  // 请求参数
  const requestParams = {
    event_title: '',
    page: 1,
    page_size: 10,
    event_status: 'InProgress'
  }
  const currentPage = ref(1)
  const pageSize = ref(10)

  interface ActivityItem {
    id: number
    name: string
    type: string
    status: string
    cover: string
    displayImages: string[] // 活动展示图片
    description: string
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
  const activityStore = useActivityStore()

  const router = useRouter()
  //const { width } = useWindowSize()

  // 当前激活的标签页
  const activeTab = ref('InProgress')

  // 选中的行
  const selectedRows = ref<ActivityItem[]>([])

  // 搜索表单
  const searchForm = reactive({
    name: ''
  })

  // 钩子函数
  onMounted(() => {
    activityStore.getActivityList(requestParams)
  })
  // 换页
  const onCurrentPageChange = (page: number) => {
    currentPage.value = page
    console.log('当前页：', page)
    requestParams.page = page
    activityStore.getActivityList(requestParams)
  }
  // 标签页切换
  const handleTabChange = (tabName: any) => {
    activeTab.value = tabName as string
    console.log('标签页切换：', activeTab.value)
    requestParams.event_status = activeTab.value
    activityStore.getActivityList(requestParams)
  }

  // 搜索
  const handleSearch = () => {
    requestParams.event_title = searchForm.name
    requestParams.page = 1
    activityStore.getActivityList(requestParams)
  }

  // 重置搜索
  const handleReset = () => {
    Object.assign(searchForm, {
      name: ''
    })
    requestParams.event_title = ''
    requestParams.page = 1
    activityStore.getActivityList(requestParams)
  }

  // 新建活动
  const handleCreate = () => {
    router.push('/activity/create')
  }

  // 刷新数据
  const refreshData = () => {
    activityStore.getActivityList(requestParams)
  }

  // 查看活动
  const handleView = (row: ActivityItem) => {
    router.push(`/activity/detail/${row.id}`)
  }

  // 编辑活动
  const handleEdit = (row: ActivityItem) => {
    router.push(`/activity/create?id=${row.id}&mode=edit`)
  }

  // 删除活动
  const handleDelete = async (row: ActivityItem) => {
    console.log('删除活动：', row)
    try {
      await ElMessageBox.confirm(`确定要删除活动 "${row.name}" 吗？此操作不可恢复。`, '删除活动', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 用户点击了确认
      await ActivityService.deleteActivity(row.id)
      ElMessage.success('删除成功')

      // 异步从 AI 向量库删除（不阻塞主流程）
      AIService.deleteEventIndex(row.id)
        .then(() => ElMessage.success('AI 向量库已同步删除'))
        .catch(() => ElMessage.warning('AI 向量库同步删除失败，不影响活动删除'))

      activityStore.getActivityList(requestParams)
    } catch (error) {
      console.log('删除活动失败：', error)
      // 用户点了取消或关闭弹窗
      ElMessage.info('已取消删除')
    }
  }

  // 处理表格行选择变化
  const handleSelectionChange = (selection: ActivityItem[]) => {
    selectedRows.value = selection
  }
</script>

<style lang="scss" scoped>
  .activity-list-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
    padding: 20px;
    overflow: hidden;

    .search-card {
      flex-shrink: 0;
      padding: 0;
      margin-bottom: 12px;

      :deep(.el-card__body) {
        padding: 16px 20px;
      }

      .compact-form {
        .form-item {
          margin-right: 20px;
          margin-bottom: 0;

          :deep(.el-form-item__label) {
            padding-right: 8px;
            font-size: 14px;
          }

          :deep(.el-form-item__content) {
            margin-left: 0 !important;
          }
        }
      }
    }

    .table-card {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 0;
      overflow: hidden;

      :deep(.el-card__body) {
        display: flex;
        flex: 1;
        flex-direction: column;
        padding: 16px 20px;
        overflow: hidden;
      }

      .status-tabs {
        flex-shrink: 0;
        margin-bottom: 12px;

        .compact-tabs {
          :deep(.el-tabs__header) {
            margin-bottom: 8px;
          }

          :deep(.el-tabs__nav-wrap) {
            padding: 0;
          }

          :deep(.el-tabs__item) {
            height: 36px;
            padding: 8px 16px;
            font-size: 14px;
            line-height: 20px;
          }
        }

        .tab-label {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .tab-badge {
          :deep(.el-badge__content) {
            min-width: 16px;
            height: 16px;
            padding: 0 4px;
            font-size: 10px;
            line-height: 16px;
          }
        }
      }

      :deep(.art-table-header) {
        flex-shrink: 0;
        margin-bottom: 12px;
      }

      .table-header {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .header-left {
          display: flex;
          gap: 8px;
        }

        .header-right {
          display: flex;
          gap: 8px;
        }
      }

      .table-wrapper {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;

        .el-table {
          flex: 1;
        }

        .pagination-wrapper {
          display: flex;
          flex-shrink: 0;
          justify-content: flex-end;
          margin-top: 16px;
        }
      }
    }
  }
</style>
