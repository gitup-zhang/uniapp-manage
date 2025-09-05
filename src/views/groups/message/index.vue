<template>
  <div class="group-message-page">
    <ElCard class="message-card">
      <template #header>
        <div class="message-header">
          <div class="group-info">
            <ElAvatar :size="40" class="group-avatar">
              {{ groupInfo.group_name?.charAt(0) || '群' }}
            </ElAvatar>
            <div class="group-details">
              <h3 class="group-name">{{ groupInfo.group_name || '群聊' }}</h3>
              <p class="group-desc">{{ groupInfo.desc || '暂无描述' }}</p>
            </div>
          </div>
          <div class="message-actions">
            <ElButton @click="goBack">
              <ElIcon><ArrowLeft /></ElIcon>
              返回列表
            </ElButton>
            <!-- 添加发送消息按钮 -->
            <ElButton type="primary" @click="openSendMessageDialog">
              <ElIcon><Plus /></ElIcon>
              发送消息
            </ElButton>
          </div>
        </div>
      </template>

      <div class="message-container">
        <!-- 消息列表表格 -->
        <ElTable :data="groupStore.MessageList" style="width: 100%" height="600" border>
          <ElTableColumn type="index" label="序号" width="120" align="center" />
          <ElTableColumn prop="id" label="ID" width="120" />
          <ElTableColumn prop="title" label="标题" min-width="300" />
          <ElTableColumn prop="send_time" label="发送时间" width="200" align="center" />
          <ElTableColumn label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton size="small" type="primary" @click="viewMessageDetail(row)">
                查看详情
              </ElButton>
              <ElButton size="small" type="danger" @click="deleteMessage(row)"> 删除信息 </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="groupStore.MessageTotal"
            layout="total, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </ElCard>

    <!-- 消息详情对话框 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="消息详情"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="message-detail">
        <ElDescriptions :column="1" size="small" border>
          <ElDescriptionsItem label="标题">
            {{ currentMessage.title }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="发送时间">
            {{ currentMessage.send_time }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="消息内容">
            <div v-html="currentMessage.content"></div>
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="detailDialogVisible = false">关闭</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 发送消息对话框 -->
    <ElDialog
      v-model="sendMessageDialogVisible"
      title="发送新消息"
      width="600px"
      :close-on-click-modal="false"
    >
      <ElForm :model="messageForm" :rules="messageRules" ref="messageFormRef" label-width="80px">
        <ElFormItem label="消息标题" prop="title">
          <ElInput
            v-model="messageForm.title"
            type="textarea"
            :rows="1"
            placeholder="请输入要发送的消息标题"
            maxlength="50"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="消息内容" prop="content">
          <ArtWangEditor
            v-model="messageForm.content"
            :height="'200px'"
            placeholder="请输入消息详情内容..."
            :toolbar-keys="['uploadImage']"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="sendMessageDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="sendMessage" :loading="sending">发送消息</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, type FormInstance, type FormRules, ElMessageBox } from 'element-plus'
  import { ArrowLeft, Plus } from '@element-plus/icons-vue'
  import type { GroupItem, MessageInfo } from '@/api/modules/group'
  import { useGroupStore } from '@/store/modules/group'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import { groupService } from '@/api/groupApi'

  defineOptions({ name: 'GroupMessage' })

  const groupStore = useGroupStore()
  const route = useRoute()
  const router = useRouter()

  // 群组信息
  const groupInfo = ref<Partial<GroupItem>>({})
  const groupId = ref()

  // 消息相关状态
  const sending = ref(false)
  const detailDialogVisible = ref(false)
  // 新增发送消息对话框状态
  const sendMessageDialogVisible = ref(false)
  //   当前消息，点击查看详情
  const currentMessage = ref<MessageInfo>({
    id: 0,
    title: '',
    content: '',
    send_time: ''
  })

  // 表单引用
  const messageFormRef = ref<FormInstance>()

  // 消息表单数据
  const messageForm = reactive({
    title: '',
    content: ''
  })

  // 消息表单验证规则
  const messageRules: FormRules = {
    title: [
      { required: true, message: '请输入消息标题', trigger: 'blur' },
      { min: 1, max: 50, message: '消息标题长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }]
  }

  // 分页参数
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 返回列表
  const goBack = () => {
    router.push('/groups/list')
  }

  // 查看消息详情
  const viewMessageDetail = (row: MessageInfo) => {
    currentMessage.value = { ...row }
    detailDialogVisible.value = true
  }
  //   删除信息
  const deleteMessage = async (row: MessageInfo) => {
    ElMessageBox.confirm(`确定要删除消息"${row.title}"吗？此操作不可恢复。`, '删除消息', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await groupService.deleteMessage(row.id)
        ElMessage.success('删除成功')
        loadMessages()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // 打开发送消息对话框
  const openSendMessageDialog = () => {
    // 重置表单
    messageForm.title = ''
    messageForm.content = ''
    sendMessageDialogVisible.value = true
  }

  // 发送消息
  const sendMessage = async () => {
    if (!messageFormRef.value) return

    try {
      // 验证表单
      await messageFormRef.value.validate()

      sending.value = true

      // 模拟发送消息API调用
      await groupService.sendMessage(groupId.value, messageForm)

      ElMessage.success('消息发送成功')
      // 关闭对话框
      sendMessageDialogVisible.value = false
      // 重置表单
      messageForm.content = ''
      messageForm.title = ''
      loadMessages()
    } catch (error) {
      console.error('发送消息失败:', error)
      ElMessage.error('发送消息失败，请重试')
    } finally {
      sending.value = false
    }
  }

  // 当前页变化
  const handleCurrentChange = (page: number) => {
    currentPage.value = page
    loadMessages()
  }

  // 加载消息数据
  const loadMessages = async () => {
    await groupStore.getGroupMessage(groupId.value, { page: currentPage.value })
  }

  // 加载群组信息
  const loadGroupInfo = () => {
    groupId.value = parseInt(route.params.id as string, 10)

    try {
      // 尝试从 sessionStorage 获取群组信息
      const storedInfo = sessionStorage.getItem(`groupInfo_${groupId.value}`)
      if (storedInfo) {
        groupInfo.value = JSON.parse(storedInfo)
      } else {
        // 如果没有存储的信息，使用默认值
        groupInfo.value = {
          id: Number(groupId),
          group_name: '群组消息',
          desc: '群组消息列表'
        }
      }
    } catch (error) {
      console.error('加载群组信息失败:', error)
      ElMessage.error('加载群组信息失败')
      groupInfo.value = {
        id: Number(groupId),
        group_name: '群组消息',
        desc: '群组消息列表'
      }
    }
  }

  // 生命周期
  onMounted(() => {
    loadGroupInfo()
    loadMessages()
  })
</script>

<style lang="scss" scoped>
  .group-message-page {
    padding: 20px;
    height: calc(100vh - 40px);

    .message-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 8px;

      :deep(.el-card__header) {
        padding: 16px 20px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      :deep(.el-card__body) {
        flex: 1;
        padding: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    }

    .message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .group-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .group-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: bold;
        }

        .group-details {
          .group-name {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .group-desc {
            margin: 0;
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .message-actions {
        display: flex;
        gap: 10px;
      }
    }

    .message-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 20px;
      height: 100%;
      overflow: hidden;

      .pagination-wrapper {
        display: flex;
        justify-content: flex-end;
        padding: 16px 0;
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }

    .message-detail {
      .el-descriptions {
        :deep(.el-descriptions__label) {
          width: 80px;
        }
      }
    }
  }
</style>
