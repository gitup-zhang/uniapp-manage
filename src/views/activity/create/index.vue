<!-- 活动创建 -->
<template>
  <div class="activity-create-page">
    <ElCard class="art-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>{{ isEditMode ? '编辑活动' : '创建新活动' }}</h3>
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
            <ElFormItem label="活动名称" prop="title">
              <ElInput v-model="formData.title" placeholder="请输入活动名称" />
            </ElFormItem>
          </ElCol>

          <!-- <ElCol :span="12">
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
          </ElCol> -->

          <ElCol :span="12">
            <ElFormItem label="报名开始时间" prop="registration_start_time">
              <ElDatePicker
                v-model="formData.registration_start_time"
                type="datetime"
                placeholder="请选择报名开始时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="报名结束时间" prop="registration_end_time">
              <ElDatePicker
                v-model="formData.registration_end_time"
                type="datetime"
                placeholder="请选择报名结束时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="活动开始时间" prop="event_start_time">
              <ElDatePicker
                v-model="formData.event_start_time"
                type="datetime"
                placeholder="请选择活动开始时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="活动结束时间" prop="event_end_time">
              <ElDatePicker
                v-model="formData.event_end_time"
                type="datetime"
                placeholder="请选择活动结束时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="活动封面" prop="cover_image_url">
              <ElUpload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="handleUpload"
              >
                <img
                  v-if="formData.cover_image_url"
                  :src="formData.cover_image_url"
                  class="avatar"
                />
                <ElIcon v-else class="avatar-uploader-icon">
                  <Plus />
                </ElIcon>
              </ElUpload>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="活动展示图片" prop="image_id_list">
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
              <div class="upload-tip">最多可上传8张展示图片，每张图片大小不超过4MB</div>
            </ElFormItem>
          </ElCol>

          <!-- <ElCol :span="24">
            <ElFormItem label="活动描述" prop="description">
              <ElInput
                v-model="formData.description"
                type="textarea"
                :rows="4"
                placeholder="请输入活动描述"
              />
            </ElFormItem>
          </ElCol> -->

          <ElCol :span="24">
            <ElFormItem label="活动详情" prop="detail">
              <div class="editor-container">
                <ArtWangEditor
                  v-model="formData.detail"
                  :height="'400px'"
                  placeholder="请输入活动详情内容..."
                />
              </div>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="活动地址" prop="event_address">
              <ElInput v-model="formData.event_address" placeholder="请输入活动地址" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="所需费用" prop="registration_fee">
              <ElInputNumber
                v-model="formData.registration_fee"
                :min="0"
                :max="999999"
                :precision="2"
                placeholder="请输入费用"
                style="width: 200px"
              />
              <span style="margin-left: 10px; color: #999">元（0表示免费）</span>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="个人信息" prop="tags">
              <ElSelect
                v-model="formData.tags"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入所需的个人信息"
                style="width: 100%"
              >
                <ElOption v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit" :loading="loading">
            {{ isEditMode ? '更新活动' : '创建活动' }}
          </ElButton>
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
  import { imageService } from '@/api/image'
  import { ApiStatus } from '@/utils/http/status'
  import { ActivityService } from '@/api/activityApi'
  import { useActivityStore } from '@/store/modules/activity'
  import { ref, reactive, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  defineOptions({ name: 'ActivityCreate' })

  const route = useRoute()
  const router = useRouter()
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const activityStore = useActivityStore()

  // 编辑模式相关变量
  const isEditMode = ref(false)
  const activityId = ref<number | null>(null)

  // 表单数据
  const formData = reactive({
    title: '',
    registration_start_time: '',
    registration_end_time: '',
    event_start_time: '',
    event_end_time: '',
    cover_image_url: '',
    image_id_list: [] as number[], // 活动展示图片数组
    detail: '',
    event_address: '',
    registration_fee: 0,
    tags: [] as string[]
  })

  // 可用标签
  const availableTags = ref(['手机号', '邮箱', '行业', '职业', '部门', '单位', '姓名'])

  // 表单验证规则
  const rules: FormRules = {
    title: [
      { required: true, message: '请输入活动名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    registration_start_time: [{ required: true, message: '请选择报名开始时间', trigger: 'change' }],
    registration_end_time: [{ required: true, message: '请选择报名结束时间', trigger: 'change' }],
    event_start_time: [{ required: true, message: '请选择活动开始时间', trigger: 'change' }],
    event_end_time: [{ required: true, message: '请选择活动结束时间', trigger: 'change' }],
    description: [
      { required: true, message: '请输入活动描述', trigger: 'blur' },
      { min: 10, max: 200, message: '长度在 10 到 200 个字符', trigger: 'blur' }
    ],
    event_address: [
      { required: true, message: '请输入活动地址', trigger: 'blur' },
      { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    registration_fee: [
      { required: true, message: '请输入所需费用', trigger: 'blur' },
      { type: 'number', min: 0, message: '费用不能小于0', trigger: 'blur' }
    ]
  }

  // 上传前检查
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 4

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
  const handleUpload = async (option: any): Promise<void> => {
    const file = option.file
    const uploadData = new FormData()

    // 添加文件
    uploadData.append('file', file)

    // 只添加biz_type参数
    uploadData.append('biz_type', 'EVENT')

    try {
      const response = await imageService.uploadImage(uploadData)

      if (response.code === ApiStatus.success) {
        // 上传成功，设置封面图片URL
        formData.cover_image_url = response.data.url
        ElMessage.success('封面上传成功！')
      } else {
        ElMessage.error('封面上传失败：' + response.message)
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('封面上传错误:', error)
      ElMessage.error('封面上传失败，请重试')
      throw error
    }
  }

  // 处理展示图片上传
  const handleDisplayImageUpload = async (option: any): Promise<void> => {
    console.log('处理展示图片上传:', option)
    // 检查图片数量限制
    if (formData.image_id_list.length >= 8) {
      ElMessage.error('最多只能上传8张展示图片!')
      throw new Error('图片数量超出限制')
    }

    const file = option.file
    const uploadData = new FormData()

    // 添加文件
    uploadData.append('file', file)

    // 只添加biz_type参数
    uploadData.append('biz_type', 'EVENT')

    try {
      const response = await imageService.uploadImage(uploadData)

      if (response.code === ApiStatus.success) {
        // 上传成功，添加到展示图片数组
        formData.image_id_list.push(response.data.id)

        // 更新文件列表显示
        displayImagesList.value.push({
          name: file.name,
          url: response.data.url,
          uid: file.uid || Date.now(),
          id: response.data.id
        })

        ElMessage.success('图片上传成功！')
      } else {
        ElMessage.error('图片上传失败：' + response.message)
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('展示图片上传错误:', error)
      ElMessage.error('图片上传失败，请重试')
      throw error
    }
  }

  const handleRemoveDisplayImage = (file: any) => {
    console.log('handleRemoveDisplayImage', file)
    const index = displayImagesList.value.findIndex((item) => item.uid === file.uid)
    if (index > -1) {
      const imageItem = displayImagesList.value[index]
      console.log('删除的id', imageItem.id)

      // 如果是新上传的图片（有id且不是编辑模式下的原始图片），则调用删除API
      if (imageItem.id && typeof imageItem.id === 'number' && imageItem.id > 0) {
        imageService.deleteImage(imageItem.id)
      }

      displayImagesList.value.splice(index, 1)
      // 同步更新image_id_list
      if (formData.image_id_list.length > index) {
        formData.image_id_list.splice(index, 1)
      }
    }
  }
  // 恢复初始状态函数
  const resetFormData = () => {
    formData.title = ''
    formData.registration_start_time = ''
    formData.registration_end_time = ''
    formData.event_start_time = ''
    formData.event_end_time = ''
    formData.cover_image_url = ''
    formData.image_id_list = []
    formData.detail = ''
    formData.event_address = ''
    formData.registration_fee = 0
    formData.tags = []
  }

  // 提交表单
  const handleSubmit = async () => {
    console.log('提交表单', formData)
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      loading.value = true

      if (isEditMode.value && activityId.value) {
        // 编辑模式：更新活动
        await ActivityService.updateActivity(activityId.value, formData)
        ElMessage.success('活动更新成功!')
      } else {
        // 创建模式：创建新活动
        await ActivityService.createActivity(formData)
        ElMessage.success('活动创建成功!')
      }
      resetFormData()

      router.push('/activity/list')
    } catch (error) {
      console.error(isEditMode.value ? '更新失败:' : '创建失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 取消
  const handleCancel = () => {
    router.push('/activity/list')
  }

  // 初始化页面数据
  const initPageData = async () => {
    resetFormData()
    const { id, mode } = route.query

    if (mode === 'edit' && id) {
      isEditMode.value = true
      activityId.value = Number(id)

      try {
        loading.value = true
        // 获取活动详情
        await activityStore.getActivityDetail(activityId.value)
        const activityDetail = activityStore.ActivityDetail

        // 填充表单数据
        Object.assign(formData, {
          title: activityDetail.title || '',
          registration_start_time: activityDetail.registration_start_time || '',
          registration_end_time: activityDetail.registration_end_time || '',
          event_start_time: activityDetail.event_start_time || '',
          event_end_time: activityDetail.event_end_time || '',
          detail: activityDetail.detail || '',
          event_address: activityDetail.event_address || '',
          registration_fee: activityDetail.registration_fee || 0,
          tags: [] // 如果后端返回tags数据，这里需要相应调整
        })

        // 处理图片数据
        if (activityDetail.images && activityDetail.images.length > 0) {
          // 设置封面图片（取第一张图片作为封面）
          formData.cover_image_url = activityDetail.images[0] || ''

          // 处理展示图片列表（除了封面图片外的其他图片）
          if (activityDetail.images.length > 1) {
            displayImagesList.value = activityDetail.images.slice(1).map((url, index) => ({
              name: `existing_image_${index + 1}`,
              url: url,
              uid: `existing_${Date.now()}_${index}`,
              id: `existing_${index}`, // 用字符串标识原有图片，区分于新上传的图片
              status: 'success'
            }))

            // 初始化image_id_list（编辑模式下可能不需要这个字段）
            formData.image_id_list = []
          }
        }
      } catch (error) {
        console.error('获取活动详情失败:', error)
        ElMessage.error('获取活动详情失败')
        router.push('/activity/list')
      } finally {
        loading.value = false
      }
    }
  }

  // 页面加载时初始化
  onMounted(() => {
    initPageData()
  })
  watch(
    () => route.query.id,
    () => {
      initPageData()
    }
  )
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
