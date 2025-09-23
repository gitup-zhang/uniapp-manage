<template>
  <div class="article-edit">
    <div>
      <div class="editor-wrap">
        <!-- 文章标题、类型 -->
        <ElRow :gutter="10">
          <ElCol :span="12">
            <ElInput
              v-model.trim="formData.article_title"
              placeholder="请输入文章标题（最多100个字符）"
              maxlength="100"
            />
          </ElCol>
          <ElCol :span="6">
            <ElSelect v-model="formData.article_type" placeholder="请选择文章类型" filterable>
              <ElOption
                v-for="item in articleTypes"
                :key="item.id"
                :label="item.name"
                :value="item.code"
              />
            </ElSelect>
          </ElCol>
          <ElCol :span="6">
            <ElSelect v-model="formData.field_type" placeholder="请选择领域类型" filterable>
              <ElOption
                v-for="item in Article.fieldTypeNew"
                :key="item.field_id"
                :label="item.field_name"
                :value="item.field_code"
              />
            </ElSelect>
          </ElCol>
        </ElRow>

        <!-- 内容简介 -->
        <div class="el-top">
          <ElInput
            v-model="formData.brief_content"
            type="textarea"
            :rows="3"
            placeholder="请输入内容简介（最多200个字符）"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 富文本编辑器 -->
        <ArtWangEditor class="el-top" v-model="formData.article_content" />

        <div class="form-wrap">
          <h2>发布设置</h2>
          <ElForm label-width="80px">
            <!-- 封面图片上传 -->
            <ElFormItem label="封面" v-if="formData.article_type === 'NEWS'">
              <div class="el-top upload-container">
                <ElUpload
                  class="cover-uploader"
                  :action="uploadImageUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :http-request="handleUpload"
                  :on-error="onError"
                  :before-upload="beforeUpload"
                  :data="{ biz_type: 'article_cover' }"
                >
                  <div v-if="!formData.cover_image_url" class="upload-placeholder">
                    <ElIcon class="upload-icon"><Plus /></ElIcon>
                    <div class="upload-text">点击上传封面</div>
                  </div>
                  <img v-else :src="formData.cover_image_url" class="cover-image" />
                </ElUpload>
                <div class="el-upload__tip">建议尺寸 16:9，jpg/png 格式</div>
              </div>
            </ElFormItem>

            <!-- 文章来源 -->
            <ElFormItem label="文章来源">
              <ElInput
                v-model="formData.article_source"
                placeholder="请输入文章来源"
                maxlength="100"
              />
            </ElFormItem>

            <!-- 是否精选 -->
            <ElFormItem label="是否精选">
              <ElRadioGroup v-model="formData.is_selection">
                <ElRadio :value="1">精选</ElRadio>
                <ElRadio :value="2">非精选</ElRadio>
              </ElRadioGroup>
            </ElFormItem>

            <!-- 展示图片上传 -->
            <!-- <ElFormItem label="展示图片">
              <div class="el-top upload-container">
                <ElUpload
                  class="display-uploader"
                  :action="uploadImageUrl"
                  :headers="uploadHeaders"
                  :file-list="displayImages"
                  :on-success="onDisplayImageSuccess"
                  :on-error="onError"
                  :before-upload="beforeUpload"
                  :on-remove="onRemoveDisplayImage"
                  list-type="picture-card"
                  :data="{ biz_type: 'article_display' }"
                >
                  <ElIcon class="upload-icon"><Plus /></ElIcon>
                </ElUpload>
                <div class="el-upload__tip">可上传多张展示图片，建议尺寸 16:9</div>
              </div>
            </ElFormItem> -->
          </ElForm>

          <div style="display: flex; justify-content: flex-end">
            <ElButton type="primary" @click="submit" style="width: 100px">
              {{ pageMode === PageModeEnum.Edit ? '保存' : '发布' }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { ArticleService } from '@/api/articleApi'
  import { ApiStatus } from '@/utils/http/status'
  import { ElMessage } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import EmojiText from '@/utils/ui/emojo'
  import { PageModeEnum } from '@/enums/formEnum'
  // import axios from 'axios'
  import { useCommon } from '@/composables/useCommon'
  import { useArticlesStore } from '@/store/modules/article'
  import { imageService } from '@/api/image'
  import { onMounted, watch } from 'vue'

  defineOptions({ name: 'ArticlePublish' })

  const route = useRoute()
  const router = useRouter()

  const userStore = useUserStore()
  const Article = useArticlesStore()
  let { accessToken } = userStore

  // 上传路径
  const uploadImageUrl = `${import.meta.env.VITE_API_URL}/api/common/upload`
  // 传递 token
  const uploadHeaders = { Authorization: accessToken }

  let pageMode: PageModeEnum = PageModeEnum.Add // 页面类型 新增 ｜ 编辑

  // 统一的表单数据
  const formData = ref({
    article_title: '', // 标题
    article_type: '', // 类型代码
    brief_content: '', // 内容简介
    article_content: '', // 内容
    is_selection: 1, // 是否精选，1-精选，2-非精选，默认=2
    field_type: '', // 领域类型代码
    cover_image_url: '', // 封面url
    article_source: '', // 文章来源
    image_id_list: [] as number[] // 关联图片ID列表
  })

  // 类型列表
  const articleTypes = ref([
    // 领域类型列表
    { id: 1, name: '新闻', code: 'NEWS' },
    { id: 2, name: '政策', code: 'POLICY' }
  ])
  const createDate = ref('') // 创建时间
  //const displayImages = ref([]) // 展示图片列表
  // const outlineList = ref()

  onMounted(() => {
    useCommon().scrollToTop()
    getArticleTypes()
    initPageMode()
  })
  // 监听路由参数变化
  watch(
    () => route.query.id,
    () => {
      initPageMode()
    }
  )
  const resetFormData = () => {
    formData.value = {
      article_title: '', // 标题
      article_type: '', // 类型代码
      brief_content: '', // 内容简介
      article_content: '', // 内容
      is_selection: 2, // 是否精选，1-精选，2-非精选，默认=2
      field_type: '', // 领域类型代码
      cover_image_url: '', // 封面url
      article_source: '', // 文章来源
      image_id_list: [] as number[] // 关联图片ID列表
    }
  }

  // 初始化页面类型 新增 ｜ 编辑
  const initPageMode = () => {
    resetFormData()
    const { id } = route.query
    console.log('新增文章的id', id)
    pageMode = id ? PageModeEnum.Edit : PageModeEnum.Add
    if (pageMode === PageModeEnum.Edit && id) {
      initEditArticle(Number(id))
    } else {
      initAddArticle()
    }
  }

  // 初始化编辑文章的逻辑
  const initEditArticle = (id: number) => {
    articleId = id
    getArticleDetail(articleId)
  }

  // 初始化新增文章逻辑
  const initAddArticle = () => {
    createDate.value = formDate(useNow().value)
  }

  // 获取文章类型
  const getArticleTypes = async () => {
    await Article.getArticleTypes()
  }

  // 获取文章详情内容
  let articleId: number = 0
  const getArticleDetail = async (articleId: number) => {
    try {
      await Article.getArticleDetail(articleId)
      formData.value.article_title = Article.ArticleDetail.article_title
      formData.value.article_type = Article.ArticleDetail.article_type_code
      formData.value.article_content = Article.ArticleDetail.article_content
      formData.value.cover_image_url = Article.ArticleDetail.cover_image_url
      formData.value.brief_content = Article.ArticleDetail.brief_content
      formData.value.field_type = Article.ArticleDetail.field_type
    } catch (e) {
      console.log('获取文章详情失败', e)
    }

    // const res = await ArticleService.getArticleDetail(articleId)
    // if (res.code === ApiStatus.success) {
    //   let {
    //     title,
    //     blog_class,
    //     create_time,
    //     home_img,
    //     html_content,
    //     brief_content,
    //     field_type,
    //     article_source,
    //     is_selection,
    //     image_id_list
    //   } = res.data

    //   formData.value.article_title = title
    //   formData.value.article_type = String(blog_class)
    //   formData.value.article_content = html_content
    //   formData.value.cover_image_url = home_img
    //   formData.value.brief_content = brief_content || ''
    //   formData.value.field_type = field_type || ''
    //   formData.value.article_source = article_source || ''
    //   formData.value.is_selection = is_selection || 2
    //   formData.value.image_id_list = image_id_list || []
    //   createDate.value = formDate(create_time)

    //   // 如果有展示图片，初始化显示
    //   if (image_id_list && image_id_list.length > 0) {
    //     // 这里需要根据image_id_list获取对应的图片URL
    //     // displayImages.value = ...
    //   }

    //   // getOutline(html_content)
    // }
  }

  // const getOutline = (content: string) => {
  //   const regex = /<h([1-3])>(.*?)<\/h\1>/g
  //   const headings = []
  //   let match

  //   while ((match = regex.exec(content)) !== null) {
  //     headings.push({ level: match[1], text: match[2] })
  //   }
  //   outlineList.value = headings
  // }

  // 提交
  const submit = () => {
    if (pageMode === PageModeEnum.Edit) {
      editArticle()
    } else {
      addArticle()
    }
  }

  // 格式化日期
  const formDate = (date: string | Date): string => {
    return useDateFormat(date, 'YYYY-MM-DD').value
  }

  // 验证输入
  const validateArticle = () => {
    if (!formData.value.article_title) {
      ElMessage.error(`请输入文章标题`)
      return false
    }

    if (!formData.value.article_type) {
      ElMessage.error(`请选择文章类型`)
      return false
    }

    if (!formData.value.field_type) {
      ElMessage.error(`请选择领域类型`)
      return false
    }

    if (!formData.value.brief_content) {
      ElMessage.error(`请输入内容简介`)
      return false
    }

    if (formData.value.article_content === '<p><br></p>' || !formData.value.article_content) {
      ElMessage.error(`请输入文章内容`)
      return false
    }

    if (!formData.value.cover_image_url && formData.value.article_type === 'NEWS') {
      ElMessage.error(`请上传封面图片`)
      return false
    }

    return true
  }

  // 构建参数
  const buildParams = () => {
    return {
      article_title: formData.value.article_title,
      article_type: formData.value.article_type,
      brief_content: formData.value.brief_content,
      article_content: delCodeTrim(formData.value.article_content),
      is_selection: formData.value.is_selection,
      field_type: formData.value.field_type,
      cover_image_url: formData.value.cover_image_url,
      article_source: formData.value.article_source,
      image_id_list: formData.value.image_id_list,
      create_time: createDate.value
    }
  }

  // 添加文章
  const addArticle = async () => {
    try {
      if (!validateArticle()) return

      const params = buildParams()
      const res = await ArticleService.addArticle(params)

      if (res.code === ApiStatus.success) {
        ElMessage.success(`发布成功 ${EmojiText[200]}`)
        goBack()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 编辑文章
  const editArticle = async () => {
    try {
      if (!validateArticle()) return

      const params = buildParams()
      const res = await ArticleService.editArticle(articleId, params)

      if (res.code === ApiStatus.success) {
        ElMessage.success(`修改成功 ${EmojiText[200]}`)
        goBack()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const delCodeTrim = (content: string): string => {
    return content.replace(/(\s*)<\/code>/g, '</code>')
  }

  // 封面上传成功回调
  const handleUpload = async (option: any): Promise<void> => {
    const file = option.file
    const uploadData = new FormData()

    // 添加文件
    uploadData.append('file', file)

    // 只添加biz_type参数
    uploadData.append('biz_type', 'ARTICLE')

    try {
      const response = await imageService.uploadImage(uploadData)

      if (response.code === ApiStatus.success) {
        // 上传成功，设置封面图片URL
        formData.value.cover_image_url = response.data.url
        ElMessage.success('封面上传成功！')
      } else {
        ElMessage.error('封面上传失败：' + response.message)
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('封面上传错误:', error)
      ElMessage.error('封面上传失败，请重试')
      throw error
    }
  }

  // 展示图片上传成功回调
  // const onDisplayImageSuccess = (response: any) => {
  //   // 添加图片ID到列表
  //   if (response.data && response.data.id) {
  //     formData.value.image_id_list.push(response.data.id)
  //   }
  //   ElMessage.success(`图片上传成功 ${EmojiText[200]}`)
  // }

  // 移除展示图片
  // const onRemoveDisplayImage = (file: any) => {
  //   // 从图片ID列表中移除对应的ID
  //   const imageId = file.response?.data?.id
  //   if (imageId) {
  //     const index = formData.value.image_id_list.indexOf(imageId)
  //     if (index > -1) {
  //       formData.value.image_id_list.splice(index, 1)
  //     }
  //   }
  // }

  const onError = () => {
    ElMessage.error(`图片上传失败 ${EmojiText[500]}`)
  }

  // 返回上一页
  const goBack = () => {
    setTimeout(() => {
      router.go(-1)
    }, 800)
  }

  // 添加上传前的校验
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return false
    }
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过 2MB!')
      return false
    }
    return true
  }
</script>

<style lang="scss" scoped>
  .article-edit {
    .editor-wrap {
      max-width: 1000px;
      margin: 20px auto;

      .el-top {
        margin-top: 10px;
      }

      .form-wrap {
        padding: 20px;
        margin-top: 20px;
        background-color: var(--art-main-bg-color);
        border: 1px solid var(--art-border-color);
        border-radius: calc(var(--custom-radius) / 2 + 2px) !important;

        h2 {
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 500;
        }
      }
    }

    .outline-wrap {
      box-sizing: border-box;
      width: 280px;
      padding: 20px;
      border: 1px solid #e3e3e3;
      border-radius: 8px;

      .item {
        p {
          height: 30px;
          font-size: 13px;
          line-height: 30px;
          cursor: pointer;
        }

        .level3 {
          padding-left: 10px;
        }
      }
    }

    .upload-container {
      .cover-uploader {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border-radius: 6px;
        transition: var(--el-transition-duration);

        &:hover {
          border-color: var(--el-color-primary);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 260px;
          height: 160px;
          border: 1px dashed #d9d9d9;
          border-radius: 6px;

          .upload-icon {
            font-size: 28px;
            color: #8c939d;
          }

          .upload-text {
            margin-top: 8px;
            font-size: 14px;
            color: #8c939d;
          }
        }

        .cover-image {
          display: block;
          width: 260px;
          height: 160px;
          object-fit: cover;
        }
      }

      .display-uploader {
        :deep(.el-upload--picture-card) {
          width: 100px;
          height: 100px;
        }

        :deep(.el-upload-list--picture-card .el-upload-list__item) {
          width: 100px;
          height: 100px;
        }
      }

      .el-upload__tip {
        margin-top: 8px;
        font-size: 12px;
        color: #666;
      }
    }
  }
</style>
