<!-- 公告列表 -->
<template>
  <div class="notice-list-page">
    <!-- 搜索栏 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" :inline="true" class="compact-form">
        <ElFormItem label="公告标题" class="form-item">
          <ElInput
            v-model="searchForm.title"
            placeholder="请输入公告标题"
            clearable
            style="width: 180px"
          />
        </ElFormItem>
        <ElFormItem label="创建时间" class="form-item">
          <ElDatePicker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 220px"
            size="default"
          />
        </ElFormItem>
        <ElFormItem class="form-item">
          <ElButton type="primary" @click="handleSearch" size="default"> 搜索 </ElButton>
          <ElButton @click="handleReset" size="default"> 重置 </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="table-card" shadow="never">
      <!-- 操作栏 -->
      <div class="table-header">
        <div class="header-left">
          <ElButton type="primary" @click="handleCreate"> 新建公告 </ElButton>
        </div>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading" class="skeleton-container">
        <div class="skeleton-grid">
          <div v-for="index in 15" :key="index" class="skeleton-card">
            <div class="skeleton-header">
              <ElSkeleton animated>
                <template #template>
                  <ElSkeletonItem variant="circle" style="width: 40px; height: 40px" />
                  <div style="margin-left: 50px">
                    <ElSkeletonItem
                      variant="text"
                      style="width: 60%; height: 16px; margin-bottom: 8px"
                    />
                    <ElSkeletonItem variant="text" style="width: 40%; height: 12px" />
                  </div>
                </template>
              </ElSkeleton>
            </div>
            <div class="skeleton-content">
              <ElSkeleton :rows="3" animated>
                <template #template>
                  <ElSkeletonItem
                    variant="text"
                    style="width: 100%; height: 12px; margin-bottom: 6px"
                  />
                  <ElSkeletonItem
                    variant="text"
                    style="width: 80%; height: 12px; margin-bottom: 6px"
                  />
                  <ElSkeletonItem variant="text" style="width: 60%; height: 12px" />
                </template>
              </ElSkeleton>
            </div>
            <div class="skeleton-footer">
              <ElSkeleton animated>
                <template #template>
                  <div style="display: flex; gap: 8px; margin-top: 12px">
                    <ElSkeletonItem variant="button" style="width: 50px; height: 24px" />
                    <ElSkeletonItem variant="button" style="width: 50px; height: 24px" />
                    <ElSkeletonItem variant="button" style="width: 50px; height: 24px" />
                  </div>
                </template>
              </ElSkeleton>
            </div>
          </div>
        </div>
      </div>

      <!-- 实际数据展示 -->
      <div v-else class="notice-list-container">
        <div class="notice-grid">
          <div v-for="notice in noticeStore.noticeList" :key="notice.id" class="notice-card">
            <div class="card-header">
              <div class="notice-icon">
                <ElIcon><Bell /></ElIcon>
              </div>
              <div class="notice-info">
                <h3 class="notice-title">{{ notice.title }}</h3>
                <p class="notice-time">{{ formatTime(notice.release_time) }}</p>
              </div>
            </div>
            <div class="card-content">
              <p class="notice-desc" v-html="'暂无描述'"></p>
            </div>
            <div class="card-actions">
              <ElButton size="small" type="primary" @click="handleView(notice)">查看</ElButton>
              <ElButton size="small" type="warning" @click="handleEdit(notice)">编辑</ElButton>
              <ElButton size="small" type="danger" @click="handleDelete(notice)">删除</ElButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="currentPage"
          :page-size="Params.page_size"
          :total="noticeStore.noticeTotal"
          :hide-on-single-page="true"
          layout="prev, pager, next, total, jumper"
          @current-change="onCurrentPageChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import {
    ElMessageBox,
    ElMessage,
    ElButton,
    ElSkeleton,
    ElSkeletonItem,
    ElIcon
  } from 'element-plus'
  import { Bell } from '@element-plus/icons-vue'
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useNoticeStore } from '@/store/modules/notice'
  import type { Notice } from '@/api/modules/notice'

  defineOptions({ name: 'NoticeList' })

  const router = useRouter()
  const noticeStore = useNoticeStore()
  // 传参的结构体
  const Params = {
    page: 1,
    page_size: 15
  }
  // 分页参数
  const currentPage = ref(1)

  // 公告列表数据
  // const noticeList = ref<Notice[]>([])

  // 加载状态
  const loading = ref(false)

  // 搜索表单
  const searchForm = reactive({
    title: '',
    dateRange: [] as string[]
  })

  // 格式化时间
  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN')
  }

  // 钩子函数
  onMounted(async () => {
    await loadNoticeList()
  })

  // 加载公告列表
  const loadNoticeList = async () => {
    try {
      loading.value = true
      await noticeStore.getNoticeList(Params)
    } catch (error) {
      console.error('加载公告列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 换页
  const onCurrentPageChange = async (page: number) => {
    currentPage.value = page
    Params.page = page
    await loadNoticeList()
  }

  // 搜索
  const handleSearch = async () => {
    currentPage.value = 1
    await loadNoticeList()
  }

  // 重置搜索
  const handleReset = async () => {
    Object.assign(searchForm, {
      title: '',
      dateRange: []
    })
    currentPage.value = 1
    await loadNoticeList()
  }

  // 新建公告
  const handleCreate = () => {
    router.push('/notice/create')
  }

  // 查看公告
  const handleView = (row: Notice) => {
    console.log(row)
    router.push(`/notice/detail/${row.id}`)
  }

  // 编辑公告
  const handleEdit = (row: Notice) => {
    router.push(`/notice/create?id=${row.id}&mode=edit`)
  }

  // 删除公告
  const handleDelete = (row: Notice) => {
    ElMessageBox.confirm(`确定要删除公告"${row.title}"吗？此操作不可恢复。`, '删除公告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        // await NoticeService.deleteNotice(row.id)
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .notice-list-page {
    padding: 20px;
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .search-card {
      margin-bottom: 12px;
      padding: 0;
      flex-shrink: 0;

      :deep(.el-card__body) {
        padding: 16px 20px;
      }

      .compact-form {
        .form-item {
          margin-bottom: 0;
          margin-right: 20px;

          :deep(.el-form-item__label) {
            font-size: 14px;
            padding-right: 8px;
          }

          :deep(.el-form-item__content) {
            margin-left: 0 !important;
          }
        }
      }
    }

    .table-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;

      :deep(.el-card__body) {
        padding: 16px 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .status-tabs {
        margin-bottom: 12px;
        flex-shrink: 0;

        .compact-tabs {
          :deep(.el-tabs__header) {
            margin-bottom: 8px;
          }

          :deep(.el-tabs__nav-wrap) {
            padding: 0;
          }

          :deep(.el-tabs__item) {
            padding: 8px 16px;
            font-size: 14px;
            height: 36px;
            line-height: 20px;
          }
        }
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        flex-shrink: 0;

        .header-left {
          display: flex;
          gap: 8px;
        }
      }

      // 骨架屏样式
      .skeleton-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px 0;

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 16px;
          height: calc(100vh - 320px);

          .skeleton-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 180px;

            &::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
              opacity: 0.8;
              animation: rainbowPulse 2s ease-in-out infinite;
            }

            &::after {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.1),
                transparent
              );
              animation: shimmerGlow 3s infinite;
              pointer-events: none;
            }

            .skeleton-header {
              margin-bottom: 16px;
              position: relative;
            }

            .skeleton-content {
              flex: 1;
              margin-bottom: 16px;
            }

            .skeleton-footer {
              margin-top: auto;
            }
          }
        }
      }

      // 公告列表样式
      .notice-list-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px 0;

        .notice-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 16px;
          height: calc(100vh - 320px);

          .notice-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 180px;
            cursor: pointer;

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
              box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);

              &::before {
                opacity: 1;
              }

              .card-actions {
                transform: translateY(0);
                opacity: 1;
              }
            }

            .card-header {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              margin-bottom: 16px;

              .notice-icon {
                width: 46px;
                height: 46px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                flex-shrink: 0;
              }

              .notice-info {
                flex: 1;
                min-width: 0;

                .notice-title {
                  margin: 0 0 4px 0;
                  font-size: 16px;
                  font-weight: 600;
                  color: var(--el-text-color-primary);
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  line-height: 1.3;
                }

                .notice-time {
                  margin: 0;
                  font-size: 12px;
                  color: var(--el-text-color-regular);
                  opacity: 0.8;
                }
              }
            }

            .card-content {
              flex: 1;
              margin-bottom: 16px;

              .notice-desc {
                margin: 0;
                font-size: 13px;
                line-height: 1.4;
                color: var(--el-text-color-regular);
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
            }

            .card-actions {
              display: flex;
              gap: 8px;
              justify-content: center;
              margin-top: auto;
              transform: translateY(4px);
              opacity: 0.8;
              transition: all 0.3s ease;

              .el-button {
                border-radius: 6px;
                font-size: 12px;
              }
            }
          }
        }
      }

      .pagination-wrapper {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;
        padding-top: 16px;
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }
  }

  // 骨架屏动画关键帧
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes shimmerGlow {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  @keyframes rainbowPulse {
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }
</style>
