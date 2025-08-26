<template>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="400px" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="管理员名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入管理员名称" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="邮箱" prop="email">
        <ElInput v-model="formData.email" placeholder="请输入邮箱" />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'add'" label="初始密码" prop="password">
        <ElInput
          v-model="formData.password"
          type="password"
          placeholder="请输入初始密码"
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
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    type: Form.DialogType
    adminData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 对话框类型
  const dialogType = computed(() => props.type)

  // 对话框标题
  const dialogTitle = computed(() => {
    return dialogType.value === 'add' ? '新增管理员' : '编辑管理员'
  })

  // 表单实例
  const formRef = ref<FormInstance>()
  const loading = ref(false)

  // 表单数据
  const formData = reactive({
    name: '',
    phone: '',
    email: '',
    password: ''
  })

  // 手机号验证规则
  const validatePhone = (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }

  // 邮箱验证规则
  const validateEmail = (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请输入邮箱'))
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }

  // 表单验证规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入管理员名称', trigger: 'blur' }],
    phone: [{ validator: validatePhone, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    password: [
      { required: true, message: '请输入初始密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
    ]
  }

  // 重置表单数据
  const resetForm = () => {
    Object.assign(formData, {
      name: '',
      phone: '',
      email: '',
      password: ''
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
        // 如果是编辑模式，填充数据
        if (dialogType.value === 'edit' && props.adminData) {
          Object.assign(formData, {
            name: props.adminData.name || '',
            phone: props.adminData.phone || '',
            email: props.adminData.email || ''
          })
        }
      }
    }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (valid) {
        loading.value = true

        // 模拟API调用
        setTimeout(() => {
          const action = dialogType.value === 'add' ? '新增' : '编辑'
          ElMessage.success(`${action}管理员成功`)
          loading.value = false
          emit('submit')
        }, 1000)
      }
    })
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    text-align: center;
  }
</style>
