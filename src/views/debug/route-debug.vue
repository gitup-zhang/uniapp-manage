<template>
  <div class="debug-page">
    <ElCard>
      <h2>路由和菜单调试信息</h2>

      <ElDivider>环境变量</ElDivider>
      <div>
        <p><strong>VITE_ACCESS_MODE:</strong> {{ accessMode }}</p>
        <p><strong>是否前端模式:</strong> {{ isFrontendMode }}</p>
      </div>

      <ElDivider>用户信息</ElDivider>
      <div>
        <p><strong>登录状态:</strong> {{ userStore.isLogin }}</p>
        <p><strong>用户角色:</strong> {{ JSON.stringify(userStore.info.roles) }}</p>
        <p><strong>用户权限:</strong> {{ JSON.stringify(userStore.info.buttons) }}</p>
      </div>

      <ElDivider>路由注册状态</ElDivider>
      <div>
        <p><strong>路由已注册:</strong> {{ isRouteRegistered }}</p>
        <p><strong>当前路由:</strong> {{ route.path }}</p>
      </div>

      <ElDivider>菜单列表</ElDivider>
      <div>
        <p><strong>菜单数量:</strong> {{ menuStore.menuList.length }}</p>
        <pre>{{ JSON.stringify(menuStore.menuList, null, 2) }}</pre>
      </div>

      <ElDivider>异步路由配置</ElDivider>
      <div>
        <pre>{{ JSON.stringify(asyncRoutes, null, 2) }}</pre>
      </div>

      <ElButton @click="refreshMenu">重新加载菜单</ElButton>
      <ElButton @click="checkAdminRoute">检查管理员路由</ElButton>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { useMenuStore } from '@/store/modules/menu'
  import { useCommon } from '@/composables/useCommon'
  import { asyncRoutes } from '@/router/routes/asyncRoutes'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'RouteDebug' })

  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const menuStore = useMenuStore()
  const { isFrontendMode } = useCommon()

  const accessMode = import.meta.env.VITE_ACCESS_MODE
  const isRouteRegistered = ref(false)

  const refreshMenu = () => {
    // 重新加载页面来触发菜单重新注册
    location.reload()
  }

  const checkAdminRoute = () => {
    const hasRoute = router.hasRoute('Admin')
    ElMessage.info(`管理员路由是否存在: ${hasRoute}`)

    if (hasRoute) {
      router.push('/system/admin')
    } else {
      ElMessage.warning('管理员路由不存在，请检查路由配置')
    }
  }

  onMounted(() => {
    console.log('环境变量 VITE_ACCESS_MODE:', accessMode)
    console.log('是否前端模式:', isFrontendMode.value)
    console.log('用户角色:', userStore.info.roles)
    console.log('菜单列表:', menuStore.menuList)
    console.log('异步路由:', asyncRoutes)
  })
</script>

<style lang="scss" scoped>
  .debug-page {
    padding: 20px;

    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      max-height: 300px;
      overflow: auto;
    }
  }
</style>
