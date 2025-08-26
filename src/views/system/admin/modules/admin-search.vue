<template>
  <div class="admin-search">
    <ElCard shadow="never" class="search-card">
      <ElForm
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        label-width="auto"
        class="search-form"
      >
        <ElFormItem label="管理员名称">
          <ElInput
            v-model="searchForm.name"
            placeholder="请输入管理员名称"
            style="width: 200px"
            clearable
          />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect
            v-model="searchForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            clearable
          >
            <ElOption label="在线" value="1" />
            <ElOption label="离线" value="2" />
            <ElOption label="异常" value="3" />
            <ElOption label="禁用" value="4" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">搜索</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance } from 'element-plus'

  interface Props {
    filter: Record<string, any>
  }

  interface Emits {
    (e: 'update:filter', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchFormRef = ref<FormInstance>()

  // 搜索表单数据
  const searchForm = reactive({
    name: '',
    status: ''
  })

  // 监听 props.filter 变化，同步到 searchForm
  watch(
    () => props.filter,
    (newFilter) => {
      Object.assign(searchForm, newFilter)
    },
    { immediate: true }
  )

  // 搜索处理
  const handleSearch = () => {
    const searchParams = { ...searchForm }
    emit('update:filter', searchParams)
    emit('search', searchParams)
  }

  // 重置处理
  const handleReset = () => {
    searchFormRef.value?.resetFields()
    Object.assign(searchForm, {
      name: '',
      status: ''
    })
    emit('update:filter', { ...searchForm })
    emit('reset')
  }
</script>

<style lang="scss" scoped>
  .admin-search {
    margin-bottom: 16px;

    .search-card {
      border: none;
      box-shadow: none;
      background: transparent;

      :deep(.el-card__body) {
        padding: 0;
      }
    }

    .search-form {
      .el-form-item {
        margin-right: 16px;
        margin-bottom: 0;
      }
    }
  }
</style>
