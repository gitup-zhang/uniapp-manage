import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LanguageEnum } from '@/enums/appEnum'
import { router } from '@/router'

import { UserData } from '@/api/modules/user'
import { useSettingStore } from './setting'
import { useWorktabStore } from './worktab'
import { AppRouteRecord } from '@/types/router'
import { setPageTitle } from '@/router/utils/utils'
import { resetRouterState } from '@/router/guards/beforeEach'
import { RoutesAlias } from '@/router/routesAlias'

// 用户
export const useUserStore = defineStore(
  'userStore',
  () => {
    const language = ref(LanguageEnum.ZH)
    const isLogin = ref(false)
    const isLock = ref(false)
    const lockPassword = ref('')
    const info = ref<UserData>({
      user_id: 0,
      nickname: '',
      avatar_url: '',
      name: '',
      gender: '',
      gender_code: '',
      phone_number: '',
      email: '',
      unit: '',
      department: '',
      position: '',
      industry: '',
      industry_name: '',
      role: [],
      role_name: ''
    })
    const searchHistory = ref<AppRouteRecord[]>([])
    const accessToken = ref('')
    const refreshToken = ref('')

    // 初始化时根据token状态自动设置登录状态
    const initializeLoginStatus = () => {
      if (accessToken.value && accessToken.value.trim() !== '') {
        isLogin.value = true
      } else {
        isLogin.value = false
      }
    }

    const getUserInfo = computed(() => info.value)
    const getSettingState = computed(() => useSettingStore().$state)
    const getWorktabState = computed(() => useWorktabStore().$state)

    const setUserInfo = (newInfo: UserData) => {
      info.value = newInfo
      console.log('个人信息', info.value)
    }

    const setLoginStatus = (status: boolean) => {
      isLogin.value = status
    }

    const setLanguage = (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value)
      language.value = lang
    }

    const setSearchHistory = (list: AppRouteRecord[]) => {
      searchHistory.value = list
    }

    const setLockStatus = (status: boolean) => {
      isLock.value = status
    }

    const setLockPassword = (password: string) => {
      lockPassword.value = password
    }

    const setToken = (newAccessToken: string, newRefreshToken?: string) => {
      accessToken.value = newAccessToken
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken
      }
      // 设置token时自动更新登录状态
      if (newAccessToken && newAccessToken.trim() !== '') {
        isLogin.value = true
      }
    }

    // const logOut = () => {
    //   info.value = {}
    //   isLogin.value = false
    //   isLock.value = false
    //   lockPassword.value = ''
    //   accessToken.value = ''
    //   refreshToken.value = ''
    //   useWorktabStore().opened = []
    //   sessionStorage.removeItem('iframeRoutes')
    //   resetRouterState(router)
    //   router.push(RoutesAlias.Login)
    // }
    const logOut = () => {
      info.value = createEmptyUser()
      isLogin.value = false
      isLock.value = false
      lockPassword.value = ''
      accessToken.value = ''
      refreshToken.value = ''
      useWorktabStore().opened = []
      sessionStorage.removeItem('iframeRoutes')
      resetRouterState()
      router.push(RoutesAlias.Login)
    }
    // 信息清空
    function createEmptyUser(): UserData {
      return {
        user_id: 0,
        nickname: '',
        avatar_url: '',
        name: '',
        gender: '',
        gender_code: '',
        phone_number: '',
        email: '',
        unit: '',
        department: '',
        position: '',
        industry: '',
        industry_name: '',
        role: [], // 或者 "SUPERADMIN" 之类的默认值
        role_name: '' // 或者 "超级管理员"
      }
    }

    // 在store初始化后检查登录状态
    initializeLoginStatus()

    return {
      language,
      isLogin,
      isLock,
      lockPassword,
      info,
      searchHistory,
      accessToken,
      refreshToken,
      getUserInfo,
      getSettingState,
      getWorktabState,
      setUserInfo,
      setLoginStatus,
      setLanguage,
      setSearchHistory,
      setLockStatus,
      setLockPassword,
      setToken,
      logOut,
      initializeLoginStatus
    }
  },
  {
    persist: {
      key: 'user',
      storage: localStorage
    }
  }
)
