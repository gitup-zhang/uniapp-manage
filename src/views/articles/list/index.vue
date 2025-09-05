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
          @clear="searchclear"
        />
      </ElCol>
      <ElCol :span="6">
        <el-select
          v-model="selecttype"
          placeholder="Select"
          style="width: 240px"
          @change="selectType"
        >
          <el-option
            v-for="item in articlestore.fieldType"
            :key="item.field_id"
            :label="item.field_name"
            :value="item.field_code"
          />
        </el-select>
      </ElCol>
      <ElCol :span="6">
        <ElSegmented v-model="yearVal" :options="options" @change="searchArticleByYear" />
      </ElCol>

      <ElCol :span="6" style="display: flex; justify-content: flex-end">
        <ElButton @click="toAddArticle">新增文章</ElButton>
      </ElCol>
    </ElRow>

    <div class="list">
      <div class="offset">
        <!-- NEWS类型的卡片布局（原有布局） -->
        <template v-if="yearVal === 'NEWS'">
          <div
            class="item news-item"
            v-for="item in articlestore.ArticlesNew"
            :key="item.article_id"
            @click="toDetail(item)"
          >
            <!-- 骨架屏 -->
            <ElSkeleton animated :loading="isLoading" style="width: 100%; height: 100%">
              <template #template>
                <div class="modern-skeleton-news">
                  <!-- 图片骨架 -->
                  <div class="skeleton-image-container">
                    <ElSkeletonItem
                      variant="image"
                      style="width: 100%; height: 100%; border-radius: 12px"
                    />
                    <!-- 类型标签骨架 -->
                    <div class="skeleton-type-tag">
                      <ElSkeletonItem
                        variant="rect"
                        style="width: 60px; height: 20px; border-radius: 10px"
                      />
                    </div>
                  </div>

                  <!-- 内容骨架 -->
                  <div class="skeleton-content">
                    <!-- 标题骨架 -->
                    <div class="skeleton-title">
                      <ElSkeletonItem
                        variant="h3"
                        style="width: 90%; height: 20px; border-radius: 4px"
                      />
                      <ElSkeletonItem
                        variant="h3"
                        style="width: 70%; height: 20px; border-radius: 4px; margin-top: 6px"
                      />
                    </div>

                    <!-- 时间信息骨架 -->
                    <div class="skeleton-time">
                      <ElSkeletonItem variant="circle" style="width: 16px; height: 16px" />
                      <ElSkeletonItem
                        variant="text"
                        style="width: 80px; height: 14px; margin-left: 8px"
                      />
                    </div>

                    <!-- 按钮骨架 -->
                    <div class="skeleton-buttons">
                      <ElSkeletonItem
                        variant="button"
                        style="width: 45px; height: 24px; border-radius: 6px"
                      />
                      <ElSkeletonItem
                        variant="button"
                        style="width: 45px; height: 24px; border-radius: 6px; margin-left: 6px"
                      />
                      <ElSkeletonItem
                        variant="button"
                        style="width: 45px; height: 24px; border-radius: 6px; margin-left: 6px"
                      />
                    </div>
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
                  <div class="time-info">
                    <i class="iconfont-sys">&#xe6f7;</i>
                    <span>{{ useDateFormat(item.release_time, 'YYYY-MM-DD') }}</span>
                  </div>
                  <div class="action-buttons">
                    <ElButton type="primary" size="small" @click.stop="toDetail(item)">
                      查看
                    </ElButton>
                    <ElButton type="warning" size="small" @click.stop="toEdit(item)">
                      编辑
                    </ElButton>
                    <ElButton type="danger" size="small" @click.stop="handleDelete(item)">
                      删除
                    </ElButton>
                  </div>
                </div>
              </template>
            </ElSkeleton>
          </div>
        </template>

        <!-- POLICY类型的卡片布局（新的无图片布局） -->
        <template v-if="yearVal === 'POLICY'">
          <div
            class="item policy-item"
            v-for="item in articlestore.ArticlesNew"
            :key="item.article_id"
            @click="toDetail(item)"
          >
            <!-- 骨架屏 -->
            <ElSkeleton animated :loading="isLoading" style="width: 100%; height: 100%">
              <template #template>
                <div class="modern-skeleton-policy">
                  <!-- 头部骨架 -->
                  <div class="skeleton-card-header">
                    <div class="skeleton-icon">
                      <ElSkeletonItem variant="circle" style="width: 40px; height: 40px" />
                    </div>
                    <div class="skeleton-header-info">
                      <div class="skeleton-title">
                        <ElSkeletonItem
                          variant="h3"
                          style="width: 85%; height: 18px; border-radius: 4px"
                        />
                        <ElSkeletonItem
                          variant="h3"
                          style="width: 65%; height: 18px; border-radius: 4px; margin-top: 6px"
                        />
                      </div>
                      <div class="skeleton-meta">
                        <ElSkeletonItem
                          variant="rect"
                          style="width: 60px; height: 20px; border-radius: 10px"
                        />
                        <ElSkeletonItem
                          variant="rect"
                          style="width: 80px; height: 20px; border-radius: 10px; margin-left: 8px"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 内容骨架 -->
                  <div class="skeleton-card-body">
                    <ElSkeletonItem
                      variant="p"
                      style="width: 100%; height: 14px; border-radius: 3px"
                    />
                    <ElSkeletonItem
                      variant="p"
                      style="width: 95%; height: 14px; border-radius: 3px; margin-top: 6px"
                    />
                    <ElSkeletonItem
                      variant="p"
                      style="width: 80%; height: 14px; border-radius: 3px; margin-top: 6px"
                    />
                  </div>

                  <!-- 底部骨架 -->
                  <div class="skeleton-card-footer">
                    <div class="skeleton-stats">
                      <ElSkeletonItem
                        variant="rect"
                        style="width: 60px; height: 16px; border-radius: 8px"
                      />
                    </div>
                    <div class="skeleton-buttons">
                      <ElSkeletonItem
                        variant="button"
                        style="width: 60px; height: 28px; border-radius: 6px"
                      />
                      <ElSkeletonItem
                        variant="button"
                        style="width: 45px; height: 28px; border-radius: 6px; margin-left: 8px"
                      />
                      <ElSkeletonItem
                        variant="button"
                        style="width: 45px; height: 28px; border-radius: 6px; margin-left: 8px"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template #default>
                <div class="policy-content">
                  <!-- 卡片头部 -->
                  <div class="card-header">
                    <div class="header-left">
                      <!-- <div class="policy-icon">
                        <i class="iconfont-sys">&#xe6f1;</i>
                      </div> -->
                      <div class="header-info">
                        <h3 class="article-title">{{ item.article_title }}</h3>
                        <div class="meta-info">
                          <span class="type-badge">{{ item.article_type }}</span>
                          <div class="time-badge">
                            <i class="iconfont-sys">&#xe6f7;</i>
                            <span>{{ useDateFormat(item.release_time, 'YYYY-MM-DD') }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 卡片内容 -->
                  <div class="card-body">
                    <div class="content-preview">
                      <p class="description">{{ item.brief_content || '暂无简介' }}</p>
                    </div>
                  </div>

                  <!-- 卡片底部 -->
                  <div class="card-footer">
                    <!-- <div class="stats-info">
                      <span class="view-count">
                        <i class="iconfont-sys">&#xe689;</i>
                        {{ item.article_id * 10 + 25 }} 阅读
                      </span>
                    </div> -->
                    <div class="action-buttons">
                      <ElButton type="primary" size="small" @click.stop="toDetail(item)">
                        查看
                      </ElButton>
                      <ElButton type="warning" size="small" @click.stop="toEdit(item)">
                        编辑
                      </ElButton>
                      <ElButton type="danger" size="small" @click.stop="handleDelete(item)">
                        删除
                      </ElButton>
                    </div>
                  </div>
                </div>
              </template>
            </ElSkeleton>
          </div>
        </template>
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
  import { ElMessage, ElMessageBox } from 'element-plus'
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
  import { ArticleService } from '@/api/articleApi'

  defineOptions({ name: 'ArticleList' })

  const yearVal = ref('POLICY')

  const options = ['POLICY', 'NEWS']

  const searchVal = ref('')
  const articleList = ref<ArticleType[]>([])
  const currentPage = ref(1)
  const pageSize = ref(15)
  const selecttype = ref('全部')
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
  // 搜索框清除
  const searchclear = () => {
    console.log('搜索的文章为：', searchVal.value)
    Params.article_title = searchVal.value
    articlestore.getArticles(Params)
  }

  // 根据年份查询文章
  const searchArticleByYear = () => {
    console.log('选择的领域：', yearVal.value)
    Params.article_type = yearVal.value
    articlestore.getArticles(Params)
    // getArticleList({ backTop: true })
  }

  const getArticleList = async ({ backTop = false }) => {
    isLoading.value = true

    if (searchVal.value) {
      yearVal.value = 'All'
    }

    if (yearVal.value === 'All') {
      // year = ''
    }

    articleList.value = ArticleList
    isLoading.value = false

    if (backTop) {
      useCommon().scrollToTop()
    }
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    console.log('选择的页数：', val)

    Params.page = currentPage.value
    articlestore.getArticles(Params)
  }
  // 领域函数
  const selectType = () => {
    console.log('选择的领域：', selecttype.value)
    if (selecttype.value == 'ALL') {
      console.log('选择全部')
      Params.field_type = ''
      articlestore.getArticles(Params)
    } else {
      console.log('选择领域')
      Params.field_type = selecttype.value
      articlestore.getArticles(Params)
    }
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

  // 删除文章
  const handleDelete = (item: ArticleType) => {
    console.log('删除文章：', item.article_id)
    ElMessageBox.confirm(`确定要删除文章"${item.article_title}"吗？此操作不可恢复。`, '删除文章', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        // 这里应该调用删除文章的API
        await ArticleService.deleteArticle(item.article_id)
        ElMessage.success('删除成功')
        // 重新获取文章列表
        articlestore.getArticles(Params)
      } catch {
        ElMessage.error('删除失败')
      }
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
            .action-buttons {
              opacity: 1 !important;
            }
          }
        }

        // NEWS类型的样式（原有样式）
        .news-item {
          // 现代化骨架屏样式（增强动画效果）
          .modern-skeleton-news {
            height: 100%;
            display: flex;
            flex-direction: column;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.95) 0%,
              rgba(248, 250, 252, 0.98) 100%
            );
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(226, 232, 240, 0.8);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

            // 添加顶部光效边框
            &::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
              opacity: 0.6;
              animation: rainbow-glow 3s ease-in-out infinite;
            }

            // 添加整体光波效果
            &::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(
                45deg,
                transparent 30%,
                rgba(255, 255, 255, 0.4) 50%,
                transparent 70%
              );
              animation: shimmer 2.5s infinite ease-in-out;
              pointer-events: none;
              z-index: 1;
            }

            .skeleton-image-container {
              position: relative;
              aspect-ratio: 16/9.5;
              background: linear-gradient(
                135deg,
                #f1f5f9 0%,
                #e2e8f0 25%,
                #f8fafc 50%,
                #e2e8f0 75%,
                #f1f5f9 100%
              );
              background-size: 400% 400%;
              animation: gradient-shift 4s ease-in-out infinite;

              .skeleton-type-tag {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 12px;
                padding: 6px;
                backdrop-filter: blur(15px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                animation: pulse-glow 2s ease-in-out infinite;
              }
            }

            .skeleton-content {
              flex: 1;
              padding: 16px;
              display: flex;
              flex-direction: column;
              position: relative;
              z-index: 2;

              .skeleton-title {
                margin-bottom: 12px;

                .el-skeleton__item {
                  background: linear-gradient(
                    90deg,
                    #f1f5f9 0%,
                    #e2e8f0 25%,
                    #cbd5e1 50%,
                    #e2e8f0 75%,
                    #f1f5f9 100%
                  );
                  background-size: 400% 100%;
                  animation: skeleton-wave 2s ease-in-out infinite;
                  border-radius: 6px;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
              }

              .skeleton-time {
                display: flex;
                align-items: center;
                margin-bottom: 16px;

                .el-skeleton__item {
                  background: linear-gradient(
                    90deg,
                    #e2e8f0 0%,
                    #cbd5e1 25%,
                    #94a3b8 50%,
                    #cbd5e1 75%,
                    #e2e8f0 100%
                  );
                  background-size: 300% 100%;
                  animation: skeleton-wave 1.8s ease-in-out infinite;
                  border-radius: 8px;
                }
              }

              .skeleton-buttons {
                margin-top: auto;
                display: flex;
                justify-content: center;
                gap: 8px;

                .el-skeleton__item {
                  background: linear-gradient(
                    135deg,
                    #e0e7ff 0%,
                    #c7d2fe 25%,
                    #a5b4fc 50%,
                    #c7d2fe 75%,
                    #e0e7ff 100%
                  );
                  background-size: 300% 300%;
                  animation: button-glow 2.2s ease-in-out infinite;
                  border-radius: 8px;
                  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
                }
              }
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
            display: flex;
            flex-direction: column;

            h2 {
              font-size: 16px;
              font-weight: 500;
              color: #333;
              margin: 0 0 8px 0;

              @include ellipsis();
            }

            .time-info {
              display: flex;
              align-items: center;
              color: var(--art-text-gray-600);
              margin-bottom: 12px;

              i {
                margin-right: 5px;
                font-size: 14px;
              }

              span {
                font-size: 13px;
                color: var(--art-gray-600);
              }
            }

            .action-buttons {
              display: flex;
              justify-content: center;
              gap: 8px;
              opacity: 0;
              transition: all 0.3s;
              margin-top: auto;

              .el-button {
                font-size: 12px;
                padding: 4px 8px;
              }
            }
          }
        }

        // POLICY类型的样式（全新设计）
        .policy-item {
          min-height: 220px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(248, 250, 252, 0.98) 100%
          );
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;

          // 添加微妙的边框光效
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          &:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
            border-color: rgba(59, 130, 246, 0.4);

            &::before {
              opacity: 1;
            }

            .action-buttons {
              opacity: 1;
              transform: translateY(0);
            }
          }

          // 现代化骨架屏样式
          .modern-skeleton-policy {
            height: 100%;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;

            .skeleton-card-header {
              display: flex;
              gap: 12px;

              .skeleton-icon {
                flex-shrink: 0;
              }

              .skeleton-header-info {
                flex: 1;

                .skeleton-title {
                  margin-bottom: 8px;

                  .el-skeleton__item {
                    background: linear-gradient(90deg, #f8fafc 25%, #e2e8f0 50%, #f8fafc 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 2s ease-in-out infinite;
                  }
                }

                .skeleton-meta {
                  display: flex;
                  gap: 8px;

                  .el-skeleton__item {
                    background: linear-gradient(90deg, #e0e7ff 25%, #c7d2fe 50%, #e0e7ff 75%);
                  }
                }
              }
            }

            .skeleton-card-body {
              flex: 1;

              .el-skeleton__item {
                background: linear-gradient(90deg, #f1f5f9 25%, #cbd5e1 50%, #f1f5f9 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.8s ease-in-out infinite;
              }
            }

            .skeleton-card-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .skeleton-stats {
                .el-skeleton__item {
                  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
                }
              }

              .skeleton-buttons {
                display: flex;
                gap: 8px;

                .el-skeleton__item {
                  background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 50%, #ddd6fe 100%);
                  background-size: 200% 100%;
                  animation: skeleton-loading 2.2s ease-in-out infinite;
                }
              }
            }
          }

          .policy-content {
            height: 100%;
            display: flex;
            flex-direction: column;

            .card-header {
              padding: 20px 20px 0 20px;

              .header-left {
                display: flex;
                align-items: flex-start;
                gap: 14px;

                .policy-icon {
                  width: 46px;
                  height: 46px;
                  border-radius: 12px;
                  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

                  i {
                    font-size: 20px;
                    color: white;
                  }
                }

                .header-info {
                  flex: 1;
                  min-width: 0;

                  .article-title {
                    font-size: 17px;
                    font-weight: 600;
                    color: #1e293b;
                    line-height: 1.4;
                    margin: 0 0 10px 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  }

                  .meta-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;

                    .type-badge {
                      padding: 4px 10px;
                      font-size: 11px;
                      font-weight: 600;
                      color: #3b82f6;
                      background: linear-gradient(
                        135deg,
                        rgba(59, 130, 246, 0.1) 0%,
                        rgba(147, 197, 253, 0.15) 100%
                      );
                      border: 1px solid rgba(59, 130, 246, 0.2);
                      border-radius: 12px;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                    }

                    .time-badge {
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      padding: 4px 8px;
                      background: rgba(100, 116, 139, 0.1);
                      border-radius: 8px;
                      font-size: 12px;
                      color: #64748b;

                      i {
                        font-size: 12px;
                        color: #94a3b8;
                      }
                    }
                  }
                }
              }
            }

            .card-body {
              flex: 1;
              padding: 16px 20px;

              .content-preview {
                .description {
                  font-size: 14px;
                  color: #64748b;
                  line-height: 1.6;
                  margin: 0;
                  display: -webkit-box;
                  -webkit-line-clamp: 3;
                  line-clamp: 3;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
              }
            }

            .card-footer {
              padding: 0 20px 20px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid rgba(226, 232, 240, 0.6);
              margin: 0 20px;
              padding-top: 16px;

              .stats-info {
                .view-count {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  color: #64748b;
                  font-weight: 500;

                  i {
                    font-size: 14px;
                    color: #94a3b8;
                  }
                }
              }

              .action-buttons {
                display: flex;
                gap: 8px;
                opacity: 0;
                transform: translateY(4px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

                .el-button {
                  font-size: 12px;
                  font-weight: 500;
                  border-radius: 8px;
                  transition: all 0.2s ease;

                  &.el-button--primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    border: none;
                    color: white;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

                    &:hover {
                      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                      transform: translateY(-1px);
                      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                    }
                  }

                  &.el-button--warning {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border: none;
                    color: white;
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);

                    &:hover {
                      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                      transform: translateY(-1px);
                      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
                    }
                  }

                  &.el-button--danger {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border: none;
                    color: white;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);

                    &:hover {
                      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                      transform: translateY(-1px);
                      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .empty-state {
      margin-top: 16vh;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  // 骨架屏动画
  @keyframes skeleton-loading {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(200%) rotate(45deg);
    }
  }

  // 新增动画效果
  @keyframes skeleton-wave {
    0% {
      background-position: -400% 0;
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-1px);
    }
    100% {
      background-position: 400% 0;
      transform: translateY(0px);
    }
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 0%;
    }
    25% {
      background-position: 100% 0%;
    }
    50% {
      background-position: 100% 100%;
    }
    75% {
      background-position: 0% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }

  @keyframes rainbow-glow {
    0%,
    100% {
      opacity: 0.6;
      filter: hue-rotate(0deg);
    }
    33% {
      opacity: 0.8;
      filter: hue-rotate(120deg);
    }
    66% {
      opacity: 0.9;
      filter: hue-rotate(240deg);
    }
  }

  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
    }
  }

  @keyframes button-glow {
    0% {
      background-position: 0% 0%;
      transform: scale(1);
    }
    50% {
      background-position: 100% 100%;
      transform: scale(1.02);
    }
    100% {
      background-position: 0% 0%;
      transform: scale(1);
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

            &.news-item .bottom h2 {
              font-size: 16px;
            }

            &.policy-item .policy-content .header h2 {
              font-size: 15px;
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

            &.policy-item {
              min-height: 160px;

              .policy-content {
                padding: 14px;

                .header h2 {
                  font-size: 15px;
                }

                .description {
                  font-size: 13px;
                  -webkit-line-clamp: 2;
                  line-clamp: 2;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
