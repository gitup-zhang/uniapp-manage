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
            <span>{{ row.member_count }}</span>
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
        <ElTableColumn label="操作" min-width="260" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton type="primary" size="small" @click="handleView(row)">
              <ElIcon><View /></ElIcon>
              查看
            </ElButton>
            <ElButton type="success" size="small" @click="handleMessage(row)">
              <ElIcon><ChatDotRound /></ElIcon>
              发送消息
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

    <!-- 编辑群组弹出框 -->
    <ElDialog
      v-model="editDialogVisible"
      title="编辑群组"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <ElForm ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <ElFormItem label="群组名称" prop="group_name">
          <ElInput v-model="editForm.group_name" placeholder="请输入群组名称" clearable />
        </ElFormItem>
        <ElFormItem label="群组描述" prop="desc">
          <ElInput
            v-model="editForm.desc"
            type="textarea"
            :rows="4"
            placeholder="请输入群组描述"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="cancelEdit">取消</ElButton>
          <ElButton type="primary" @click="confirmEdit" :loading="editLoading">确认</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onActivated } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import { Search, Refresh, Plus, View, Edit, Delete, ChatDotRound } from '@element-plus/icons-vue'
  import { useGroupStore } from '@/store/modules/group'
  import { groupService } from '@/api/groupApi'
  import type { GroupItem } from '@/api/modules/group'

  defineOptions({ name: 'GroupList' })

  const router = useRouter()
  const loading = ref(false)
  const groupStore = useGroupStore()

  // 编辑相关状态
  const editDialogVisible = ref(false)
  const editLoading = ref(false)
  const editFormRef = ref<FormInstance>()
  const currentEditGroup = ref<GroupItem | null>(null)

  // 编辑表单数据
  const editForm = reactive({
    group_name: '',
    desc: ''
  })

  // 编辑表单验证规则
  const editFormRules: FormRules = {
    group_name: [
      { required: true, message: '请输入群组名称', trigger: 'blur' },
      { min: 1, max: 50, message: '群组名称长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    desc: [{ max: 200, message: '群组描述不能超过 200 个字符', trigger: 'blur' }]
  }

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
  const handleView = (row: GroupItem) => {
    // 将群组信息保存到sessionStorage
    sessionStorage.setItem(`groupInfo_${row.id}`, JSON.stringify(row))
    router.push(`/groups/detail/${row.id}`)
  }

  // 群组消息列表
  const handleMessage = (row: GroupItem) => {
    // 将群组信息保存到sessionStorage
    sessionStorage.setItem(`groupInfo_${row.id}`, JSON.stringify(row))
    router.push(`/groups/message/${row.id}`)
  }

  // 编辑群组
  const handleEdit = (row: GroupItem) => {
    currentEditGroup.value = row
    editForm.group_name = row.group_name
    editForm.desc = row.desc || ''
    editDialogVisible.value = true
  }

  // 取消编辑
  const cancelEdit = () => {
    editDialogVisible.value = false
    editFormRef.value?.resetFields()
    currentEditGroup.value = null
  }

  // 确认编辑
  const confirmEdit = async () => {
    if (!editFormRef.value || !currentEditGroup.value) return

    try {
      // 验证表单
      await editFormRef.value.validate()

      editLoading.value = true

      // 调用更新API
      await groupService.updateGroup(
        {
          group_name: editForm.group_name,
          desc: editForm.desc
        },
        currentEditGroup.value.id
      )

      ElMessage.success('群组更新成功')
      editDialogVisible.value = false

      // 刷新数据
      await loadData()
    } catch (error) {
      console.error('更新群组失败:', error)
      ElMessage.error('更新群组失败，请重试')
    } finally {
      editLoading.value = false
    }
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
      await groupService.deleteGroup(row.id)
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

    // 编辑对话框样式
    :deep(.el-dialog) {
      border-radius: 12px;

      .el-dialog__header {
        padding: 20px 20px 0;
        border-bottom: 1px solid var(--el-border-color-light);
        margin-bottom: 20px;

        .el-dialog__title {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .el-dialog__body {
        padding: 0 20px 20px;
      }

      .el-dialog__footer {
        padding: 20px;
        border-top: 1px solid var(--el-border-color-light);

        .dialog-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      }
    }
  }
</style>
