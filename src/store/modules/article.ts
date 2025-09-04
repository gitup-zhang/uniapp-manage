import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ArticleService } from '@/api/articleApi'
import { ArticleType, Field, Article } from '@/api/modules'
export const useArticlesStore = defineStore('article', () => {
  // 新闻和政策列表
  const ArticlesNew = ref<ArticleType[]>([])
  const ArticlesPolicy = ref([])
  // 获取到的领域
  const fieldType = ref<Field[]>([])
  // 创建文章时的领域
  const fieldTypeNew = ref<Field[]>([])
  // 获取到的总数
  const articletotal = ref(0)
  // 获取到的新闻政策详情
  const ArticleDetail = ref<Article>({
    article_id: 0,
    article_title: '',
    field_name: '',
    field_type: '',
    release_time: '',
    article_content: '',
    article_type_code: 'POLICY',
    article_type: '',
    cover_image_url: '',
    brief_content: ''
  })
  // 获取政策和新闻
  const getArticles = async (param: any) => {
    try {
      const res = await ArticleService.getArticleList(param)
      articletotal.value = res.total
      ArticlesNew.value = res.data
      console.log('测试的数据为：', ArticlesNew.value)
      console.log('文章总数为：', articletotal.value)
    } catch (e) {
      console.log('出现的错误：', e)
    }
  }
  // 获取到的领域
  const getArticleTypes = async () => {
    try {
      const res = await ArticleService.getArticleTypes()
      console.log('领域值res：', res.data)
      // 使用深拷贝避免引用问题
      fieldTypeNew.value = [...res.data] // 创建文章时的领域，不包含"全部"选项
      fieldType.value = [...res.data] // 筛选用的领域，包含"全部"选项
      fieldType.value.unshift({
        field_id: 4,
        field_code: 'ALL',
        field_name: '全部'
      })
      console.log('领域值：', fieldType.value)
      console.log('创建文章领域值：', fieldTypeNew.value)
    } catch (e) {
      console.log(e)
    }
  }
  // 获取文章详情
  const getArticleDetail = async (id: number) => {
    try {
      const res = await ArticleService.getArticleDetail(id)

      ArticleDetail.value = res.data
      console.log(ArticleDetail.value)
    } catch (e) {
      console.log(e)
    }
  }
  return {
    // 数据
    ArticlesNew,
    ArticlesPolicy,
    articletotal,
    fieldType,
    ArticleDetail,
    fieldTypeNew,
    // 方法

    getArticles,
    getArticleTypes,
    getArticleDetail
  }
})
