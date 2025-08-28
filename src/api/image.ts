import request from '@/utils/http'
import { UploadFileResponse } from '@/api/modules/image'

export class imageService {
  static uploadImage(params: any) {
    return request.post<UploadFileResponse>({
      url: '/api/file/upload',
      params
    })
  }
  static deleteImage(id: number) {
    return request.del({
      url: `/api/file/deleteImage/${id}`
    })
  }
}
