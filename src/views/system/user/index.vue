<!-- 用户管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 如果你想使用 template 语法，请移步功能示例下面的高级表格示例 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" :inline="true" class="search-form">
        <ElFormItem label="姓名">
          <ElInput
            v-model="searchForm.name"
            placeholder="请输入用户姓名"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="性别">
          <ElSelect
            v-model="searchForm.gender_code"
            placeholder="请选择性别"
            clearable
            style="width: 120px"
          >
            <ElOption label="男" value="M" />
            <ElOption label="女" value="F" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="单位">
          <ElInput
            v-model="searchForm.unit"
            placeholder="请输入单位"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="部门">
          <ElInput
            v-model="searchForm.department"
            placeholder="请输入部门"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="岗位">
          <ElInput
            v-model="searchForm.position"
            placeholder="请输入岗位"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :icon="Search" @click="handleSearch">搜索</ElButton>
          <ElButton :icon="Refresh" @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格 -->
      <div class="table-wrapper">
        <ElTable
          :data="groupStore.userList"
          @selection-change="handleSelectionChange"
          :loading="loading"
          style="width: 100%; flex: 1"
          border
          stripe
        >
          <ElTableColumn type="index" label="序号" width="120" />
          <ElTableColumn label="姓名" width="160" prop="name">
            <template #default="{ row }">
              <span>{{ row.name || '未知' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="性别" width="120" prop="gender" />
          <ElTableColumn label="电话" width="180" prop="phone_number">
            <template #default="{ row }">
              <span>{{ row.phone_number || '未知' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="邮箱" width="200" prop="email" />
          <ElTableColumn label="单位" width="160" prop="unit" />
          <ElTableColumn label="部门" width="140" prop="department" />
          <ElTableColumn label="岗位" width="140" prop="position" />

          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <ElButton type="primary" link @click="showUserDetail(row)">查看</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页组件 -->
        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="currentpage"
            v-model:page-size="page_size"
            :total="groupStore.userTotal"
            layout="total,  prev, pager, next, jumper"
            @current-change="onCurrentPageChange"
          />
        </div>
      </div>

      <!-- 用户详情弹窗 -->
      <UserDetailDialog v-model:visible="detailVisible" :user-data="currentUserDetail" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import {
    ElTable,
    ElTableColumn,
    ElPagination,
    ElButton,
    ElCard,
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElMessage
  } from 'element-plus'
  import { Refresh, Search } from '@element-plus/icons-vue'
  import { onMounted } from 'vue'

  import UserDetailDialog from './modules/user-detail-dialog.vue'
  import { useGroupStore } from '@/store/modules/group'
  import { UseInfo } from '@/api/modules/user'

  defineOptions({ name: 'User' })

  const groupStore = useGroupStore()

  // 用户详情弹窗相关
  const detailVisible = ref(false)
  const currentUserDetail = ref<Partial<UseInfo>>({})

  // 选中行
  const selectedRows = ref<UseInfo[]>([])

  // 搜索表单数据
  const searchForm = ref({
    name: '',
    gender_code: '',
    unit: '',
    department: '',
    position: ''
  })

  // 分页相关
  const currentpage = ref(1)
  const page_size = ref(8)

  // 加载状态
  const loading = ref(false)

  /**
   * 获取用户列表
   */
  const getUserList = async () => {
    try {
      loading.value = true
      const params = {
        page: currentpage.value,
        page_size: page_size.value,
        role: 'USER',

        ...searchForm.value
      }

      // 过滤掉空值参数
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== '' && value !== null && value !== undefined
        )
      )

      await groupStore.getUserInfoList(filteredParams)
    } catch (error) {
      console.error('获取用户列表失败:', error)
      ElMessage.error('获取用户列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置搜索表单
   */
  const handleReset = () => {
    searchForm.value = {
      name: '',
      gender_code: '',
      unit: '',
      department: '',
      position: ''
    }
    // 重置分页并重新搜索
    currentpage.value = 1
    getUserList()
  }

  /**
   * 搜索
   */
  const handleSearch = async () => {
    currentpage.value = 1
    await getUserList()
  }

  /**
   * 分页变化
   */
  const onCurrentPageChange = (page: number) => {
    currentpage.value = page
    getUserList()
  }

  /**
   * 页码大小变化
   */

  /**
   * 显示用户详情
   */
  const showUserDetail = (row: UseInfo): void => {
    console.log('查看用户详情:', row)
    currentUserDetail.value = row
    detailVisible.value = true
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UseInfo[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }

  // 组件挂载时获取数据
  onMounted(() => {
    getUserList()
  })
</script>

<style lang="scss" scoped>
  .user-page {
    .search-card {
      margin-bottom: 16px;

      .search-form {
        .el-form-item {
          margin-bottom: 16px;
        }
      }
    }

    .table-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 12px;
      flex-shrink: 0;

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

    :deep(.user) {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
