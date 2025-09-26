<template>
  <ElDialog v-model="dialogVisible" title="修改密码" width="400px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="管理员">
        <span>{{ adminData?.name || adminData?.userName }}</span>
      </ElFormItem>
      <ElFormItem label="新密码" prop="newPassword">
        <ElInput
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </ElFormItem>
      <ElFormItem label="确认密码" prop="confirmPassword">
        <ElInput
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="loading">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { UserService } from '@/api/usersApi'

  interface Props {
    visible: boolean
    adminData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', password: string): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 表单实例
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  // 表单数据
  const formData = reactive({
    newPassword: '',
    confirmPassword: ''
  })

  // 自定义密码确认验证器
  const validatePassword = (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请再次输入密码'))
    } else if (value !== formData.newPassword) {
      callback(new Error('两次输入密码不一致!'))
    } else {
      callback()
    }
  }

  // 表单验证规则
  const rules: FormRules = {
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      { validator: validatePassword, trigger: 'blur' }
    ]
  }

  // 重置表单数据
  const resetForm = () => {
    Object.assign(formData, {
      newPassword: '',
      confirmPassword: ''
    })
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  // 监听对话框状态变化
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        resetForm()
      }
    }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      loading.value = true
      await UserService.updateUser({ password: formData.newPassword }, props.adminData.user_id)
      loading.value = false
      emit('submit', formData.newPassword)
      dialogVisible.value = false
    } catch (error) {
      console.log(error)
      loading.value = false
    } finally {
      loading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    text-align: center;
  }
</style>
