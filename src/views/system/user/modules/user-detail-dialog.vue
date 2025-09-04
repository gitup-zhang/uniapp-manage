<template>
  <ElDialog v-model="dialogVisible" title="用户详情" width="500px" align-center>
    <div class="user-detail">
      <!-- 用户头像和基本信息 -->
      <div class="user-header">
        <img
          :src="userData?.avatar_url || '/src/assets/images/avatar/avatar-default.png'"
          class="user-avatar"
        />
        <div class="user-basic">
          <h3>{{ userData?.name || '未知' }}</h3>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="user-info">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">昵称：</span>
              <span class="value">{{ userData?.nickname || '未知' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">姓名：</span>
              <span class="value">{{ userData?.name || '未知' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">性别：</span>
              <span class="value">{{ userData?.gender || '未知' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">电话：</span>
              <span class="value">{{ userData?.phone || userData?.phone_number || '未知' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ userData?.email || '未知' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">岗位：</span>
              <span class="value">{{ userData?.position || '未知' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">部门：</span>
              <span class="value">{{ userData?.department || '未知' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">行业：</span>
              <span class="value">{{
                userData?.industry || userData?.industry_name || '未知'
              }}</span>
            </div>
          </ElCol>
          <ElCol :span="24">
            <div class="info-item">
              <span class="label">单位：</span>
              <span class="value">{{ userData?.company || userData?.unit || '未知' }}</span>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="info-item">
              <span class="label">角色：</span>
              <span class="value">{{ userData?.role_name || '未知' }}</span>
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
  interface Props {
    visible: boolean
    userData?: any
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

  // 状态文本映射
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
