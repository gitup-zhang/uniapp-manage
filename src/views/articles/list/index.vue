<template>
  <div class="page-content article-list">
    <ElRow :gutter="10" align="middle">
      <ElCol :span="6">
        <ElInput
          v-model="searchVal"
          :prefix-icon="Search"
          clearable
          placeholder="输入文章标题查询"
          @keyup.enter="searchArticle"
        />
      </ElCol>
      <ElCol :span="6">
        <el-select v-model="selecttype" placeholder="Select" style="width: 240px">
          <el-option
            v-for="item in articlestore.fieldType"
            :key="item.field_id"
            :label="item.field_name"
            :value="item.field_code"
          />
        </el-select>
      </ElCol>
      <ElCol :span="6">
        <!-- <div class="custom-segmented"> -->
        <ElSegmented v-model="yearVal" :options="options" @change="searchArticleByYear" />
        <!-- </div> -->
      </ElCol>

      <ElCol :span="6" style="display: flex; justify-content: flex-end">
        <ElButton @click="toAddArticle">新增文章</ElButton>
      </ElCol>
    </ElRow>

    <div class="list">
      <div class="offset">
        <div
          class="item"
          v-for="item in articlestore.ArticlesNew"
          :key="item.article_id"
          @click="toDetail(item)"
        >
          <!-- 骨架屏 -->
          <ElSkeleton animated :loading="isLoading" style="width: 100%; height: 100%">
            <template #template>
              <div class="top">
                <ElSkeletonItem
                  variant="image"
                  style="width: 100%; height: 100%; border-radius: 10px"
                />
                <div style="padding: 16px 0">
                  <ElSkeletonItem variant="p" style="width: 80%" />
                  <ElSkeletonItem variant="p" style="width: 40%; margin-top: 10px" />
                </div>
              </div>
            </template>

            <template #default>
              <div class="top">
                <ElImage class="cover" :src="item.cover_image_url" lazy fit="cover">
                  <template #error>
                    <div class="image-slot">
                      <ElIcon><icon-picture /></ElIcon>
                    </div>
                  </template>
                </ElImage>

                <span class="type">{{ item.article_type }}</span>
              </div>
              <div class="bottom">
                <h2>{{ item.article_title }}</h2>
                <div class="info">
                  <div class="text">
                    <i class="iconfont-sys">&#xe6f7;</i>
                    <span>{{ useDateFormat(item.release_time, 'YYYY-MM-DD') }}</span>
                    <div class="line"></div>
                    <i class="iconfont-sys">&#xe689;</i>
                    <!-- <span>{{ item.count }}</span> -->
                  </div>
                  <ElButton v-auth="'edit'" size="small" @click.stop="toEdit(item)">编辑</ElButton>
                </div>
              </div>
            </template>
          </ElSkeleton>
        </div>
      </div>
    </div>

    <div style="margin-top: 16vh" v-if="showEmpty">
      <ElEmpty :description="`未找到相关数据 ${EmojiText[0]}`" />
    </div>

    <div style="display: flex; justify-content: center; margin-top: 20px">
      <ElPagination
        size="default"
        background
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :pager-count="9"
        layout="prev, pager, next, total,jumper"
        :total="articlestore.articletotal"
        :hide-on-single-page="true"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Picture as IconPicture } from '@element-plus/icons-vue'

  import { ref, onMounted, computed } from 'vue'
  import { router } from '@/router'
  import { useDateFormat } from '@vueuse/core'
  import { Search } from '@element-plus/icons-vue'
  import EmojiText from '@/utils/ui/emojo'
  import { ArticleList } from '@/mock/temp/articleList'
  import { useCommon } from '@/composables/useCommon'
  import { RoutesAlias } from '@/router/routesAlias'
  import { ArticleType } from '@/api/modules'
  import { useArticlesStore } from '@/store/modules/article'

  defineOptions({ name: 'ArticleList' })

  const yearVal = ref('POLICY')

  const options = ['POLICY', 'NEWS']

  const searchVal = ref('')
  const articleList = ref<ArticleType[]>([])
  const currentPage = ref(1)
  const pageSize = ref(15)
  const selecttype = ref('全部')
  // const lastPage = ref(0)
  //const total = ref(0)
  const isLoading = ref(true)

  // 传参的结构体
  const Params = {
    page: 1,
    page_size: 15,
    field_type: '',
    article_title: '',
    article_type: 'POLICY'
  }

  const showEmpty = computed(() => {
    return articlestore.articletotal === 0 && !isLoading.value
  })

  // 文章pinia实例化
  const articlestore = useArticlesStore()

  onMounted(() => {
    getArticleList({ backTop: false })
    articlestore.getArticles(Params)
    articlestore.getArticleTypes()
  })

  // 搜索文章
  const searchArticle = () => {
    console.log('搜索的文章为：', searchVal.value)
    Params.article_title = searchVal.value
    articlestore.getArticles(Params)
  }

  // 根据年份查询文章
  const searchArticleByYear = () => {
    console.log('选择的领域：', yearVal.value)
    getArticleList({ backTop: true })
  }

  const getArticleList = async ({ backTop = false }) => {
    isLoading.value = true
    // let year = yearVal.value

    if (searchVal.value) {
      yearVal.value = 'All'
    }

    if (yearVal.value === 'All') {
      // year = ''
    }

    // const params = {
    //   page: currentPage.value,
    //   size: pageSize.value,
    //   searchVal: searchVal.value,
    //   year
    // }

    articleList.value = ArticleList
    isLoading.value = false

    if (backTop) {
      useCommon().scrollToTop()
    }

    // const res = await ArticleService.getArticleList(params)
    // if (res.code === ApiStatus.success) {
    //   currentPage.value = res.currentPage
    //   pageSize.value = res.pageSize
    //   lastPage.value = res.lastPage
    //   total.value = res.total
    //   articleList.value = res.data

    //   // setTimeout(() => {
    //   isLoading.value = false
    //   // }, 3000)

    //   if (searchVal.value) {
    //     searchVal.value = ''
    //   }
    // }
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    getArticleList({ backTop: true })
  }

  const toDetail = (item: ArticleType) => {
    router.push({
      path: RoutesAlias.ArticleDetail,
      query: {
        id: item.article_id
      }
    })
  }

  const toEdit = (item: ArticleType) => {
    router.push({
      path: RoutesAlias.ArticlePublish,
      query: {
        id: item.article_id
      }
    })
  }

  const toAddArticle = () => {
    router.push({
      path: RoutesAlias.ArticlePublish
    })
  }
