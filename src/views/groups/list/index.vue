<template>
  <div class="group-list-page">
    <!-- 搜索栏 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" inline label-width="auto">
        <ElFormItem label="群组名称">
          <ElInput
            v-model="searchForm.group_name"
            placeholder="请输入群组名称"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="查询范围">
          <ElSelect
            v-model="searchForm.query_scope"
            placeholder="请选择查询范围"
            clearable
            style="width: 150px"
          >
            <ElOption label="有效数据" value="VALID" />
            <ElOption label="全部数据" value="ALL" />
            <ElOption label="已删除数据" value="DELETED" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch" :loading="loading">
            <ElIcon><Search /></ElIcon>
            搜索
          </ElButton>
          <ElButton @click="handleReset">
            <ElIcon><Refresh /></ElIcon>
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格 -->
    <ElCard class="table-card">
      <template #header>
        <div class="table-header">
          <h3>群组列表</h3>
          <ElButton type="primary" @click="handleCreate">
            <ElIcon><Plus /></ElIcon>
            创建群组
          </ElButton>
        </div>
      </template>

      <ElTable
        :data="groupStore.groupList"
        :loading="loading"
        stripe
        border
        style="width: 100%"
        empty-text="暂无数据"
      >
        <ElTableColumn prop="id" label="ID" width="80" align="center" />
        <ElTableColumn prop="group_name" label="群组名称" width="150">
          <template #default="{ row }">
            <div class="group-info">
              <!-- <ElAvatar :size="32" :src="row.avatar" class="group-avatar">
                {{ row.name.charAt(0) }}
              </ElAvatar> -->
              <span class="group-name">{{ row.group_name }}</span>
            </div>
          </template>
        </ElTableColumn>
        <!-- <ElTableColumn prop="type" label="群组类型" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </ElTag>
          </template>
        </ElTableColumn> -->
        <ElTableColumn prop="memberCount" label="成员数量" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.include_all_user }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="desc" label="群组描述" width="300" show-overflow-tooltip />
        <ElTableColumn prop="event_title" label="对应群组" width="180" align="center" />
        <ElTableColumn prop="status" label="是否已删除" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="statusMap[row.is_deleted as 'Y' | 'N']" size="small">
              {{ row.is_deleted === 'N' ? '正常' : '已删除' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" min-width="200" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" size="small" @click="handleView(row)">
              <ElIcon><View /></ElIcon>
              查看
            </ElButton>
            <ElButton type="warning" size="small" @click="handleEdit(row)">
              <ElIcon><Edit /></ElIcon>
              编辑
            </ElButton>
            <ElButton type="danger" size="small" @click="handleDelete(row)">
              <ElIcon><Delete /></ElIcon>
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onActivated } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, Plus, View, Edit, Delete } from '@element-plus/icons-vue'
  import { useGroupStore } from '@/store/modules/group'

  defineOptions({ name: 'GroupList' })

  const router = useRouter()
  const loading = ref(false)
  const groupStore = useGroupStore()

  // 搜索表单
  const searchForm = reactive({
    group_name: '', // 群组名称，模糊查询
    query_scope: 'VALID' // 查询范围，默认只查询有效数据
  })

  // 分页参数
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 表格数据

  // 获取群组类型标签样式
  // const getTypeTagType = (type: string): TagProps['type'] => {
  //   const typeMap: Record<string, TagProps['type']> = {
  //     public: 'success',
  //     private: 'warning',
  //     work: 'primary'
  //   }
  //   return typeMap[type] || 'info'
  // }

  // 获取群组类型标签文本
  // const getTypeLabel = (type: string): string => {
  //   const labelMap: Record<string, string> = {
  //     public: '公开群组',
  //     private: '私有群组',
  //     work: '工作群组'
  //   }
  //   return labelMap[type] || '未知类型'
  // }
  // 状态标签样式
  const statusMap: Record<'Y' | 'N', 'success' | 'danger'> = {
    N: 'success',
    Y: 'danger'
  }
  // 搜索
  const handleSearch = () => {
    loading.value = true
    // 重置到第一页
    pagination.currentPage = 1
    // 加载数据
    loadData().finally(() => {
      loading.value = false
    })
  }

  // 重置搜索
  const handleReset = () => {
    // 清空搜索条件
    searchForm.group_name = ''
    searchForm.query_scope = 'VALID'
    // 重置到第一页
    pagination.currentPage = 1
    // 重新加载数据
    handleSearch()
  }

  // 创建群组
  const handleCreate = () => {
    router.push('/groups/create')
  }

  // 查看群组
  const handleView = (row: any) => {
    ElMessage.info(`查看群组: ${row.name}`)
    // 这里可以跳转到群组详情页面
  }

  // 编辑群组
  const handleEdit = (row: any) => {
    ElMessage.info(`编辑群组: ${row.name}`)
    // 这里可以跳转到编辑页面或打开编辑弹框
  }

  // 删除群组
  const handleDelete = async (row: any) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除群组 "${row.group_name}" 吗？此操作不可逆！`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 模拟删除API调用
      ElMessage.success('删除成功')
      // 删除成功后刷新数据
      loadData()
    } catch {
      ElMessage.info('取消删除')
    }
  }

  // 分页大小变化
  // const handleSizeChange = (size: number) => {
  //   pagination.pageSize = size
  //   loadData()
  // }

  // 当前页变化
  const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    loadData()
  }

  // 加载数据
  const loadData = async () => {
    try {
      // 构建查询参数
      const params: any = {
        page: pagination.currentPage,
        page_size: pagination.pageSize
      }

      // 添加可选参数
      if (searchForm.group_name) {
        params.group_name = searchForm.group_name
      }
      if (searchForm.query_scope) {
        if (searchForm.query_scope === 'VALID') {
          params.query_scope = ''
        } else {
          params.query_scope = searchForm.query_scope
        }
      }

      // 调用API
      console.log('查询参数:', params)
      await groupStore.getGroupList(params)
      pagination.total = groupStore.groupTotal
    } catch (error) {
      console.error('加载群组数据失败:', error)
      ElMessage.error('加载数据失败，请重试')
    }
  }

  // 组件挂载时加载数据
  onMounted(() => {
    console.log('群组列表组件挂载，初始加载数据')
    loadData()
  })

  // 组件激活时刷新数据（从其他界面跳转回来时）
  onActivated(() => {
    console.log('群组列表组件被激活，刷新数据')
    loadData()
  })
</script>

<style lang="scss" scoped>
  .group-list-page {
    padding: 20px;

    .search-card {
      margin-bottom: 20px;
      border-radius: 8px;

      :deep(.el-card__body) {
        padding: 20px;
      }
    }

    .table-card {
      border-radius: 8px;

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .group-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .group-avatar {
          flex-shrink: 0;
        }

        .group-name {
          font-weight: 500;
        }
      }

      .pagination-wrapper {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    }

    :deep(.el-button) {
      border-radius: 6px;

      + .el-button {
        margin-left: 8px;
      }
    }

    :deep(.el-table) {
      .el-button {
        margin: 0 2px;
      }
    }
  }
</style>
