import request from '@/utils/http'
import { UseListResponse, UserResponse, UserData } from '@/api/modules/user'

export class UserService {
  // 登录
  // static login(params: Api.Auth.LoginParams) {
  //   return request.post<Api.Auth.LoginResponse>({
  //     url: '/api/auth/login',
  //     params
  //     // showErrorMessage: false // 不显示错误消息
  //   })
  // }
  static login(params: any) {
    return request.post<any>({
      url: '/api/user/bgLogin',
      params
    })
  }

  // 获取用户信息
  // static getUserInfo() {
  //   return request.get<Api.User.UserInfo>({
  //     url: '/api/user/info'
  //     // 自定义请求头
  //     // headers: {
  //     //   'X-Custom-Header': 'your-custom-value'
  //     // }
  //   })
  // }
  static async getUserInfo() {
    const res = await request.get<UserResponse>({
      url: '/api/user/info'
    })

    // 这里直接把字符串包装成数组
    const data: UserData = {
      ...res.data,
      role: res.data.role ? [res.data.role] : []
    }

    return { data }
  }

  // return {
  //   userId: 1,
  //   userName: 'Admin',
  //   email: 'admin@example.com',
  //   roles: 'R_SUPER',
  //   buttons: ['add', 'edit', 'delete']
  // }

  // 获取用户列表
  static getUserList(params: any) {
    return request.get<UseListResponse>({
      url: '/api/user/listAll',
      params
    })
  }
  // 信息更新
  // static Update(params: any, id: number) {
  //   return request.put<any>({
  //     url: `/api/user/update/${id}`,
  //     params
  //   })
  // }
  // 创建管理员
  static crestAdminUser(params: any) {
    return request.post<any>({
      url: '/api/user/createAdmin',
      params
    })
  }
  // 修改管理员
  static updateUser(params: any, id: number) {
    return request.put<any>({
      url: `/api/user/update/${id}`,
      params
    })
  }
  // 禁用管理员
  static disableUser = (id: number) => {
    return request.put<any>({
      url: `/api/user/disable/${id}`
    })
  }

  // 更新当前用户信息
  static updateCurrentUser(params: any) {
    return request.put<any>({
      url: '/api/user/update',
      params
    })
  }

  // 修改密码
  static changePassword(params: { oldPassword: string; newPassword: string }) {
    return request.put<any>({
      url: '/api/user/changePassword',
      params
    })
  }
}
