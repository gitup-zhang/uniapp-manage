import request from '@/utils/http'
import { UseListResponse } from '@/api/modules/user'

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
  static getUserInfo() {
    return {
      userId: 1,
      userName: 'Admin',
      email: 'admin@example.com',
      roles: ['R_ADMIN', 'R_SUPER'],
      buttons: ['add', 'edit', 'delete']
    }
  }

  // 获取用户列表
  static getUserList(params: any) {
    return request.get<UseListResponse>({
      url: '/api/user/listAll',
      params
    })
  }
}
