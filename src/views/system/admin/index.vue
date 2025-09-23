<!-- 管理员管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 如果你想使用 template 语法，请移步功能示例下面的高级表格示例 -->
<template>
  <div class="admin-page art-full-height">
    <!-- 搜索栏 -->
    <div class="admin-search">
      <ElCard shadow="never" class="search-card">
        <ElForm
          ref="searchFormRef"
          :model="searchForm"
          :inline="true"
          label-width="auto"
          class="search-form"
        >
          <ElFormItem label="管理员名称">
            <ElInput
              v-model="searchForm.name"
              placeholder="请输入管理员名称"
              style="width: 200px"
              clearable
            />
          </ElFormItem>
          <ElFormItem label="管理员类型">
            <ElSelect
              v-model="searchForm.role"
              placeholder="请选择管理员类型"
              style="width: 120px"
              clearable
            >
              <ElOption label="超级管理员" value="SUPERADMIN" />
              <ElOption label="管理员" value="ADMIN" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleSearch">搜索</ElButton>
            <ElButton @click="handleReset">重置</ElButton>
          </ElFormItem>
        </ElForm>
      </ElCard>
    </div>

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
          :data="adminStore.adminlist"
          @selection-change="handleSelectionChange"
          style="width: 100%; flex: 1"
          border
          stripe
        >
          <ElTableColumn type="index" label="序号" width="160" />
          <!-- <ElTableColumn label="管理员头像" width="200">
            <template #default="{ row }"><ElImage :src="row.avatar" fit="cover" /> </template>
          </ElTableColumn> -->
          <ElTableColumn label="管理员姓名" width="200" prop="name" />
          <ElTableColumn label="管理员昵称" width="200" prop="nickname" />
          <ElTableColumn label="手机号" width="200" prop="phone_number" />
          <ElTableColumn label="邮箱" width="200" prop="email" />
          <ElTableColumn label="操作" min-width="280">
            <template #default="{ row }">
              <ElButton type="warning" link @click="showDialog('edit', row)">编辑</ElButton>
              <ElButton type="primary" link @click="showResetPasswordDialog(row)"
                >修改密码</ElButton
              >
              <ElButton type="danger" link @click="deleteAdmin(row)">禁用</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页组件 -->
        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="currentpage"
            :page-size="page_size"
            :total="adminStore.admintotal"
            layout="total, prev, pager, next, jumper"
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
    ElButton,
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElCard,
    type FormInstance
  } from 'element-plus'
  import { onMounted } from 'vue'
  import { Refresh } from '@element-plus/icons-vue'
  //import { useTable } from '@/composables/useTable'
  //import { UserService } from '@/api/usersApi'

  import AdminDialog from './modules/admin-dialog.vue'
  import ResetPasswordDialog from './modules/reset-password-dialog.vue'
  import { useAdminStore } from '@/store/modules/admin'

  defineOptions({ name: 'Admin' })

  const adminStore = useAdminStore()

  type AdminListItem = Api.User.UserListItem & {
    adminLevel?: string
    lastLoginTime?: string
    permissions?: string[]
  }
  //const { getUserList } = UserService

  // 搜索表单引用
  const searchFormRef = ref<FormInstance>()

  // 搜索表单数据
  const searchForm = reactive({
    name: '',
    role: 'SUPERADMIN'
  })
  // 加载状态
  const isLoading = ref(false)

  // 分页相关
  const currentpage = ref(1)
  const page_size = ref(8)

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentAdminData = ref<Partial<AdminListItem>>({})

  // 修改密码弹窗相关
  const resetPasswordVisible = ref(false)
  const currentResetAdmin = ref<Partial<AdminListItem>>({})

  // 选中行
  const selectedRows = ref<AdminListItem[]>([])

  // 初始化数据
  onMounted(async () => {
    await getUserList()
  })

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    getUserList().then(() => {
      console.log('获取用户列表成功')
    })
    // 这里应该调用实际的搜索逻辑
    // 由于我们移除了useTable中的searchData和searchState，我们需要重新实现搜索逻辑
  }
  const getUserList = async () => {
    try {
      isLoading.value = true
      const params = {
        page: currentpage.value,
        page_size: page_size.value,

        ...searchForm
      }

      // 过滤掉空值参数
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== '' && value !== null && value !== undefined
        )
      )

      await adminStore.getAdmin(filteredParams)
    } catch (error) {
      console.error('获取用户列表失败:', error)
      ElMessage.error('获取用户列表失败')
    } finally {
      isLoading.value = false
    }
  }
  const onCurrentPageChange = (page: number) => {
    console.log('当前页:', page)
  }

  /**
   * 重置处理
   */
  const handleReset = () => {
    searchFormRef.value?.resetFields()
    Object.assign(searchForm, {
      name: '',
      adminType: ''
    })
  }
  const refreshAll = () => {
    getUserList()
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
    console.log('禁用管理员:', row)
    ElMessageBox.confirm(`确定要禁用该管理员吗？`, '禁用管理员', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      ElMessage.success('禁用成功')
      refreshAll()
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
    .admin-search {
      margin-bottom: 16px;

      .search-card {
        border: none;
        box-shadow: none;
        background: transparent;

        :deep(.el-card__body) {
          padding: 0;
        }
      }

      .search-form {
        .el-form-item {
          margin-right: 16px;
          margin-bottom: 0;
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
