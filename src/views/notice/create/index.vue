<!-- 新建公告 -->
<template>
  <div class="notice-create-page">
    <ElCard class="art-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>{{ isEdit ? '编辑公告' : '新建公告' }}</h3>
        </div>
      </template>

      <ElForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <ElRow :gutter="20">
          <ElCol :span="24">
            <ElFormItem label="公告标题" prop="title">
              <ElInput
                v-model="formData.title"
                placeholder="请输入公告标题"
                maxlength="100"
                show-word-limit
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="公告内容" prop="content">
              <div class="editor-container">
                <ArtWangEditor
                  v-model="formData.content"
                  :height="'400px'"
                  placeholder="请输入公告详细内容..."
                />
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem>
          <ElButton type="primary" @click="handleSave" :loading="loading">
            {{ isEdit ? '保存更新' : '创建公告' }}
          </ElButton>
          <ElButton @click="handleCancel"> 取消 </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  //  import type { CreateNoticeRequest, UpdateNoticeRequest } from '@/api/modules/notice'

  defineOptions({ name: 'NoticeCreate' })

  const router = useRouter()
  const route = useRoute()
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  // 判断是否为编辑模式
  const isEdit = ref(false)
  const noticeId = ref<number>()

  // 表单数据
  const formData = reactive({
    title: '',
    content: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    title: [
      { required: true, message: '请输入公告标题', trigger: 'blur' },
      { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    content: [
      { required: true, message: '请输入公告内容', trigger: 'blur' },
      { min: 1, message: '公告内容不能为空', trigger: 'blur' }
    ]
  }

  // 检查是否为编辑模式
  const checkEditMode = () => {
    const id = route.query.id
    const mode = route.query.mode

    if (id && mode === 'edit') {
      isEdit.value = true
      noticeId.value = Number(id)
      loadNoticeData()
    }
  }

  // 加载公告数据（编辑模式）
  const loadNoticeData = async () => {
    if (!noticeId.value) return

    try {
      loading.value = true
      // const response = await NoticeService.getNoticeDetail(noticeId.value)

      // 模拟数据
      const mockData = {
        id: noticeId.value,
        title: '系统维护通知',
        content:
          '<p>系统将于今晚进行维护升级，预计维护时间为2小时，维护期间可能影响正常使用，请合理安排时间。</p>',
        priority: 'high',
        is_top: true
      }

      Object.assign(formData, {
        title: mockData.title,
        content: mockData.content
      })
    } catch {
      ElMessage.error('加载公告数据失败')
      router.back()
    } finally {
      loading.value = false
    }
  }

  // 保存公告
  const handleSave = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      // 实际使用时可传递给API
      // const submitData = {
      //   ...formData
      // }

      if (isEdit.value && noticeId.value) {
        // 编辑模式
        // const updateData: UpdateNoticeRequest = {
        //   id: noticeId.value,
        //   ...submitData
        // }
        // await NoticeService.updateNotice(updateData)

        ElMessage.success('公告更新成功')
      } else {
        // 新建模式
        // const createData: CreateNoticeRequest = submitData
        // const response = await NoticeService.createNotice(createData)

        ElMessage.success('公告创建成功')
      }

      // 返回列表页
      router.push('/notice/list')
    } catch (error) {
      if (error !== false) {
        // 表单验证失败时不显示错误
        ElMessage.error('保存失败，请稍后重试')
      }
    } finally {
      loading.value = false
    }
  }

  // 取消操作
  const handleCancel = () => {
    router.back()
  }

  // 页面初始化
  onMounted(() => {
    checkEditMode()
  })
</script>

<style lang="scss" scoped>
  .notice-create-page {
    padding: 20px;
    height: calc(100vh - 120px);
    overflow-y: auto;

    .art-table-card {
      :deep(.el-card__header) {
        padding: 16px 20px;
        border-bottom: 1px solid var(--el-border-color-light);
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .card-header {
        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
    }

    .editor-container {
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      overflow: hidden;

      :deep(.w-e-text-container) {
        border: none !important;
      }

      :deep(.w-e-toolbar) {
        border-bottom: 1px solid var(--el-border-color) !important;
      }
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
    }

    :deep(.el-input__wrapper):hover {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }

    :deep(.el-textarea__inner) {
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
    }

    :deep(.el-textarea__inner):hover {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
</style>
