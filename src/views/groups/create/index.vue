<template>
  <div class="group-create-page">
    <ElCard class="create-card">
      <template #header>
        <div class="card-header">
          <h2>创建群组</h2>
          <p class="card-subtitle">创建一个新的群组来管理成员和消息</p>
        </div>
      </template>

      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" size="large">
        <ElFormItem label="群组名称" prop="group_name" required>
          <ElInput
            v-model="form.group_name"
            placeholder="请输入群组名称"
            maxlength="50"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem label="群组描述" prop="desc">
          <ElInput
            v-model="form.desc"
            type="textarea"
            placeholder="请输入群组描述"
            :rows="4"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem label="是否包含全部成员" prop="include_all_user" required>
          <ElRadioGroup v-model="form.include_all_user">
            <ElRadio value="Y">包含全部成员</ElRadio>
            <ElRadio value="N">选择部分成员</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem v-if="form.include_all_user === 'N'" label="选择成员" prop="user_ids">
          <div class="user-selection">
            <div class="selected-users">
              <ElTag
                v-for="userId in form.user_ids"
                :key="userId"
                closable
                @close="removeUser(userId)"
                class="user-tag"
              >
                {{ getUserName(userId) }}
              </ElTag>
              <span v-if="form.user_ids.length === 0" class="empty-text">未选择任何成员</span>
            </div>
            <ElButton @click="openUserSelector" type="primary" plain>
              <ElIcon><Plus /></ElIcon>
              添加成员
            </ElButton>
          </div>
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit" :loading="loading" size="large">
            <ElIcon><Plus /></ElIcon>
            创建群组
          </ElButton>
          <ElButton @click="handleReset" size="large">
            <ElIcon><Refresh /></ElIcon>
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 用户选择器弹框 -->
    <ElDialog v-model="showUserSelector" title="选择成员" width="700px">
      <div class="user-selector">
        <!-- 批量操作栏 -->
        <div class="batch-actions">
          <ElCheckbox
            :model-value="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
          >
            全选当前页
          </ElCheckbox>
          <div class="selected-count">已选择 {{ selectedUsers.length }} 人</div>
        </div>

        <!-- 用户列表 -->
        <div class="user-list" v-loading="userSelectorLoading">
          <div v-for="user in availableUsers" :key="user.id" class="user-item">
            <ElCheckbox
              :model-value="selectedUsers.includes(user.id)"
              @change="(checked) => handleUserSelect(user.id, checked)"
              class="user-checkbox"
            />
            <ElAvatar :size="36" class="user-avatar">
              {{ user.name !== '未知' ? user.name.charAt(0) : '?' }}
            </ElAvatar>
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-details">
                <span class="user-email">邮箱: {{ user.email }}</span>
                <span class="user-phone">手机: {{ user.phone }}</span>
              </div>
            </div>
          </div>
          <div v-if="availableUsers.length === 0" class="empty-users">
            <ElEmpty description="当前页没有可选择的用户" />
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="groupStore.userTotal"
            layout="total, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="cancelSelection">取消</ElButton>
          <ElButton type="primary" @click="confirmAddUsers" :disabled="selectedUsers.length === 0">
            确认添加 ({{ selectedUsers.length }})
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, type FormInstance, type CheckboxValueType } from 'element-plus'
  import { Plus, Refresh } from '@element-plus/icons-vue'
  import { useGroupStore } from '@/store/modules/group'
  import { groupService } from '@/api/groupApi'
  import { router } from '@/router'

  defineOptions({ name: 'GroupCreate' })

  const groupStore = useGroupStore()

  // 表单引用
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const showUserSelector = ref(false)
  const selectedUsers = ref<number[]>([])
  const userSelectorLoading = ref(false)

  const params = reactive({
    page: 1,
    page_size: 10
  })
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 从 Pinia 获取用户数据，并转换为页面需要的格式
  const allUsers = computed(() => {
    return groupStore.userList.map((user) => ({
      id: user.user_id,
      name: user.name || '未知',
      nickname: user.nickname || '未知',
      email: user.email || '未知',
      phone: user.phone_number || '未知'
    }))
  })

  // 表单数据
  const form = reactive({
    group_name: '',
    desc: '',
    include_all_user: 'Y',
    user_ids: [] as number[]
  })

  // 表单验证规则
  const rules = {
    group_name: [
      { required: true, message: '请输入群组名称', trigger: 'blur' },
      { min: 2, max: 50, message: '群组名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    include_all_user: [{ required: true, message: '请选择是否包含全部成员', trigger: 'change' }],
    desc: [{ max: 200, message: '描述不能超过200个字符', trigger: 'blur' }]
  }
  onMounted(async () => {
    // 获取用户列表
    await groupStore.getUserInfoList(params)
  })

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      // 打印提交的表单数据结构
      console.log('提交的表单数据:', {
        group_name: form.group_name,
        desc: form.desc,
        include_all_user: form.include_all_user,
        user_ids: form.user_ids
      })

      // 模拟API调用
      //await groupStore.
      await groupService.createGroup(form)

      ElMessage.success('群组创建成功！')

      // 重置表单
      handleReset()
      router.push('/groups/list')
    } catch (error) {
      console.error('创建群组失败:', error)
      ElMessage.error('创建群组失败，请重试')
    } finally {
      loading.value = false
    }
  }

  // 重置表单
  const handleReset = () => {
    if (formRef.value) {
      formRef.value.resetFields()
      // 清空用户选择
      form.user_ids = []
    }
  }

  // 获取用户名称
  const getUserName = (userId: number) => {
    const user = allUsers.value.find((u) => u.id === userId)
    return user ? user.name : `用户${userId}`
  }

  // 移除用户
  const removeUser = (userId: number) => {
    const index = form.user_ids.indexOf(userId)
    if (index > -1) {
      form.user_ids.splice(index, 1)
    }
  }

  // 获取可选择的用户（排除已选择的）
  const availableUsers = computed(() => {
    // 直接使用从后端获取的数据，不进行前端分页
    return allUsers.value.filter((user) => !form.user_ids.includes(user.id))
  })

  // 处理分页变化
  const handleCurrentChange = async (page: number) => {
    currentPage.value = page
    params.page = page
    // 调用API获取对应页的数据
    await groupStore.getUserInfoList(params)
  }

  // 处理每页条数变化
  const handleSizeChange = async (size: number) => {
    pageSize.value = size
    params.page_size = size
    currentPage.value = 1
    params.page = 1
    // 调用API获取数据
    await groupStore.getUserInfoList(params)
  }

  // 处理用户选择状态变化
  const handleUserSelect = (userId: number, checked: CheckboxValueType) => {
    const isChecked = Boolean(checked)
    if (isChecked) {
      if (!selectedUsers.value.includes(userId)) {
        selectedUsers.value.push(userId)
      }
    } else {
      const index = selectedUsers.value.indexOf(userId)
      if (index > -1) {
        selectedUsers.value.splice(index, 1)
      }
    }
  }

  // 全选/反选当前页
  const handleSelectAll = (checked: CheckboxValueType) => {
    const isChecked = Boolean(checked)
    if (isChecked) {
      availableUsers.value.forEach((user) => {
        if (!selectedUsers.value.includes(user.id)) {
          selectedUsers.value.push(user.id)
        }
      })
    } else {
      availableUsers.value.forEach((user) => {
        const index = selectedUsers.value.indexOf(user.id)
        if (index > -1) {
          selectedUsers.value.splice(index, 1)
        }
      })
    }
  }

  // 检查当前页是否全选
  const isAllSelected = computed(() => {
    return (
      availableUsers.value.length > 0 &&
      availableUsers.value.every((user) => selectedUsers.value.includes(user.id))
    )
  })

  // 检查当前页是否部分选择
  const isIndeterminate = computed(() => {
    const selectedCount = availableUsers.value.filter((user) =>
      selectedUsers.value.includes(user.id)
    ).length
    return selectedCount > 0 && selectedCount < availableUsers.value.length
  })

  // 确认添加选中的用户
  const confirmAddUsers = () => {
    selectedUsers.value.forEach((userId) => {
      if (!form.user_ids.includes(userId)) {
        form.user_ids.push(userId)
      }
    })
    selectedUsers.value = []
    showUserSelector.value = false
  }

  // 取消选择
  const cancelSelection = () => {
    selectedUsers.value = []
    showUserSelector.value = false
  }

  // 打开用户选择器
  const openUserSelector = async () => {
    selectedUsers.value = []
    currentPage.value = 1
    params.page = 1
    // 重新获取第一页数据
    await groupStore.getUserInfoList(params)
    showUserSelector.value = true
  }
