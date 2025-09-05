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
          <div class="member-actions">
            <ElButton type="primary" @click="showAddUserDialog">
              <ElIcon><Plus /></ElIcon>
              添加用户
            </ElButton>
            <div class="member-count">
              <ElTag>共 {{ groupStore.groupMemberTotal }} 名成员</ElTag>
            </div>
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
        :data="groupStore.groupMembers"
        :loading="membersLoading"
        stripe
        border
        style="width: 100%"
        empty-text="暂无成员数据"
      >
        <ElTableColumn type="index" label="序号" width="80" align="center" />
        <ElTableColumn prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <div class="member-name">
              <span>{{ row.name || '未知' }}</span>
            </div>
          </template>
        </ElTableColumn>

        <!-- <ElTableColumn prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <ElTableColumn prop="phone_number" label="手机号" width="200" /> -->

        <ElTableColumn prop="unit" label="单位" width="200" show-overflow-tooltip />
        <ElTableColumn prop="department" label="部门" width="200" show-overflow-tooltip />
        <ElTableColumn prop="position" label="职位" width="200" show-overflow-tooltip />
        <ElTableColumn prop="industry_name" label="行业" width="200" show-overflow-tooltip />
        <!-- <ElTableColumn prop="joined_at" label="加入时间" width="160" align="center">
          <template #default="{ row }">
            <span>{{ formatDate(row.joined_at) }}</span>
          </template>
        </ElTableColumn> -->
        <ElTableColumn label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="danger"
              link
              @click="handleDeleteMember(row)"
              :loading="deletingMemberId === row.user_id"
            >
              <ElIcon><Delete /></ElIcon>
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="memberPagination.currentPage"
          v-model:page-size="memberPagination.pageSize"
          :total="groupStore.groupMemberTotal"
          layout="total, prev, pager, next, jumper"
          @current-change="handleMemberCurrentChange"
        />
      </div>
    </ElCard>

    <!-- 添加用户对话框 -->
    <ElDialog
      v-model="addUserDialogVisible"
      title="添加用户到群组"
      width="800px"
      @close="handleAddUserDialogClose"
    >
      <!-- 用户搜索 -->
      <div class="user-search">
        <ElForm :model="userSearchForm" inline>
          <ElFormItem label="用户姓名">
            <ElInput
              v-model="userSearchForm.name"
              placeholder="请输入用户姓名"
              clearable
              style="width: 200px"
            />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleUserSearch" :loading="usersLoading">
              <ElIcon><Search /></ElIcon>
              搜索
            </ElButton>
            <ElButton @click="handleUserReset">
              <ElIcon><Refresh /></ElIcon>
              重置
            </ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      <!-- 用户表格 -->
      <ElTable
        :data="groupStore.notInGroupMembers"
        :loading="usersLoading"
        stripe
        border
        style="width: 100%"
        empty-text="暂无用户数据"
        @selection-change="handleUserSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        <!-- <ElTableColumn prop="user_id" label="用户ID" width="80" align="center" /> -->
        <ElTableColumn prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <div class="member-name">
              <span>{{ row.name || '未知' }}</span>
            </div>
          </template>
        </ElTableColumn>
        <!-- <ElTableColumn prop="nickname" label="昵称" width="120">
          <template #default="{ row }">
            <span>{{ row.nickname || '未设置' }}</span>
          </template>
        </ElTableColumn> -->
        <ElTableColumn prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <ElTableColumn prop="phone_number" label="手机号" width="130" />
        <ElTableColumn prop="gender" label="性别" width="80" align="center" />
        <ElTableColumn prop="unit" label="单位" width="150" show-overflow-tooltip />
        <ElTableColumn prop="department" label="部门" width="120" show-overflow-tooltip />
        <ElTableColumn prop="position" label="职位" width="120" show-overflow-tooltip />
        <ElTableColumn prop="industry_name" label="行业" width="120" show-overflow-tooltip />
        <!-- <ElTableColumn prop="role_name" label="角色" width="100" align="center">
          <template #default="{ row }">
            <ElTag size="small" :type="getRoleTagType(row.role_name)">
              {{ row.role_name || '普通用户' }}
            </ElTag>
          </template>
        </ElTableColumn> -->
      </ElTable>

      <!-- 用户分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="userPagination.currentPage"
          v-model:page-size="userPagination.pageSize"
          :total="groupStore.notInGroupTotal"
          layout="total, prev, pager, next, jumper"
          @current-change="handleUserCurrentChange"
        />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="addUserDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleAddUsers" :loading="addingUsers">添加</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowLeft, Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
  import { groupService } from '@/api/groupApi'
  //import { UserService } from '@/api/usersApi'
  import type { GroupItem, GroupMember } from '@/api/modules/group'
  import type { UseInfo } from '@/api/modules/user'
  import { useGroupStore } from '@/store/modules/group'

  defineOptions({ name: 'GroupDetail' })

  const route = useRoute()
  const router = useRouter()
  const groupStore = useGroupStore()

  // 响应式数据
  const loading = ref(false)
  const membersLoading = ref(false)
  const usersLoading = ref(false)
  const addingUsers = ref(false)
  const deletingMemberId = ref<number | null>(null) // 正在删除的成员ID
  const groupDetail = ref<GroupItem | null>(null)
  //const membersList = ref<GroupMember[]>([])
  const userList = ref<UseInfo[]>([])
  const isDataFromList = ref(false) // 标记数据是否来自列表页面

  // 对话框控制
  const addUserDialogVisible = ref(false)

  // 成员搜索表单
  const memberSearchForm = reactive({
    name: ''
  })

  // 用户搜索表单
  const userSearchForm = reactive({
    name: ''
  })

  // 成员分页参数
  const memberPagination = reactive({
    currentPage: 1,
    pageSize: 10
  })

  // 用户分页参数
  const userPagination = reactive({
    currentPage: 1,
    pageSize: 10
  })

  // 选中的用户
  const selectedUsers = ref<UseInfo[]>([])

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
  // const getRoleTagType = (role?: string) => {
  //   const roleMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  //     管理员: 'danger',
  //     超级管理员: 'danger',
  //     普通用户: 'info',
  //     高级用户: 'success'
  //   }
  //   return roleMap[role || ''] || 'info'
  // }

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
      await groupStore.getGroupMembers(groupId, params)
      // const response = await groupService.getGroupMembers(groupId, params)
      // membersList.value = response.data || []
      // memberPagination.total = response.total || 0
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

  // 显示添加用户对话框
  const showAddUserDialog = async () => {
    addUserDialogVisible.value = true
    await loadUserList()
  }

  // 加载用户列表
  const loadUserList = async () => {
    if (!groupId) return

    usersLoading.value = true
    try {
      const params = {
        page: userPagination.currentPage,
        page_size: userPagination.pageSize,
        ...(userSearchForm.name && { name: userSearchForm.name }),
        group_id: groupId // 排除已在群组中的用户
      }

      await groupStore.getNotInGroupMembers(groupId, params)
    } catch (error) {
      console.error('加载用户列表失败:', error)
      ElMessage.error('加载用户列表失败，请重试')
    } finally {
      usersLoading.value = false
    }
  }

  // 用户搜索
  const handleUserSearch = () => {
    userPagination.currentPage = 1
    loadUserList()
  }

  // 重置用户搜索
  const handleUserReset = () => {
    userSearchForm.name = ''
    userPagination.currentPage = 1
    loadUserList()
  }

  // 用户分页变化
  const handleUserCurrentChange = (page: number) => {
    userPagination.currentPage = page
    loadUserList()
  }

  // 用户选择变化
  const handleUserSelectionChange = (selection: UseInfo[]) => {
    selectedUsers.value = selection
  }

  // 添加用户到群组
  const handleAddUsers = async () => {
    if (selectedUsers.value.length === 0) {
      ElMessage.warning('请至少选择一个用户')
      return
    }

    addingUsers.value = true
    try {
      const userIds = selectedUsers.value.map((user) => user.user_id)
      await groupService.addGroupMembers(groupId, { user_ids: userIds })

      ElMessage.success('添加用户成功')
      addUserDialogVisible.value = false

      // 重新加载群组成员
      memberPagination.currentPage = 1
      await loadGroupMembers()
    } catch (error) {
      console.error('添加用户失败:', error)
      ElMessage.error('添加用户失败，请重试')
    } finally {
      addingUsers.value = false
    }
  }

  // 关闭添加用户对话框
  const handleAddUserDialogClose = () => {
    // 重置用户列表和搜索条件
    userList.value = []
    userSearchForm.name = ''
    userPagination.currentPage = 1
    selectedUsers.value = []
  }

  // 删除群组成员
  const handleDeleteMember = async (member: GroupMember) => {
    ElMessageBox.confirm(
      `确定要将用户 "${member.name || member.nickname || '未知用户'}" 从群组中删除吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        if (!groupId) return

        deletingMemberId.value = member.user_id
        try {
          await groupService.deleteGroupMembers(groupId, { user_ids: [member.user_id] })
          ElMessage.success('删除成员成功')

          // 重新加载群组成员
          await loadGroupMembers()
        } catch (error) {
          console.error('删除成员失败:', error)
          ElMessage.error('删除成员失败，请重试')
        } finally {
          deletingMemberId.value = null
        }
      })
      .catch(() => {
        // 用户取消删除
      })
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

        .member-actions {
          display: flex;
          align-items: center;
          gap: 16px;
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

      .member-search,
      .user-search {
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

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }
</style>
