<!-- 管理员管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 如果你想使用 template 语法，请移步功能示例下面的高级表格示例 -->
<template>
  <div class="admin-page art-full-height">
    <!-- 搜索栏 -->
    <AdminSearch v-model:filter="defaultFilter" @reset="resetSearch" @search="handleSearch" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 操作栏 -->
      <div class="table-header">
        <div class="header-left">
          <ElButton @click="showDialog('add')">新增管理员</ElButton>
        </div>
        <div class="header-right">
          <ElButton :icon="Refresh" @click="refreshAll">刷新</ElButton>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-wrapper">
        <ElTable
          v-loading="isLoading"
          :data="tableData"
          @selection-change="handleSelectionChange"
          style="width: 100%; flex: 1"
          border
          stripe
        >
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn type="index" label="序号" width="160" />
          <ElTableColumn label="管理员名称" width="250" prop="name" />
          <ElTableColumn label="手机号" width="220" prop="phone" />
          <ElTableColumn label="邮箱" width="280" prop="email" />
          <ElTableColumn label="操作" min-width="280" fixed="right">
            <template #default="{ row }">
              <ElButton type="warning" link @click="showDialog('edit', row)">编辑</ElButton>
              <ElButton type="primary" link @click="showResetPasswordDialog(row)"
                >修改密码</ElButton
              >
              <ElButton type="danger" link @click="deleteAdmin(row)">删除</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页组件 -->
        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="paginationState.current"
            v-model:page-size="paginationState.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="paginationState.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="onPageSizeChange"
            @current-change="onCurrentPageChange"
          />
        </div>
      </div>

      <!-- 管理员弹窗 -->
      <AdminDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :admin-data="currentAdminData"
        @submit="handleDialogSubmit"
      />

      <!-- 修改密码弹窗 -->
      <ResetPasswordDialog
        v-model:visible="resetPasswordVisible"
        :admin-data="currentResetAdmin"
        @submit="handleResetPassword"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import {
    ElMessageBox,
    ElMessage,
    ElTable,
    ElTableColumn,
    ElPagination,
    ElButton
  } from 'element-plus'
  import { Refresh } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import AdminSearch from './modules/admin-search.vue'
  import AdminDialog from './modules/admin-dialog.vue'
  import ResetPasswordDialog from './modules/reset-password-dialog.vue'

  defineOptions({ name: 'Admin' })

  type AdminListItem = Api.User.UserListItem & {
    adminLevel?: string
    lastLoginTime?: string
    permissions?: string[]
  }
  const { getUserList } = UserService

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentAdminData = ref<Partial<AdminListItem>>({})

  // 修改密码弹窗相关
  const resetPasswordVisible = ref(false)
  const currentResetAdmin = ref<Partial<AdminListItem>>({})

  // 选中行
  const selectedRows = ref<AdminListItem[]>([])

  // 表单搜索初始值
  const defaultFilter = ref({
    name: undefined,
    level: 'super',
    date: '2025-01-05',
    daterange: ['2025-01-01', '2025-02-10'],
    status: '1'
  })

  const {
    tableData,
    isLoading,
    paginationState,
    searchData,
    searchState,
    resetSearch,
    onPageSizeChange,
    onCurrentPageChange,
    refreshAll
  } = useTable<AdminListItem>({
    // 核心配置
    core: {
      apiFn: getUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...defaultFilter.value
      }
    },
    // 数据处理
    transform: {
      // 数据转换器 - 生成管理员模拟数据
      dataTransformer: () => {
        // 直接返回模拟的管理员数据
        return [
          {
            id: 1,
            name: '超级管理员',
            phone: '13800138000',
            email: 'admin@company.com',
            status: '1',
            avatar: '',
            createTime: '2023-01-15',
            updateTime: '2023-01-15',
            gender: '男',
            position: '超级管理员',
            industry: '科技',
            company: '公司',
            department: '管理部'
          },
          {
            id: 2,
            name: '系统管理员',
            phone: '13800138001',
            email: 'system@company.com',
            status: '1',
            avatar: '',
            createTime: '2023-02-01',
            updateTime: '2023-02-01',
            gender: '女',
            position: '系统管理员',
            industry: '科技',
            company: '公司',
            department: '技术部'
          },
          {
            id: 3,
            name: '运营管理员',
            phone: '13800138002',
            email: 'operator@company.com',
            status: '2',
            avatar: '',
            createTime: '2023-03-01',
            updateTime: '2023-03-01',
            gender: '男',
            position: '运营管理员',
            industry: '科技',
            company: '公司',
            department: '运营部'
          }
        ]
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...searchParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    // 搜索参数赋值
    Object.assign(searchState, { ...searchParams, startTime, endTime })
    searchData()
  }

  /**
   * 显示修改密码弹窗
   */
  const showResetPasswordDialog = (row: AdminListItem): void => {
    console.log('修改密码:', row)
    currentResetAdmin.value = row
    resetPasswordVisible.value = true
  }

  /**
   * 处理密码重置
   */
  const handleResetPassword = async () => {
    try {
      // 这里应该调用修改密码的API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟API调用

      ElMessage.success('密码修改成功')
      resetPasswordVisible.value = false
      currentResetAdmin.value = {}
    } catch (error) {
      console.error('密码修改失败:', error)
      ElMessage.error('密码修改失败')
    }
  }

  /**
   * 显示管理员弹窗
   */
  const showDialog = (type: Form.DialogType, row?: AdminListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentAdminData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除管理员
   */
  const deleteAdmin = (row: AdminListItem): void => {
    console.log('删除管理员:', row)
    ElMessageBox.confirm(`确定要删除该管理员吗？`, '删除管理员', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      ElMessage.success('删除成功')
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentAdminData.value = {}
      refreshAll()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: AdminListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  .admin-page {
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

    :deep(.admin) {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .admin-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
