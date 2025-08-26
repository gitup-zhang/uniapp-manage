<!-- 活动创建 -->
<template>
  <div class="activity-create-page">
    <ElCard class="art-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>创建新活动</h3>
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
            <ElFormItem label="活动名称" prop="name">
              <ElInput v-model="formData.name" placeholder="请输入活动名称" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="活动类型" prop="type">
              <ElSelect v-model="formData.type" placeholder="请选择活动类型">
                <ElOption label="营销活动" value="marketing" />
                <ElOption label="品牌活动" value="brand" />
                <ElOption label="促销活动" value="promotion" />
                <ElOption label="用户活动" value="user" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="活动状态" prop="status">
              <ElSelect v-model="formData.status" placeholder="请选择活动状态">
                <ElOption label="待发布" value="pending" />
                <ElOption label="进行中" value="active" />
                <ElOption label="已结束" value="ended" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="报名开始时间" prop="registrationStartTime">
              <ElDatePicker
                v-model="formData.registrationStartTime"
                type="datetime"
                placeholder="请选择报名开始时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="报名结束时间" prop="registrationEndTime">
              <ElDatePicker
                v-model="formData.registrationEndTime"
                type="datetime"
                placeholder="请选择报名结束时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="活动开始时间" prop="startTime">
              <ElDatePicker
                v-model="formData.startTime"
                type="datetime"
                placeholder="请选择活动开始时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="活动结束时间" prop="endTime">
              <ElDatePicker
                v-model="formData.endTime"
                type="datetime"
                placeholder="请选择活动结束时间"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="活动封面" prop="cover">
              <ElUpload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="handleUpload"
              >
                <img v-if="formData.cover" :src="formData.cover" class="avatar" />
                <ElIcon v-else class="avatar-uploader-icon">
                  <Plus />
                </ElIcon>
              </ElUpload>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="活动展示图片" prop="displayImages">
              <ElUpload
                class="display-images-uploader"
                action="#"
                :file-list="displayImagesList"
                list-type="picture-card"
                :before-upload="beforeUpload"
                :http-request="handleDisplayImageUpload"
                :on-remove="handleRemoveDisplayImage"
                multiple
              >
                <ElIcon class="display-uploader-icon">
                  <Plus />
                </ElIcon>
              </ElUpload>
              <div class="upload-tip">最多可上传8张展示图片，每张图片大小不超过2MB</div>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="活动描述" prop="description">
              <ElInput
                v-model="formData.description"
                type="textarea"
                :rows="4"
                placeholder="请输入活动描述"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="活动详情" prop="content">
              <div class="editor-container">
                <ArtWangEditor
                  v-model="formData.content"
                  :height="'400px'"
                  placeholder="请输入活动详情内容..."
                />
              </div>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="参与人数限制" prop="maxParticipants">
              <ElInputNumber
                v-model="formData.maxParticipants"
                :min="0"
                :max="999999"
                placeholder="0表示不限制"
                style="width: 200px"
              />
              <span style="margin-left: 10px; color: #999">人（0表示不限制）</span>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="活动标签" prop="tags">
              <ElSelect
                v-model="formData.tags"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入活动标签"
                style="width: 100%"
              >
                <ElOption v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit" :loading="loading"> 创建活动 </ElButton>
          <ElButton @click="handleCancel"> 取消 </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import type { FormInstance, FormRules, UploadProps } from 'element-plus'

  defineOptions({ name: 'ActivityCreate' })

  const router = useRouter()
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  // 表单数据
  const formData = reactive({
    name: '',
    type: '',
    status: 'pending',
    registrationStartTime: '',
    registrationEndTime: '',
    startTime: '',
    endTime: '',
    cover: '',
    displayImages: [] as string[], // 活动展示图片数组
    description: '',
    content: '',
    maxParticipants: 0,
    tags: [] as string[]
  })

  // 可用标签
  const availableTags = ref([
    '营销',
    '促销',
    '品牌',
    '新品',
    '限时',
    '会员专享',
    '节日活动',
    '周年庆'
  ])

  // 表单验证规则
  const rules: FormRules = {
    name: [
      { required: true, message: '请输入活动名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
    status: [{ required: true, message: '请选择活动状态', trigger: 'change' }],
    registrationStartTime: [{ required: true, message: '请选择报名开始时间', trigger: 'change' }],
    registrationEndTime: [{ required: true, message: '请选择报名结束时间', trigger: 'change' }],
    startTime: [{ required: true, message: '请选择活动开始时间', trigger: 'change' }],
    endTime: [{ required: true, message: '请选择活动结束时间', trigger: 'change' }],
    description: [
      { required: true, message: '请输入活动描述', trigger: 'blur' },
      { min: 10, max: 200, message: '长度在 10 到 200 个字符', trigger: 'blur' }
    ]
  }

  // 上传前检查
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return false
    }
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过 2MB!')
      return false
    }
    return true
  }

  // 展示图片文件列表
  const displayImagesList = ref<any[]>([])

  // 处理封面上传
  const handleUpload = (option: any): Promise<void> => {
    return new Promise((resolve) => {
      // 这里应该调用实际的上传API
      // 现在模拟上传成功
      const file = option.file
      const reader = new FileReader()
      reader.onload = (e) => {
        formData.cover = e.target?.result as string
        resolve()
      }
      reader.readAsDataURL(file)
    })
  }

  // 处理展示图片上传
  const handleDisplayImageUpload = (option: any): Promise<void> => {
    return new Promise((resolve) => {
      // 检查图片数量限制
      if (formData.displayImages.length >= 8) {
        ElMessage.error('最多只能上传8张展示图片!')
        return
      }

      const file = option.file
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        formData.displayImages.push(imageUrl)

        // 更新文件列表显示
        displayImagesList.value.push({
          name: file.name,
          url: imageUrl,
          uid: file.uid || Date.now()
        })

        resolve()
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveDisplayImage = (file: any) => {
    const index = displayImagesList.value.findIndex((item) => item.uid === file.uid)
    if (index > -1) {
      displayImagesList.value.splice(index, 1)
      formData.displayImages.splice(index, 1)
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      // 这里应该调用创建活动的API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟API调用

      ElMessage.success('活动创建成功!')
      router.push('/activity/list')
    } catch (error) {
      console.error('创建失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 取消
  const handleCancel = () => {
    router.push('/activity/list')
  }
</script>

<style lang="scss" scoped>
  .activity-create-page {
    padding: 20px;
    min-height: 100vh;
    overflow-y: auto;

    .card-header {
      h3 {
        margin: 0;
        color: var(--art-text-gray-800);
      }
    }

    .editor-container {
      width: 100%;

      :deep(.editor-wrapper) {
        border: 1px solid var(--el-border-color);
        border-radius: 4px;

        .editor-toolbar {
          border-bottom: 1px solid var(--el-border-color);
        }
      }
    }

    .avatar-uploader {
      :deep(.el-upload) {
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);

        &:hover {
          border-color: var(--el-color-primary);
        }
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        text-align: center;
        line-height: 178px;
      }

      .avatar {
        width: 178px;
        height: 178px;
        display: block;
        object-fit: cover;
      }
    }

    .display-images-uploader {
      :deep(.el-upload--picture-card) {
        width: 100px;
        height: 100px;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);

        &:hover {
          border-color: var(--el-color-primary);
        }
      }

      :deep(.el-upload-list--picture-card .el-upload-list__item) {
        width: 100px;
        height: 100px;
        border-radius: 6px;
        margin-right: 8px;
        margin-bottom: 8px;
      }

      .display-uploader-icon {
        font-size: 24px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
      }
    }

    .upload-tip {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
      line-height: 1.4;
    }
  }
</style>
