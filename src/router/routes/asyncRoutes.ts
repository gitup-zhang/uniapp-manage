import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 前端静态配置 - 直接使用本文件中定义的路由配置
 * 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 *
 * RoutesAlias.Layout 指向的是布局组件，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 路由元数据（meta）：异步路由在 asyncRoutes 中配置，静态路由在 staticRoutes 中配置
 */
export const asyncRoutes: AppRouteRecord[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.dashboard.title',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'console',
        name: 'Console',
        component: RoutesAlias.Dashboard,
        meta: {
          title: 'menus.dashboard.console',
          keepAlive: false,
          fixedTab: true
        }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.system.title',
      icon: '&#xe7b9;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'user',
        name: 'User',
        component: RoutesAlias.User,
        meta: {
          title: 'menus.system.user',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'admin',
        name: 'Admin',
        component: RoutesAlias.Admin,
        meta: {
          title: 'menus.system.admin',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN'],
          authList: [
            {
              title: '新增',
              authMark: 'add'
            },
            {
              title: '删除',
              authMark: 'delete'
            },
            {
              title: '修改密码',
              authMark: 'reset-password'
            }
          ]
        }
      },
      {
        path: 'user-center',
        name: 'UserCenter',
        component: RoutesAlias.UserCenter,
        meta: {
          title: 'menus.system.userCenter',
          isHide: true,
          keepAlive: true,
          isHideTab: true
        }
      }
    ]
  },
  {
    path: '/activity',
    name: 'Activity',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.activity.title',
      icon: '&#xe7f0;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'create',
        name: 'ActivityCreate',
        component: RoutesAlias.ActivityCreate,
        meta: {
          title: 'menus.activity.create',
          keepAlive: false,
          roles: ['R_SUPER', 'R_ADMIN'],
          authList: [
            {
              title: '创建',
              authMark: 'create'
            }
          ]
        }
      },
      {
        path: 'list',
        name: 'ActivityList',
        component: RoutesAlias.ActivityList,
        meta: {
          title: 'menus.activity.list',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN'],
          authList: [
            {
              title: '查看',
              authMark: 'view'
            },
            {
              title: '编辑',
              authMark: 'edit'
            },
            {
              title: '删除',
              authMark: 'delete'
            }
          ]
        }
      },
      {
        path: 'detail/:id',
        name: 'ActivityDetail',
        component: RoutesAlias.ActivityDetail,
        meta: {
          title: 'menus.activity.detail',
          isHide: true,
          keepAlive: false,
          isHideTab: true,
          activePath: '/activity/list'
        }
      }
    ]
  },
  {
    path: '/articles',
    name: 'Article',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.article.title',
      icon: '&#xe7ae;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'article-list',
        name: 'ArticleList',
        component: RoutesAlias.ArticleList,
        meta: {
          title: 'menus.article.articleList',
          keepAlive: true
          // authList: [
          //   {
          //     title: '新增',
          //     auth_mark: 'add'
          //   },
          //   {
          //     title: '编辑',
          //     auth_mark: 'edit'
          //   }
          // ]
        }
      },

      {
        path: 'detail',
        name: 'ArticleDetail',
        component: RoutesAlias.ArticleDetail,
        meta: {
          title: 'menus.article.articleDetail',
          isHide: true,
          keepAlive: true
        }
      },
      // {
      //   path: 'comment',
      //   name: 'ArticleComment',
      //   component: RoutesAlias.Comment,
      //   meta: {
      //     title: 'menus.article.comment',
      //     keepAlive: true
      //   }
      // },
      {
        path: 'publish',
        name: 'ArticlePublish',
        component: RoutesAlias.ArticlePublish,
        meta: {
          title: 'menus.article.articlePublish',
          keepAlive: false
          // authList: [
          //   {
          //     title: '发布',
          //     auth_mark: 'article/article-publish/add'
          //   }
          // ]
        }
      }
    ]
  },
  {
    path: '/notice',
    name: 'Notice',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.notice.title',
      icon: '&#xe766;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'list',
        name: 'NoticeList',
        component: RoutesAlias.NoticeList,
        meta: {
          title: 'menus.notice.list',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN'],
          authList: [
            {
              title: '查看',
              authMark: 'view'
            },
            {
              title: '编辑',
              authMark: 'edit'
            },
            {
              title: '删除',
              authMark: 'delete'
            }
          ]
        }
      },
      {
        path: 'create',
        name: 'NoticeCreate',
        component: RoutesAlias.NoticeCreate,
        meta: {
          title: 'menus.notice.create',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN'],
          authList: [
            {
              title: '创建',
              authMark: 'create'
            }
          ]
        }
      },
      {
        path: 'detail/:id',
        name: 'NoticeDetail',
        component: RoutesAlias.NoticeDetail,
        meta: {
          title: 'menus.notice.detail',
          isHide: true,
          keepAlive: false,
          isHideTab: true,
          activePath: '/notice/list'
        }
      }
    ]
  },
  {
    path: '/groups',
    name: 'Groups',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.groups.title',
      icon: '&#xe668;',
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: 'create',
        name: 'GroupCreate',
        component: RoutesAlias.GroupCreate,
        meta: {
          title: 'menus.groups.create',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN'],
          authList: [
            {
              title: '创建',
              authMark: 'create'
            }
          ]
        }
      },
      {
        path: 'list',
        name: 'GroupList',
        component: RoutesAlias.GroupList,
        meta: {
          title: 'menus.groups.list',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN'],
          authList: [
            {
              title: '查看',
              authMark: 'view'
            },
            {
              title: '编辑',
              authMark: 'edit'
            },
            {
              title: '删除',
              authMark: 'delete'
            }
          ]
        }
      },
      {
        path: 'detail/:id',
        name: 'GroupDetail',
        component: RoutesAlias.GroupDetail,
        meta: {
          title: 'menus.groups.detail',
          isHide: true,
          keepAlive: false,
          isHideTab: true,
          activePath: '/groups/list'
        }
      },
      {
        path: 'chat/:id',
        name: 'GroupChat',
        component: RoutesAlias.GroupChat,
        meta: {
          title: 'menus.groups.chat',
          isHide: true,
          keepAlive: false,
          isHideTab: true,
          activePath: '/groups/list'
        }
      }
    ]
  },
  {
    path: '/result',
    name: 'Result',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.result.title',
      icon: '&#xe715;'
    },
    children: [
      {
        path: 'success',
        name: 'ResultSuccess',
        component: RoutesAlias.Success,
        meta: {
          title: 'menus.result.success',
          keepAlive: true
        }
      },
      {
        path: 'fail',
        name: 'ResultFail',
        component: RoutesAlias.Fail,
        meta: {
          title: 'menus.result.fail',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/exception',
    name: 'Exception',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.exception.title',
      icon: '&#xe820;'
    },
    children: [
      {
        path: '403',
        name: '403',
        component: RoutesAlias.Exception403,
        meta: {
          title: 'menus.exception.forbidden',
          keepAlive: true
        }
      },
      {
        path: '404',
        name: '404',
        component: RoutesAlias.Exception404,
        meta: {
          title: 'menus.exception.notFound',
          keepAlive: true
        }
      },
      {
        path: '500',
        name: '500',
        component: RoutesAlias.Exception500,
        meta: {
          title: 'menus.exception.serverError',
          keepAlive: true
        }
      }
    ]
  }
]
