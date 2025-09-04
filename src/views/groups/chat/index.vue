<template>
  <div class="group-chat-page">
    <ElCard class="chat-card">
      <template #header>
        <div class="chat-header">
          <div class="group-info">
            <ElAvatar :size="40" class="group-avatar">
              {{ groupInfo.group_name?.charAt(0) || '群' }}
            </ElAvatar>
            <div class="group-details">
              <h3 class="group-name">{{ groupInfo.group_name || '群聊' }}</h3>
              <p class="group-desc">{{ groupInfo.desc || '暂无描述' }}</p>
            </div>
          </div>
          <div class="chat-actions">
            <ElButton @click="goBack">
              <ElIcon><ArrowLeft /></ElIcon>
              返回列表
            </ElButton>
          </div>
        </div>
      </template>

      <div class="chat-container">
        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="messageContainer">
          <template v-for="(message, index) in messages" :key="index">
            <div :class="['message-item', message.isMe ? 'message-right' : 'message-left']">
              <ElAvatar :size="32" :src="message.avatar" class="message-avatar">
                {{ message.sender.charAt(0) }}
              </ElAvatar>
              <div class="message-content">
                <div class="message-info">
                  <span class="sender-name">{{ message.sender }}</span>
                  <span class="message-time">{{ message.time }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- 聊天输入区域 -->
        <div class="chat-input">
          <ElInput
            v-model="messageText"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            resize="none"
            @keyup.enter.prevent="sendMessage"
          />
          <div class="input-actions">
            <div class="left-actions">
              <ElButton :icon="Picture" circle plain />
              <ElButton :icon="Paperclip" circle plain />
            </div>
            <ElButton type="primary" @click="sendMessage" :disabled="!messageText.trim()">
              发送
            </ElButton>
          </div>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, Picture, Paperclip } from '@element-plus/icons-vue'
  import type { GroupItem } from '@/api/modules/group'

  defineOptions({ name: 'GroupChat' })

  // 类型定义
  interface ChatMessage {
    id: number
    sender: string
    content: string
    time: string
    isMe: boolean
    avatar?: string
  }

  const route = useRoute()
  const router = useRouter()

  // 群组信息
  const groupInfo = ref<Partial<GroupItem>>({})

  // 聊天相关状态
  const messageText = ref('')
  const messageId = ref(10)
  const messageContainer = ref<HTMLElement | null>(null)

  // 初始化聊天消息数据
  const initializeMessages = (): ChatMessage[] => [
    {
      id: 1,
      sender: '系统消息',
      content: `欢迎来到群聊"${groupInfo.value.group_name || '群聊'}"！`,
      time: '10:00',
      isMe: false,
      avatar: ''
    },
    {
      id: 2,
      sender: '张三',
      content: '大家好，欢迎加入我们的群组！',
      time: '10:01',
      isMe: false,
      avatar: ''
    },
    {
      id: 3,
      sender: '李四',
      content: '感谢邀请，很高兴能和大家一起交流。',
      time: '10:02',
      isMe: false,
      avatar: ''
    },
    {
      id: 4,
      sender: '我',
      content: '大家好！很期待我们的合作。',
      time: '10:05',
      isMe: true,
      avatar: ''
    }
  ]

  const messages = ref<ChatMessage[]>([])

  // 工具函数
  const formatCurrentTime = (): string => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const scrollToBottom = (): void => {
    nextTick(() => {
      setTimeout(() => {
        if (messageContainer.value) {
          messageContainer.value.scrollTop = messageContainer.value.scrollHeight
        }
      }, 100)
    })
  }

  // 发送消息
  const sendMessage = (): void => {
    const text = messageText.value.trim()
    if (!text) return

    const newMessage: ChatMessage = {
      id: messageId.value++,
      sender: '我',
      content: text,
      time: formatCurrentTime(),
      isMe: true,
      avatar: ''
    }

    messages.value.push(newMessage)
    messageText.value = ''
    scrollToBottom()

    // 模拟系统回复
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: messageId.value++,
        sender: '群组助手',
        content: '消息已发送到群组，所有成员都将收到通知。',
        time: formatCurrentTime(),
        isMe: false,
        avatar: ''
      }
      messages.value.push(replyMessage)
      scrollToBottom()
    }, 1000)
  }

  // 返回列表
  const goBack = () => {
    router.push('/groups/list')
  }

  // 加载群组信息
  const loadGroupInfo = () => {
    const groupId = route.params.id as string

    try {
      // 尝试从 sessionStorage 获取群组信息
      const storedInfo = sessionStorage.getItem(`groupInfo_${groupId}`)
      if (storedInfo) {
        groupInfo.value = JSON.parse(storedInfo)
      } else {
        // 如果没有存储的信息，使用默认值
        groupInfo.value = {
          id: Number(groupId),
          group_name: '群组聊天',
          desc: '群组聊天室'
        }
      }

      // 初始化消息列表
      messages.value = initializeMessages()
      scrollToBottom()
    } catch (error) {
      console.error('加载群组信息失败:', error)
      ElMessage.error('加载群组信息失败')
      groupInfo.value = {
        id: Number(groupId),
        group_name: '群组聊天',
        desc: '群组聊天室'
      }

      // 初始化消息列表
      messages.value = initializeMessages()
    }
  }

  // 生命周期
  onMounted(() => {
    loadGroupInfo()
  })
</script>

<style lang="scss" scoped>
  .group-chat-page {
    padding: 20px;
    height: calc(100vh - 40px);

    .chat-card {
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

    .chat-header {
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
    }

    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;

      .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background-color: var(--el-bg-color-page);

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: var(--el-fill-color-lighter);
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--el-fill-color-dark);
          border-radius: 3px;

          &:hover {
            background: var(--el-fill-color-darker);
          }
        }

        .message-item {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: flex-start;

          &.message-left {
            .message-avatar {
              background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
              color: white;
            }

            .message-content {
              .message-text {
                background-color: white;
                border: 1px solid var(--el-border-color-lighter);
              }
            }
          }

          &.message-right {
            flex-direction: row-reverse;

            .message-avatar {
              background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
              color: white;
            }

            .message-content {
              align-items: flex-end;

              .message-info {
                flex-direction: row-reverse;
              }

              .message-text {
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                color: white;
              }
            }
          }

          .message-avatar {
            flex-shrink: 0;
            font-weight: bold;
          }

          .message-content {
            display: flex;
            flex-direction: column;
            max-width: 70%;

            .message-info {
              display: flex;
              gap: 8px;
              margin-bottom: 6px;
              font-size: 12px;

              .sender-name {
                font-weight: 500;
                color: var(--el-text-color-primary);
              }

              .message-time {
                color: var(--el-text-color-secondary);
              }
            }

            .message-text {
              padding: 12px 16px;
              border-radius: 12px;
              line-height: 1.4;
              font-size: 14px;
              word-wrap: break-word;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
          }
        }
      }

      .chat-input {
        padding: 20px;
        border-top: 1px solid var(--el-border-color-lighter);
        background-color: white;

        .input-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;

          .left-actions {
            display: flex;
            gap: 8px;
          }
        }

        :deep(.el-textarea__inner) {
          border-radius: 8px;
          resize: none;
        }
      }
    }
  }

  // 暗色主题适配
  .dark {
    .chat-container {
      .chat-messages {
        .message-item {
          &.message-left {
            .message-content .message-text {
              background-color: var(--el-fill-color);
              border-color: var(--el-border-color);
            }
          }
        }
      }

      .chat-input {
        background-color: var(--el-bg-color);
        border-color: var(--el-border-color);
      }
    }
  }
</style>