</script>

<style lang="scss" scoped>
  .group-create-page {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;

    .create-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      .card-header {
        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .card-subtitle {
          margin: 0;
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
      }
    }

    :deep(.el-form) {
      padding: 20px 0;

      .el-form-item__label {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .el-button {
        border-radius: 8px;
        padding: 12px 24px;
        font-weight: 500;

        + .el-button {
          margin-left: 12px;
        }
      }
    }

    .user-selection {
      .selected-users {
        margin-bottom: 12px;
        min-height: 32px;
        padding: 8px;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;

        .user-tag {
          margin: 0;
        }

        .empty-text {
          color: var(--el-text-color-placeholder);
          font-size: 14px;
        }
      }
    }
  }

  .user-selector {
    .batch-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-light);
      margin-bottom: 16px;

      .selected-count {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }

    .user-list {
      max-height: 400px;
      overflow-y: auto;
      min-height: 200px;

      .user-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border-radius: 8px;
        transition: background-color 0.2s;
        border: 1px solid transparent;

        &:hover {
          background-color: var(--el-bg-color-page);
          border-color: var(--el-border-color);
        }

        .user-checkbox {
          margin-right: 12px;
        }

        .user-avatar {
          margin-right: 12px;
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;

          .user-name {
            font-weight: 500;
            margin-bottom: 4px;
            font-size: 14px;
          }

          .user-details {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: var(--el-text-color-regular);

            .user-email {
              color: var(--el-text-color-regular);
            }

            .user-phone {
              color: var(--el-color-success);
              background: var(--el-color-success-light-9);
              padding: 2px 6px;
              border-radius: 4px;
            }
          }
        }
      }

      .empty-users {
        text-align: center;
        padding: 60px 0;
      }
    }

    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-light);
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
