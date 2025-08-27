<!-- 活动列表 -->
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
        <ElFormItem label="活动类型" class="form-item">
          <ElSelect
            v-model="searchForm.type"
            placeholder="请选择活动类型"
            clearable
            style="width: 130px"
          >
            <ElOption label="营销活动" value="marketing" />
            <ElOption label="品牌活动" value="brand" />
            <ElOption label="促销活动" value="promotion" />
            <ElOption label="用户活动" value="user" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="创建时间" class="form-item">
          <ElDatePicker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 220px"
            size="default"
          />
        </ElFormItem>
        <ElFormItem class="form-item">
          <ElButton type="primary" @click="handleSearch" size="default"> 搜索 </ElButton>
          <ElButton @click="handleReset" size="default"> 重置 </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="table-card" shadow="never">
      <!-- 状态切换栏 -->
      <div class="status-tabs">
        <ElTabs v-model="activeTab" @tab-change="handleTabChange" class="compact-tabs">
          <!-- <ElTabPane label="全部活动" name="all" /> -->
          <ElTabPane label="进行中" name="active" />
          <ElTabPane label="未开始" name="pending" />
          <ElTabPane label="已过期" name="expired" />
        </ElTabs>
      </div>

      <!-- 操作栏 -->
      <div class="table-header">
        <div class="header-left">
          <ElButton type="primary" @click="handleCreate"> 新建活动 </ElButton>
        </div>
        <!-- <div class="header-right">
          <ElButton :icon="Refresh" @click="refreshData">刷新</ElButton>
        </div> -->
      </div>

      <!-- 表格 -->
      <div class="table-wrapper">
        <ElTable
          :data="activityStore.ActivityListing"
          @selection-change="handleSelectionChange"
          style="width: 100%; flex: 1"
          stripe
        >
          <ElTableColumn type="index" label="序号" width="60" />
          <ElTableColumn label="活动封面" width="120">
            <template #default="{ row }">
              <ElImage
                :src="row.cover_image_url"
                style="width: 80px; height: 60px; border-radius: 4px"
                fit="cover"
                :preview-src-list="[row.cover_image_url]"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="活动名称" min-width="200">
            <template #default="{ row }">
              <div style="display: flex; flex-direction: column">
                <span style="font-weight: 500; margin-bottom: 4px">{{ row.title }}</span>
                <!-- <span style="font-size: 12px; color: #999">{{ row.description }}</span> -->
              </div>
            </template>
          </ElTableColumn>
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
  // import { Refresh } from '@element-plus/icons-vue'
  // import { useTable } from '@/composables/useTable'
  import { useActivityStore } from '@/store/modules/activity'
  import { ref, onMounted } from 'vue'
  import { formatTime } from '@/utils/date'

  defineOptions({ name: 'ActivityList' })

  // 请求参数
  const requestParams = {
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
  const activeTab = ref('active')

  // 选中的行
  const selectedRows = ref<ActivityItem[]>([])

  // 搜索表单
  const searchForm = reactive({
    name: '',
    type: '',
    dateRange: [] as string[]
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
  }

  // 搜索
  const handleSearch = () => {}

  // 重置搜索
  const handleReset = () => {
    Object.assign(searchForm, {
      name: '',
      type: '',
      dateRange: []
    })
  }

  // 新建活动
  const handleCreate = () => {
    router.push('/activity/create')
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
  const handleDelete = (row: ActivityItem) => {
    ElMessageBox.confirm(`确定要删除活动"${row.name}"吗？此操作不可恢复。`, '删除活动', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('删除成功')
    })
  }

  // 批量删除
  // const handleBatchDelete = () => {
  //   ElMessageBox.confirm(
  //     `确定要删除选中的 ${selectedRows.value.length} 个活动吗？此操作不可恢复。`,
  //     '批量删除',
  //     {
  //       confirmButtonText: '确定',
  //       cancelButtonText: '取消',
  //       type: 'warning'
  //     }
  //   ).then(() => {
  //     ElMessage.success('批量删除成功')
  //     selectedRows.value = []
  //   })
  // }

  // 处理表格行选择变化
  const handleSelectionChange = (selection: ActivityItem[]) => {
    selectedRows.value = selection
  }
</script>

<style lang="scss" scoped>
  .activity-list-page {
    padding: 20px;
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .search-card {
      margin-bottom: 12px;
      padding: 0;
      flex-shrink: 0;

      :deep(.el-card__body) {
        padding: 16px 20px;
      }

      .compact-form {
        .form-item {
          margin-bottom: 0;
          margin-right: 20px;

          :deep(.el-form-item__label) {
            font-size: 14px;
            padding-right: 8px;
          }

          :deep(.el-form-item__content) {
            margin-left: 0 !important;
          }
        }
      }
    }

    .table-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;

      :deep(.el-card__body) {
        padding: 16px 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .status-tabs {
        margin-bottom: 12px;
        flex-shrink: 0;

        .compact-tabs {
          :deep(.el-tabs__header) {
            margin-bottom: 8px;
          }

          :deep(.el-tabs__nav-wrap) {
            padding: 0;
          }

          :deep(.el-tabs__item) {
            padding: 8px 16px;
            font-size: 14px;
            height: 36px;
            line-height: 20px;
          }
        }

        .tab-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tab-badge {
          :deep(.el-badge__content) {
            font-size: 10px;
            height: 16px;
            line-height: 16px;
            padding: 0 4px;
            min-width: 16px;
          }
        }
      }

      :deep(.art-table-header) {
        margin-bottom: 12px;
        flex-shrink: 0;
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        flex-shrink: 0;

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
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .el-table {
          flex: 1;
        }

        .pagination-wrapper {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
          flex-shrink: 0;
        }
      }
    }
  }
</style>
