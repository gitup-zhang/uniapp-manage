<template>
  <div class="group-detail-page">
    <!-- 返回按钮 -->
    <div class="page-header">
      <ElButton @click="goBack" type="primary" link>
        <ElIcon><ArrowLeft /></ElIcon>
        返回群组列表
      </ElButton>
    </div>

    <!-- 群组基本信息 -->
    <ElCard class="group-info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>群组详情</h3>
          <ElTag v-if="groupDetail" :type="groupDetail.is_deleted === 'N' ? 'success' : 'danger'">
            {{ groupDetail.is_deleted === 'N' ? '正常' : '已删除' }}
          </ElTag>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <ElSkeleton :rows="4" animated />
      </div>

      <div v-else-if="groupDetail" class="group-detail-content">
        <ElDescriptions :column="2" size="large" border>
          <ElDescriptionsItem label="群组ID">{{ groupDetail.id }}</ElDescriptionsItem>
          <ElDescriptionsItem label="群组名称">{{ groupDetail.group_name }}</ElDescriptionsItem>
          <ElDescriptionsItem label="关联活动">
            {{ groupDetail.event_title || '无' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="包含全体用户">
            <ElTag :type="groupDetail.include_all_user === 'Y' ? 'success' : 'info'">
              {{ groupDetail.include_all_user === 'Y' ? '是' : '否' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间" :span="2">
            {{ formatDate(groupDetail.created_at) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="群组描述" :span="2">
            <div class="group-desc">
              {{ groupDetail.desc || '暂无描述' }}
            </div>
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <div v-else class="error-container">
        <ElEmpty description="加载群组信息失败" />
      </div>
    </ElCard>

    <!-- 群组成员列表 -->
    <ElCard class="members-card">
      <template #header>
        <div class="card-header">
          <h3>群组成员</h3>
          <div class="member-count">
            <ElTag>共 {{ memberPagination.total }} 名成员</ElTag>
          </div>
        </div>
      </template>

      <!-- 成员搜索 -->
      <div class="member-search">
        <ElForm :model="memberSearchForm" inline>
          <ElFormItem label="成员姓名">
            <ElInput
              v-model="memberSearchForm.name"
              placeholder="请输入成员姓名"
              clearable
              style="width: 200px"
            />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleMemberSearch" :loading="membersLoading">
              <ElIcon><Search /></ElIcon>
              搜索
            </ElButton>
            <ElButton @click="handleMemberReset">
              <ElIcon><Refresh /></ElIcon>
              重置
            </ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <!-- 成员表格 -->
      <ElTable
        :data="membersList"
        :loading="membersLoading"
        stripe
        border
        style="width: 100%"
        empty-text="暂无成员数据"
      >
        <ElTableColumn prop="user_id" label="用户ID" width="80" align="center" />
        <ElTableColumn prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <div class="member-name">
              <span>{{ row.name || '未知' }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="nickname" label="昵称" width="120">
          <template #default="{ row }">
            <span>{{ row.nickname || '未设置' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <ElTableColumn prop="phone_number" label="手机号" width="130" />
        <ElTableColumn prop="gender" label="性别" width="80" align="center" />
        <ElTableColumn prop="unit" label="单位" width="150" show-overflow-tooltip />
        <ElTableColumn prop="department" label="部门" width="120" show-overflow-tooltip />
        <ElTableColumn prop="position" label="职位" width="120" show-overflow-tooltip />
        <ElTableColumn prop="industry_name" label="行业" width="120" show-overflow-tooltip />
        <ElTableColumn prop="role_name" label="角色" width="100" align="center">
          <template #default="{ row }">
            <ElTag size="small" :type="getRoleTagType(row.role_name)">
              {{ row.role_name || '普通用户' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="joined_at" label="加入时间" width="160" align="center">
          <template #default="{ row }">
            <span>{{ formatDate(row.joined_at) }}</span>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="memberPagination.currentPage"
          v-model:page-size="memberPagination.pageSize"
          :total="memberPagination.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleMemberCurrentChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, Search, Refresh } from '@element-plus/icons-vue'
  import { groupService } from '@/api/groupApi'
  import type { GroupItem, GroupMember } from '@/api/modules/group'

  defineOptions({ name: 'GroupDetail' })

  const route = useRoute()
  const router = useRouter()

  // 响应式数据
  const loading = ref(false)
  const membersLoading = ref(false)
  const groupDetail = ref<GroupItem | null>(null)
  const membersList = ref<GroupMember[]>([])
  const isDataFromList = ref(false) // 标记数据是否来自列表页面

  // 成员搜索表单
  const memberSearchForm = reactive({
    name: ''
  })

  // 成员分页参数
  const memberPagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 获取群组ID
  const groupId = parseInt(route.params.id as string)

  // 从sessionStorage获取群组信息
  const getStoredGroupInfo = (): GroupItem | null => {
    try {
      const stored = sessionStorage.getItem(`groupInfo_${groupId}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('解析群组信息失败:', error)
    }
    return null
  }

  // 返回群组列表
  const goBack = () => {
    // 清理可能残留的缓存
    sessionStorage.removeItem(`groupInfo_${groupId}`)
    router.push('/groups/list')
  }

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '暂无'
    try {
      return new Date(dateStr).toLocaleString('zh-CN')
    } catch {
      return '暂无'
    }
  }

  // 获取角色标签类型
  const getRoleTagType = (role?: string) => {
    const roleMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      管理员: 'danger',
      超级管理员: 'danger',
      普通用户: 'info',
      高级用户: 'success'
    }
    return roleMap[role || ''] || 'info'
  }

  // 加载群组详情
  const loadGroupDetail = async () => {
    // 优先从sessionStorage获取群组信息
    const storedGroupInfo = getStoredGroupInfo()
    if (storedGroupInfo) {
      groupDetail.value = storedGroupInfo
      isDataFromList.value = true // 标记数据来源
      // 使用后清除缓存
      sessionStorage.removeItem(`groupInfo_${groupId}`)
      return
    }

    // 如果没有缓存数据，则通过API获取
    if (!groupId) {
      ElMessage.error('群组ID无效')
      goBack()
      return
    }

    loading.value = true
    isDataFromList.value = false // 标记数据来源
    try {
      const response = await groupService.getGroupDetail(groupId)
      groupDetail.value = response.data
    } catch (error) {
      console.error('加载群组详情失败:', error)
      ElMessage.error('加载群组详情失败，请重试')
    } finally {
      loading.value = false
    }
  }

  // 加载群组成员
  const loadGroupMembers = async () => {
    if (!groupId) return

    membersLoading.value = true
    try {
      const params = {
        page: memberPagination.currentPage,
        page_size: memberPagination.pageSize,
        ...(memberSearchForm.name && { name: memberSearchForm.name })
      }

      const response = await groupService.getGroupMembers(groupId, params)
      membersList.value = response.data || []
      memberPagination.total = response.total || 0
    } catch (error) {
      console.error('加载群组成员失败:', error)
      ElMessage.error('加载群组成员失败，请重试')
    } finally {
      membersLoading.value = false
    }
  }

  // 成员搜索
  const handleMemberSearch = () => {
    memberPagination.currentPage = 1
    loadGroupMembers()
  }

  // 重置成员搜索
  const handleMemberReset = () => {
    memberSearchForm.name = ''
    memberPagination.currentPage = 1
    loadGroupMembers()
  }

  // 成员分页变化
  const handleMemberCurrentChange = (page: number) => {
    memberPagination.currentPage = page
    loadGroupMembers()
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadGroupDetail()
    loadGroupMembers()
  })
</script>

<style lang="scss" scoped>
  .group-detail-page {
    padding: 20px;

    .page-header {
      margin-bottom: 20px;
    }

    .group-info-card,
    .members-card {
      margin-bottom: 20px;
      border-radius: 8px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .member-count {
          display: flex;
          align-items: center;
        }
      }

      .loading-container,
      .error-container {
        padding: 40px 0;
        text-align: center;
      }

      .group-detail-content {
        .group-desc {
          line-height: 1.6;
          color: var(--el-text-color-regular);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .data-source-tip {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--el-border-color-lighter);
          text-align: center;

          .el-tag {
            .el-icon {
              margin-right: 4px;
            }
          }
        }
      }

      .member-search {
        margin-bottom: 20px;
        padding: 16px;
        background: var(--el-bg-color-page);
        border-radius: 6px;
      }

      .member-name {
        font-weight: 500;
      }

      .pagination-wrapper {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    }

    :deep(.el-descriptions__label) {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    :deep(.el-descriptions__content) {
      color: var(--el-text-color-regular);
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
