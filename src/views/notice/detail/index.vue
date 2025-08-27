<!-- 公告详情 -->
<template>
  <div class="notice-detail-page">
    <ElCard v-loading="loading" shadow="never">
      <template #header>
        <div class="detail-header">
          <ElButton type="primary" :icon="ArrowLeft" @click="handleBack"> 返回列表 </ElButton>
          <div class="header-actions">
            <ElButton type="warning" @click="handleEdit"> 编辑公告 </ElButton>
            <ElButton type="danger" @click="handleDelete"> 删除公告 </ElButton>
          </div>
        </div>
      </template>

      <div class="notice-detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-header">
            <div class="title-container">
              <h2 class="notice-title">{{ noticeData.title }}</h2>
            </div>
          </div>

          <div class="notice-meta">
            <ElRow :gutter="24">
              <ElCol :span="6">
                <div class="meta-item">
                  <span class="meta-label">作者：</span>
                  <span class="meta-value">{{ noticeData.author }}</span>
                </div>
              </ElCol>
              <ElCol :span="6">
                <div class="meta-item">
                  <span class="meta-label">创建时间：</span>
                  <span class="meta-value">{{ formatTime(noticeData.create_time) }}</span>
                </div>
              </ElCol>
              <ElCol :span="6">
                <div class="meta-item">
                  <span class="meta-label">更新时间：</span>
                  <span class="meta-value">{{ formatTime(noticeData.update_time) }}</span>
                </div>
              </ElCol>
              <ElCol :span="6">
                <div class="meta-item">
                  <span class="meta-label">浏览次数：</span>
                  <span class="meta-value">{{ noticeData.views }}</span>
                </div>
              </ElCol>
              <ElCol v-if="noticeData.publish_time" :span="6">
                <div class="meta-item">
                  <span class="meta-label">发布时间：</span>
                  <span class="meta-value">{{ formatTime(noticeData.publish_time) }}</span>
                </div>
              </ElCol>
            </ElRow>
          </div>
        </div>

        <!-- 公告内容 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>公告内容</h3>
          </div>
          <div class="content-container" v-html="noticeData.content"></div>
        </div>

        <!-- 操作记录 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>操作记录</h3>
          </div>
          <ElTimeline>
            <ElTimelineItem
              v-for="record in operationRecords"
              :key="record.id"
              :timestamp="record.time"
              :type="record.type"
            >
              <div class="timeline-content">
                <div class="operation-title">{{ record.operation }}</div>
                <div class="operation-desc">{{ record.description }}</div>
                <div class="operation-user">操作人：{{ record.operator }}</div>
              </div>
            </ElTimelineItem>
          </ElTimeline>
        </div>

        <!-- 统计信息 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>统计信息</h3>
          </div>
          <ElRow :gutter="24">
            <ElCol :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ noticeData.views }}</div>
                <div class="stat-label">总浏览量</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ todayViews }}</div>
                <div class="stat-label">今日浏览</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ weekViews }}</div>
                <div class="stat-label">本周浏览</div>
              </div>
            </ElCol>
            <ElCol :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ publishDays }}</div>
                <div class="stat-label">发布天数</div>
              </div>
            </ElCol>
          </ElRow>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowLeft } from '@element-plus/icons-vue'
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import type { Notice } from '@/api/modules/notice'

  defineOptions({ name: 'NoticeDetail' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(false)

  // 公告数据
  const noticeData = reactive<Notice>({
    id: 0,
    title: '',
    content: '',
    status: 'published',
    create_time: '',
    update_time: '',
    publish_time: '',
    author: '',
    views: 0
  })

  // 模拟统计数据
  const todayViews = ref(12)
  const weekViews = ref(45)

  // 操作记录
  const operationRecords = ref([
    {
      id: 1,
      operation: '公告发布',
      description: '公告已成功发布，对用户可见',
      operator: '系统管理员',
      time: '2024-01-15 11:00:00',
      type: 'primary' as const
    },
    {
      id: 2,
      operation: '内容修改',
      description: '更新了公告标题和部分内容',
      operator: '系统管理员',
      time: '2024-01-15 10:45:00',
      type: 'warning' as const
    },
    {
      id: 3,
      operation: '公告创建',
      description: '创建了新的公告',
      operator: '系统管理员',
      time: '2024-01-15 10:30:00',
      type: 'success' as const
    }
  ])

  // 计算发布天数
  const publishDays = computed(() => {
    if (!noticeData.publish_time) return 0
    const publishDate = new Date(noticeData.publish_time)
    const now = new Date()
    const diffTime = now.getTime() - publishDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  })

  // 格式化时间
  const formatTime = (time: string) => {
    if (!time) return '-'
    return new Date(time).toLocaleString('zh-CN')
  }

  // 获取公告详情
  const getNoticeDetail = async () => {
    const id = route.params.id as string
    if (!id) {
      ElMessage.error('公告ID不存在')
      router.back()
      return
    }

    try {
      loading.value = true
      // const response = await NoticeService.getNoticeDetail(Number(id))

      // 模拟数据
      const mockData = {
        id: Number(id),
        title: '系统维护通知',
        content: `
          <h3>维护内容</h3>
          <p>尊敬的用户，您好！</p>
          <p>为了提供更好的服务体验，我们将于今晚 <strong>22:00-24:00</strong> 进行系统维护升级。</p>

          <h4>维护期间影响：</h4>
          <ul>
            <li>系统可能无法正常访问</li>
            <li>部分功能可能暂时不可用</li>
            <li>正在进行的操作可能会中断</li>
          </ul>

          <h4>注意事项：</h4>
          <ol>
            <li>请提前保存您的工作内容</li>
            <li>建议在维护期间暂停重要操作</li>
            <li>维护完成后系统将自动恢复</li>
          </ol>

          <p>如有紧急情况，请联系客服热线：400-xxx-xxxx</p>
          <p>感谢您的理解与支持！</p>
        `,
        status: 'published',
        create_time: '2024-01-15 10:30:00',
        update_time: '2024-01-15 10:45:00',
        publish_time: '2024-01-15 11:00:00',
        author: '系统管理员',
        views: 156
      }

      Object.assign(noticeData, mockData)
    } catch {
      ElMessage.error('获取公告详情失败')
      router.back()
    } finally {
      loading.value = false
    }
  }

  // 返回列表
  const handleBack = () => {
    router.push('/notice/list')
  }

  // 编辑公告
  const handleEdit = () => {
    router.push(`/notice/create?id=${noticeData.id}&mode=edit`)
  }

  // 删除公告
  const handleDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除公告"${noticeData.title}"吗？此操作不可恢复。`,
        '删除公告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // await NoticeService.deleteNotice(noticeData.id)
      ElMessage.success('删除成功')
      router.push('/notice/list')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 页面初始化
  onMounted(() => {
    getNoticeDetail()
  })
</script>

<style lang="scss" scoped>
  .notice-detail-page {
    padding: 20px;
    height: calc(100vh - 120px);
    overflow-y: auto;

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-light);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .notice-detail-content {
      .detail-section {
        margin-bottom: 32px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--el-border-color-lighter);

          h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .title-container {
            display: flex;
            align-items: center;
            gap: 8px;

            .notice-title {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
          }

          .status-container {
            display: flex;
            gap: 8px;
          }
        }

        .notice-meta {
          margin-bottom: 24px;

          .meta-item {
            margin-bottom: 8px;

            .meta-label {
              font-weight: 500;
              color: var(--el-text-color-regular);
            }

            .meta-value {
              color: var(--el-text-color-primary);
            }
          }
        }

        .content-container {
          background: var(--el-fill-color-lighter);
          padding: 20px;
          border-radius: 6px;
          line-height: 1.6;

          :deep(h3),
          :deep(h4) {
            color: var(--el-text-color-primary);
            margin-top: 0;
          }

          :deep(p) {
            margin-bottom: 12px;
          }

          :deep(ul),
          :deep(ol) {
            padding-left: 20px;
            margin-bottom: 12px;
          }

          :deep(li) {
            margin-bottom: 4px;
          }

          :deep(strong) {
            color: var(--el-color-primary);
          }
        }

        .stat-card {
          text-align: center;
          padding: 20px;
          background: var(--el-fill-color-lighter);
          border-radius: 6px;
          border: 1px solid var(--el-border-color-lighter);

          .stat-number {
            font-size: 28px;
            font-weight: 600;
            color: var(--el-color-primary);
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
          }
        }

        .timeline-content {
          .operation-title {
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }

          .operation-desc {
            color: var(--el-text-color-regular);
            margin-bottom: 4px;
          }

          .operation-user {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
          }
        }
      }
    }
  }
</style>
