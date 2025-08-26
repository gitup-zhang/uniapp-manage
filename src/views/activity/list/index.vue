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
          <ElTabPane label="全部活动" name="all" />
          <ElTabPane label="进行中" name="active" />
          <ElTabPane label="未开始" name="pending" />
          <ElTabPane label="已过期" name="expired" />
        </ElTabs>
      </div>

      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="handleCreate"> 新建活动 </ElButton>
          <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            批量删除
          </ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="isLoading"
        :data="tableData"
        :columns="columns"
        :pagination="paginationState"
        @selection-change="handleSelectionChange"
        @pagination:size-change="onPageSizeChange"
        @pagination:current-change="onCurrentPageChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage, ElTag, ElImage } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'ActivityList' })

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

  const router = useRouter()
  //const { width } = useWindowSize()

  // 当前激活的标签页
  const activeTab = ref('all')

  // 选中的行
  const selectedRows = ref<ActivityItem[]>([])

  // 搜索表单
  const searchForm = reactive({
    name: '',
    type: '',
    dateRange: [] as string[]
  })

  // 活动状态配置
  const ACTIVITY_STATUS_CONFIG = {
    pending: { type: 'warning' as const, text: '未开始' },
    active: { type: 'success' as const, text: '进行中' },
    ended: { type: 'info' as const, text: '已结束' },
    expired: { type: 'danger' as const, text: '已过期' }
  } as const

  // 活动类型配置
  const ACTIVITY_TYPE_CONFIG = {
    marketing: '营销活动',
    brand: '品牌活动',
    promotion: '促销活动',
    user: '用户活动'
  } as const

  /**
   * 获取活动状态配置
   */
  const getActivityStatusConfig = (status: string) => {
    return (
      ACTIVITY_STATUS_CONFIG[status as keyof typeof ACTIVITY_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 获取活动类型文本
   */
  const getActivityTypeText = (type: string) => {
    return ACTIVITY_TYPE_CONFIG[type as keyof typeof ACTIVITY_TYPE_CONFIG] || '未知'
  }

  /**
   * 判断活动是否过期
   */
  const isActivityExpired = (endTime: string) => {
    return new Date(endTime) < new Date()
  }

  // 模拟API调用
  const fetchActivityList = async (params: any) => {
    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 生成模拟数据（调整数据量以便演示分页效果）
    const mockData: ActivityItem[] = Array.from({ length: 115 }, (_, index) => {
      const registrationStartTime = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      const registrationEndTime = new Date(
        registrationStartTime.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000
      )
      const startTime = new Date(
        registrationEndTime.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
      )
      const endTime = new Date(startTime.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      const isExpired = Math.random() > 0.6
      const actualEndTime = isExpired
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        : endTime

      const types = ['marketing', 'brand', 'promotion', 'user']
      const statuses = ['pending', 'active', 'ended']

      // 更加合理的状态分布，确保与统计数据匹配
      let status = statuses[Math.floor(Math.random() * statuses.length)]

      // 根据数据索引调整状态分布，确保统计数据准确
      if (index < 28) {
        status = 'pending'
      } else if (index < 63) {
        status = 'active'
      } else {
        status = 'ended'
      }

      // 部分已结束的活动设为已过期
      if (isExpired && (status === 'ended' || status === 'active')) {
        status = 'expired'
      }

      return {
        id: index + 1,
        name: `测试活动 ${String(index + 1).padStart(3, '0')}`,
        type: types[Math.floor(Math.random() * types.length)],
        status,
        cover: `https://picsum.photos/200/150?random=${index}`,
        displayImages: [
          `https://picsum.photos/400/300?random=${index + 1000}`,
          `https://picsum.photos/400/300?random=${index + 2000}`,
          `https://picsum.photos/400/300?random=${index + 3000}`
        ],
        description: `这是测试活动 ${String(index + 1).padStart(3, '0')} 的详细描述信息，包含丰富的活动内容和奖品设置`,
        registrationStartTime: registrationStartTime.toISOString().split('T')[0],
        registrationEndTime: registrationEndTime.toISOString().split('T')[0],
        startTime: startTime.toISOString().split('T')[0],
        endTime: actualEndTime.toISOString().split('T')[0],
        participants: Math.floor(Math.random() * 1000),
        maxParticipants: Math.floor(Math.random() * 2000) + 1000,
        createTime: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        creator: `用户${Math.floor(Math.random() * 100)}`,
        tags: ['标签1', '标签2'].slice(0, Math.floor(Math.random() * 3))
      }
    })

    // 根据activeTab过滤数据
    let filteredData = mockData
    if (activeTab.value !== 'all') {
      filteredData = mockData.filter((item) => {
        if (activeTab.value === 'expired') {
          return item.status === 'expired' || isActivityExpired(item.endTime)
        }
        return item.status === activeTab.value
      })
    }

    return {
      records: filteredData.slice((params.current - 1) * params.size, params.current * params.size),
      current: params.current,
      size: params.size,
      total: filteredData.length
    }
  }

  const {
    columns,
    columnChecks,
    tableData,
    isLoading,
    paginationState,
    onPageSizeChange,
    onCurrentPageChange,
    refreshAll: refreshData
  } = useTable<ActivityItem>({
    core: {
      apiFn: fetchActivityList,
      apiParams: {
        current: 1,
        size: 10 // 调整为每页 10 条数据，更好地展示分页效果
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'cover',
          label: '活动封面',
          width: 120,
          formatter: (row) => {
            return h(ElImage, {
              src: row.cover,
              style: 'width: 80px; height: 60px; border-radius: 4px;',
              fit: 'cover',
              previewSrcList: [row.cover]
            })
          }
        },
        {
          prop: 'name',
          label: '活动名称',
          minWidth: 200,
          formatter: (row) => {
            return h('div', { style: 'display: flex; flex-direction: column;' }, [
              h('span', { style: 'font-weight: 500; margin-bottom: 4px;' }, row.name),
              h('span', { style: 'font-size: 12px; color: #999;' }, row.description)
            ])
          }
        },
        {
          prop: 'type',
          label: '活动类型',
          width: 120,
          formatter: (row) => getActivityTypeText(row.type)
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const statusConfig = getActivityStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'time',
          label: '活动时间',
          minWidth: 200,
          formatter: (row) => {
            return h('div', { style: 'display: flex; flex-direction: column;' }, [
              h('span', { style: 'margin-bottom: 4px;' }, `开始: ${row.startTime}`),
              h('span', {}, `结束: ${row.endTime}`)
            ])
          }
        },
        {
          prop: 'participants',
          label: '参与情况',
          width: 120,
          formatter: (row) => {
            return h('div', { style: 'display: flex; flex-direction: column;' }, [
              h('span', { style: 'margin-bottom: 4px;' }, `${row.participants}人`),
              h(
                'span',
                { style: 'font-size: 12px; color: #999;' },
                row.maxParticipants > 0 ? `限制${row.maxParticipants}人` : '不限制'
              )
            ])
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 120,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'view',
                onClick: () => handleView(row)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEdit(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    }
  })

  // 标签页切换
  const handleTabChange = (tabName: any) => {
    activeTab.value = tabName as string
    refreshData()
  }

  // 搜索
  const handleSearch = () => {
    refreshData()
  }

  // 重置搜索
  const handleReset = () => {
    Object.assign(searchForm, {
      name: '',
      type: '',
      dateRange: []
    })
    refreshData()
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
      refreshData()
    })
  }

  // 批量删除
  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个活动吗？此操作不可恢复。`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      refreshData()
    })
  }

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

      :deep(.art-table-wrapper) {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .el-table {
          flex: 1;

          .el-image {
            border-radius: 4px;
          }
        }

        .art-pagination-wrapper {
          margin-top: 12px;
          flex-shrink: 0;
        }
      }
    }
  }
</style>
