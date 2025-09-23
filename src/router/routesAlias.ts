/**
 * 路由别名，方便快速找到页面，同时可以用作路由跳转
 */
export enum RoutesAlias {
  // 布局和认证
  Layout = '/index/index', // 布局容器
  Login = '/auth/login', // 登录
  Register = '/auth/register', // 注册
  ForgetPassword = '/auth/forget-password', // 忘记密码

  // 异常页面
  Exception403 = '/exception/403', // 403
  Exception404 = '/exception/404', // 404
  Exception500 = '/exception/500', // 500

  // 结果页面
  Success = '/result/success', // 成功
  Fail = '/result/fail', // 失败

  // 仪表板
  Dashboard = '/dashboard/console', // 工作台

  // 系统管理
  User = '/system/user', // 账户
  Role = '/system/role', // 角色
  UserCenter = '/system/user-center', // 用户中心
  Menu = '/system/menu', // 菜单
  Admin = '/system/admin', // 管理员管理

  //文章管理
  ArticleList = '/articles/list', // 文章列表
  ArticleDetail = '/articles/detail', // 文章详情
  // Comment = '/article/comment', // 评论
  ArticlePublish = '/articles/publish', // 文章发布

  // 活动管理
  ActivityCreate = '/activity/create', // 活动创建
  ActivityList = '/activity/list', // 活动列表
  ActivityDetail = '/activity/detail', // 活动详情

  // 群组管理
  GroupCreate = '/groups/create', // 创建群组
  GroupList = '/groups/list', // 群组列表
  GroupDetail = '/groups/detail', // 群组详情
  GroupChat = '/groups/chat', // 群组聊天
  GroupMessage = '/groups/message', // 群组消息

  // 调试页面
  RouteDebug = '/debug/route-debug' // 路由调试
}
