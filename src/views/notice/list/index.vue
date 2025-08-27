<!-- 公告列表 -->
<template>
  <div class="notice-list-page">
    <!-- 搜索栏 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" :inline="true" class="compact-form">
        <ElFormItem label="公告标题" class="form-item">
          <ElInput
            v-model="searchForm.title"
            placeholder="请输入公告标题"
            clearable
            style="width: 180px"
          />
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
      <!-- 操作栏 -->
      <div class="table-header">
        <div class="header-left">
          <ElButton type="primary" @click="handleCreate"> 新建公告 </ElButton>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-wrapper">
        <ElTable
          :data="noticeList"
          @selection-change="handleSelectionChange"
          style="width: 100%; flex: 1"
          stripe
        >
          <ElTableColumn type="index" label="序号" width="60" />
          <ElTableColumn label="公告标题" min-width="300">
            <template #default="{ row }">
              <span style="font-weight: 500">{{ row.title }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="作者" width="120" prop="author" />
          <ElTableColumn label="浏览次数" width="100" prop="views" />
          <ElTableColumn label="创建时间" width="160">
            <template #default="{ row }">
              {{ formatTime(row.create_time) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="150" fixed="right">
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
            :total="total"
            :hide-on-single-page="true"
            layout="prev, pager, next, total, jumper"
            @current-change="onCurrentPageChange"
          />
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage, ElTable, ElTableColumn, ElButton } from 'element-plus'
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import type { Notice } from '@/api/modules/notice'

  defineOptions({ name: 'NoticeList' })

  const router = useRouter()

  // 分页参数
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  // 公告列表数据
  const noticeList = ref<Notice[]>([])

  // 选中的行
  const selectedRows = ref<Notice[]>([])

  // 搜索表单
  const searchForm = reactive({
    title: '',
    dateRange: [] as string[]
  })

  // 格式化时间
  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN')
  }

  // 获取公告列表
  const getNoticeList = async () => {
    try {
      // 这里使用模拟数据，实际应该调用 NoticeService.getNoticeList(params)
      const mockData = {
        data: [
          {
            id: 1,
            title: '系统维护通知',
            content: '系统将于今晚进行维护升级...',
            status: 'published' as const,
            create_time: '2024-01-15 10:30:00',
            update_time: '2024-01-15 10:30:00',
            publish_time: '2024-01-15 11:00:00',
            author: '系统管理员',
            views: 156
          },
          {
            id: 2,
            title: '新功能发布公告',
            content: '我们很高兴地宣布新功能已上线...',
            status: 'published' as const,
            create_time: '2024-01-14 15:20:00',
            update_time: '2024-01-14 15:20:00',
            publish_time: '2024-01-14 16:00:00',
            author: '产品经理',
            views: 89
          },
          {
            id: 3,
            title: '用户协议更新',
            content: '根据相关法律法规要求，用户协议已更新...',
            status: 'published' as const,
            create_time: '2024-01-13 09:15:00',
            update_time: '2024-01-13 09:15:00',
            publish_time: '2024-01-13 10:00:00',
            author: '法务部',
            views: 45
          }
        ],
        page: currentPage.value,
        page_size: pageSize.value,
        total: 23
      }

      noticeList.value = mockData.data
      total.value = mockData.total
    } catch {
      ElMessage.error('获取公告列表失败')
    }
  }

  // 钩子函数
  onMounted(() => {
    getNoticeList()
  })

  // 换页
  const onCurrentPageChange = (page: number) => {
    currentPage.value = page
    getNoticeList()
  }

  // 搜索
  const handleSearch = () => {
    currentPage.value = 1
    getNoticeList()
  }

  // 重置搜索
  const handleReset = () => {
    Object.assign(searchForm, {
      title: '',
      dateRange: []
    })
    currentPage.value = 1
    getNoticeList()
  }

  // 新建公告
  const handleCreate = () => {
    router.push('/notice/create')
  }

  // 查看公告
  const handleView = (row: Notice) => {
    router.push(`/notice/detail/${row.id}`)
  }

  // 编辑公告
  const handleEdit = (row: Notice) => {
    router.push(`/notice/create?id=${row.id}&mode=edit`)
  }

  // 删除公告
  const handleDelete = (row: Notice) => {
    ElMessageBox.confirm(`确定要删除公告"${row.title}"吗？此操作不可恢复。`, '删除公告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        // await NoticeService.deleteNotice(row.id)
        ElMessage.success('删除成功')
        getNoticeList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // 处理表格行选择变化
  const handleSelectionChange = (selection: Notice[]) => {
    selectedRows.value = selection
  }
</script>

<style lang="scss" scoped>
  .notice-list-page {
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
