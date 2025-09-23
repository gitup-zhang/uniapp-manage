<template>
  <div class="console">
    <!-- 欢迎横幅 -->
    <ArtBasicBanner
      title="欢迎使用 Art Design Pro"
      subtitle="一个现代化的管理系统，为您提供高效、便捷的操作体验"
      :button-config="{ show: false, text: '' }"
      background-color="var(--el-color-primary-light-3)"
      height="12rem"
      decoration
    >
      <template #title>
        <h1 style="font-size: 2rem; margin-bottom: 1rem">欢迎使用智源齐说</h1>
      </template>
      <template #subtitle>
        <p style="font-size: 1rem; opacity: 0.9"> 一个高效的管理平台 </p>
      </template>
    </ArtBasicBanner>

    <!-- 快捷方式 -->
    <div class="quick-access-section">
      <h2 class="section-title">快捷访问</h2>
      <div class="apps-grid">
        <div
          v-for="menuItem in filteredMenuItems"
          :key="menuItem.name as string"
          class="app-item"
          @click="handleNavigate(menuItem)"
        >
          <div class="app-icon">
            <i
              class="iconfont-sys"
              v-html="menuItem.meta?.icon || '&#xe721;'"
              :style="{ color: '#5D87FF' }"
            />
          </div>
          <div class="app-info">
            <h3>{{ getMenuTitle(menuItem.meta?.title) }}</h3>
            <p>{{ getMenuDescription(menuItem.meta?.title) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useCommon } from '@/composables/useCommon'
  import ArtBasicBanner from '@/components/core/banners/art-basic-banner/index.vue'
  import { useMenuStore } from '@/store/modules/menu'
  import { AppRouteRecord } from '@/types/router'
  import { RoutesAlias } from '@/router/routesAlias'

  defineOptions({ name: 'Console' })

  const router = useRouter()
  const menuStore = useMenuStore()

  // 定义需要显示的菜单名称
  const requiredMenus = ['System', 'Article', 'Activity', 'Groups']

  // 过滤出指定的菜单项
  const filteredMenuItems = computed(() => {
    return menuStore.menuList
      .filter((item: AppRouteRecord) => {
        // 过滤出指定的菜单项
        const itemName = typeof item.name === 'string' ? item.name : ''
        return item.meta && !item.meta.isHide && item.meta.title && requiredMenus.includes(itemName)
      })
      .sort((a, b) => {
        // 按照指定顺序排序
        const aName = typeof a.name === 'string' ? a.name : ''
        const bName = typeof b.name === 'string' ? b.name : ''
        return requiredMenus.indexOf(aName) - requiredMenus.indexOf(bName)
      })
  })

  useCommon().scrollToTop()

  const handleNavigate = (menuItem: AppRouteRecord): void => {
    // 特殊处理指定的菜单项，直接跳转到对应的路由别名
    const menuName = typeof menuItem.name === 'string' ? menuItem.name : ''

    // 定义菜单到路由别名的映射
    const menuToRouteMap: Record<string, string> = {
      System: RoutesAlias.User, // 系统管理跳转到用户管理
      Article: RoutesAlias.ArticleList, // 文章管理跳转到文章列表
      Activity: RoutesAlias.ActivityList, // 活动管理跳转到活动列表
      Groups: RoutesAlias.GroupList // 群组管理跳转到群组列表
    }

    if (menuToRouteMap[menuName]) {
      router.push(menuToRouteMap[menuName])
      return
    }

    // 如果有子菜单，跳转到第一个子菜单
    if (menuItem.children && menuItem.children.length > 0) {
      const firstChild = menuItem.children[0]
      if (firstChild.path.startsWith('http')) {
        window.open(firstChild.path, '_blank')
      } else {
        // 构造完整路径
        const fullPath = `${menuItem.path}/${firstChild.path}`
        router.push(fullPath)
      }
    } else {
      // 如果没有子菜单，直接跳转到当前菜单路径
      if (menuItem.path.startsWith('http')) {
        window.open(menuItem.path, '_blank')
      } else {
        router.push(menuItem.path)
      }
    }
  }

  // 获取菜单标题（处理国际化）
  const getMenuTitle = (titleKey: string | undefined): string => {
    if (!titleKey) return '未知菜单'

    // 国际化标题映射
    const titleMap: Record<string, string> = {
      'menus.system.title': '系统管理',
      'menus.article.title': '文章管理',
      'menus.activity.title': '活动管理',
      'menus.groups.title': '群组管理'
    }

    return titleMap[titleKey] || titleKey
  }

  // 获取菜单描述
  const getMenuDescription = (title: string | undefined): string => {
    if (!title) return '访问相关功能'

    // 描述映射
    const descriptions: Record<string, string> = {
      'menus.system.title': '管理系统用户和权限设置',
      'menus.article.title': '发布和管理文章内容',
      'menus.activity.title': '创建和管理活动信息',
      'menus.groups.title': '创建和管理群组信息'
    }

    return descriptions[title] || '访问相关功能'
  }
</script>

<style lang="scss" scoped>
  .console {
    padding: 20px;
  }

  .section-title {
    margin: 20px 0 15px;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--art-text-gray-800);
  }

  .quick-access-section {
    margin-top: 20px;
    background: var(--art-card-bg);
    border-radius: calc(var(--custom-radius) + 2px);
    padding: 20px;
  }

  .apps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .app-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(var(--art-gray-200-rgb), 0.7);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

      .app-icon {
        background-color: transparent !important;
      }
    }

    .app-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      background-color: rgba(var(--art-gray-200-rgb), 0.7);
      border-radius: 8px;

      i {
        font-size: 20px;
      }
    }

    .app-info {
      h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--art-text-gray-800);
      }

      p {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--art-text-gray-500);
      }
    }
  }
</style>
