<template>
  <ElDialog v-model="dialogVisible" title="用户详情" width="500px" align-center>
    <div class="user-detail">
      <!-- 用户头像和基本信息 -->
      <div class="user-header">
        <img
          :src="userData?.avatar || '/src/assets/images/avatar/avatar-default.png'"
          class="user-avatar"
        />
        <div class="user-basic">
          <h3>{{ userData?.name }}</h3>
          <ElTag :type="getStatusType(userData?.status)">
            {{ getStatusText(userData?.status) }}
          </ElTag>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="user-info">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">姓名：</span>
              <span class="value">{{ userData?.name || '-' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">性别：</span>
              <span class="value">{{ userData?.gender || '-' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">电话：</span>
              <span class="value">{{ userData?.phone || '-' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ userData?.email || '-' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">职位：</span>
              <span class="value">{{ userData?.position || '-' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">行业：</span>
              <span class="value">{{ userData?.industry || '-' }}</span>
            </div>
          </ElCol>
          <ElCol :span="24">
            <div class="info-item">
              <span class="label">单位：</span>
              <span class="value">{{ userData?.company || '-' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">部门：</span>
              <span class="value">{{ userData?.department || '-' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ userData?.createTime || '-' }}</span>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElTag } from 'element-plus'

  interface Props {
    visible: boolean
    userData?: Api.User.UserListItem | Record<string, any>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 状态类型映射
  const getStatusType = (status?: string) => {
    const statusMap = {
      '1': 'success',
      '2': 'info',
      '3': 'warning',
      '4': 'danger'
    } as const
    return statusMap[status as keyof typeof statusMap] || 'info'
  }

  // 状态文本映射
  const getStatusText = (status?: string) => {
    const statusMap = {
      '1': '在线',
      '2': '离线',
      '3': '异常',
      '4': '注销'
    }
    return statusMap[status as keyof typeof statusMap] || '未知'
  }
</script>

<style lang="scss" scoped>
  .user-detail {
    .user-header {
      display: flex;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid var(--el-border-color-light);
      margin-bottom: 20px;

      .user-avatar {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        margin-right: 16px;
        object-fit: cover;
      }

      .user-basic {
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: var(--el-text-color-primary);
        }
      }
    }

    .user-info {
      .info-item {
        display: flex;
        margin-bottom: 16px;

        .label {
          font-weight: 500;
          color: var(--el-text-color-regular);
          min-width: 60px;
          flex-shrink: 0;
        }

        .value {
          color: var(--el-text-color-primary);
          word-break: break-all;
        }
      }
    }
  }

  .dialog-footer {
    text-align: center;
  }
</style>
