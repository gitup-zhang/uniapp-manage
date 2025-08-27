<!-- 用户管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 如果你想使用 template 语法，请移步功能示例下面的高级表格示例 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model:filter="defaultFilter" @reset="resetSearch" @search="handleSearch" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 操作栏 -->
      <div class="table-header">
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
          <ElTableColumn type="index" label="序号" width="120" />
          <ElTableColumn label="姓名" width="160" prop="name" />
          <ElTableColumn label="性别" width="180" prop="gender" />
          <ElTableColumn label="电话" width="200" prop="phone" />
          <ElTableColumn label="邮箱" width="200" prop="email" />
          <ElTableColumn label="状态">
            <template #default="{ row }">
              <ElTag :type="getUserStatusConfig(row.status).type">
                {{ getUserStatusConfig(row.status).text }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <ElButton type="primary" link @click="showUserDetail(row)">查看</ElButton>
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

      <!-- 用户详情弹窗 -->
      <UserDetailDialog v-model:visible="detailVisible" :user-data="currentUserDetail" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElTag, ElTable, ElTableColumn, ElPagination, ElButton } from 'element-plus'
  import { Refresh } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import UserSearch from './modules/user-search.vue'
  import UserDetailDialog from './modules/user-detail-dialog.vue'

  defineOptions({ name: 'User' })

  type UserListItem = Api.User.UserListItem
  const { getUserList } = UserService

  // 用户详情弹窗相关
  const detailVisible = ref(false)
  const currentUserDetail = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 表单搜索初始值
  const defaultFilter = ref({
    name: undefined,
    level: 'normal',
    date: '2025-01-05',
    daterange: ['2025-01-01', '2025-02-10'],
    status: '1'
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '注销' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

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
  } = useTable<UserListItem>({
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
      // 数据转换器 - 直接返回模拟的用户数据
      dataTransformer: () => {
        // 直接返回模拟的用户数据
        return [
          {
            id: 1,
            name: '张三',
            gender: '男',
            phone: '13800138001',
            email: 'zhangsan@example.com',
            status: '1',
            avatar: '',
            position: '高级工程师',
            industry: '互联网',
            company: '阿里巴巴集团',
            department: '研发部',
            createTime: '2023-01-15',
            updateTime: '2023-01-15'
          },
          {
            id: 2,
            name: '李四',
            gender: '女',
            phone: '13800138002',
            email: 'lisi@example.com',
            status: '1',
            avatar: '',
            position: '产品经理',
            industry: '金融',
            company: '腾讯科技',
            department: '产品部',
            createTime: '2023-02-20',
            updateTime: '2023-02-20'
          },
          {
            id: 3,
            name: '王五',
            gender: '男',
            phone: '13800138003',
            email: 'wangwu@example.com',
            status: '2',
            avatar: '',
            position: '设计师',
            industry: '教育',
            company: '百度公司',
            department: '设计部',
            createTime: '2023-03-10',
            updateTime: '2023-03-10'
          },
          {
            id: 4,
            name: '赵六',
            gender: '女',
            phone: '13800138004',
            email: 'zhaoliu@example.com',
            status: '1',
            avatar: '',
            position: '项目经理',
            industry: '医疗',
            company: '京东集团',
            department: '运营部',
            createTime: '2023-04-05',
            updateTime: '2023-04-05'
          },
          {
            id: 5,
            name: '孙七',
            gender: '男',
            phone: '13800138005',
            email: 'sunqi@example.com',
            status: '3',
            avatar: '',
            position: '运营专员',
            industry: '电商',
            company: '美团点评',
            department: '市场部',
            createTime: '2023-05-12',
            updateTime: '2023-05-12'
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
   * 显示用户详情
   */
  const showUserDetail = (row: UserListItem): void => {
    console.log('查看用户详情:', row)
    currentUserDetail.value = row
    detailVisible.value = true
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  .user-page {
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