</script>

<style lang="scss" scoped>
  .article-list {
    .custom-segmented .el-segmented {
      height: 40px;
      padding: 6px;

      --el-border-radius-base: 8px;
    }

    .list {
      margin-top: 20px;

      .offset {
        display: flex;
        flex-wrap: wrap;
        width: calc(100% + 20px);

        .item {
          box-sizing: border-box;
          width: calc(20% - 20px);
          margin: 0 20px 20px 0;
          cursor: pointer;
          border: 1px solid var(--art-border-color);
          border-radius: calc(var(--custom-radius) / 2 + 2px) !important;

          &:hover {
            .el-button {
              opacity: 1 !important;
            }
          }

          .top {
            position: relative;
            aspect-ratio: 16/9.5;

            .cover {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              object-fit: cover;
              background: var(--art-gray-200);
              border-radius: calc(var(--custom-radius) / 2 + 2px)
                calc(var(--custom-radius) / 2 + 2px) 0 0;

              .image-slot {
                font-size: 26px;
                color: var(--art-gray-400);
              }
            }

            .type {
              position: absolute;
              top: 5px;
              right: 5px;
              padding: 5px 4px;
              font-size: 12px;
              color: rgba(#fff, 0.8);
              background: rgba($color: #000, $alpha: 60%);
              border-radius: 4px;
            }
          }

          .bottom {
            padding: 5px 10px;

            h2 {
              font-size: 16px;
              font-weight: 500;
              color: #333;

              @include ellipsis();
            }

            .info {
              display: flex;
              justify-content: space-between;
              width: 100%;
              height: 25px;
              margin-top: 6px;
              line-height: 25px;

              .text {
                display: flex;
                align-items: center;
                color: var(--art-text-gray-600);

                i {
                  margin-right: 5px;
                  font-size: 14px;
                }

                span {
                  font-size: 13px;
                  color: var(--art-gray-600);
                }

                .line {
                  width: 1px;
                  height: 12px;
                  margin: 0 15px;
                  background-color: var(--art-border-dashed-color);
                }
              }

              .el-button {
                opacity: 0;
                transition: all 0.3s;
              }
            }
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-notebook) {
    .article-list {
      .list {
        .offset {
          .item {
            width: calc(25% - 20px);
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad-pro) {
    .article-list {
      .list {
        .offset {
          .item {
            width: calc(33.333% - 20px);

            .bottom {
              h2 {
                font-size: 16px;
              }
            }
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad) {
    .article-list {
      .list {
        .offset {
          .item {
            width: calc(50% - 20px);
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-phone) {
    .article-list {
      .list {
        .offset {
          .item {
            width: calc(100% - 20px);
          }
        }
      }
    }
  }
</style>
