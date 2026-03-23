<template>
  <div class="vector-db-page">
    <!-- 状态概览卡片 -->
    <el-row :gutter="20" class="status-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="status-card articles-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="36"><Document /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ status.articles_count }}</div>
              <div class="card-label">已索引文章</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="status-card events-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="36"><Calendar /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ status.events_count }}</div>
              <div class="card-label">已索引活动</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="status-card path-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="36"><FolderOpened /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value path-value">{{ status.chroma_db_path || '-' }}</div>
              <div class="card-label">数据库路径</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作区域 -->
    <el-card shadow="never" class="main-card">
      <div class="toolbar">
        <el-radio-group v-model="activeTab" @change="handleTabChange">
          <el-radio-button value="article">文章索引</el-radio-button>
          <el-radio-button value="event">活动索引</el-radio-button>
        </el-radio-group>
        <div class="toolbar-actions">
          <el-button :icon="Refresh" @click="refreshAll" :loading="statusLoading">刷新</el-button>
          <el-button
            type="danger"
            plain
            :icon="Delete"
            @click="handleClearAll"
            :loading="clearLoading"
            :disabled="currentList.length === 0"
          >
            清空{{ activeTab === 'article' ? '文章' : '活动' }}索引
          </el-button>
        </div>
      </div>

      <!-- 文档列表 -->
      <el-table
        :data="paginatedList"
        v-loading="listLoading"
        stripe
        border
        style="width: 100%"
        empty-text="暂无数据"
        row-key="doc_id"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="chunk-expand">
              <div class="chunk-header">
                <span class="chunk-title">向量分片详情（共 {{ row.chunks || 1 }} 片）</span>
              </div>
              <div class="chunk-list">
                <div class="chunk-item" v-for="(chunk, ci) in row.children || []" :key="ci">
                  <div class="chunk-index">分片 {{ Number(ci) + 1 }}</div>
                  <div class="chunk-id">{{ chunk.chroma_id }}</div>
                  <div class="chunk-text">{{ chunk.preview }}</div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="doc_id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content_type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.content_type === 'article' ? 'primary' : 'success'" size="small">
              {{ row.content_type === 'article' ? '文章' : '活动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="chunks" label="分片" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.chunks || 1 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="preview" label="内容预览" min-width="300" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              title="确定要删除这条索引吗？"
              @confirm="handleDelete(row)"
              confirm-button-text="确定"
              cancel-button-text="取消"
            >
              <template #reference>
                <el-button type="danger" link size="small" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="currentList.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="currentPage = 1"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Document, Calendar, FolderOpened, Refresh, Delete } from '@element-plus/icons-vue'
  import { AIService } from '@/api/aiApi'

  defineOptions({ name: 'VectorDB' })

  // 状态
  const statusLoading = ref(false)
  const listLoading = ref(false)
  const clearLoading = ref(false)
  const activeTab = ref<'article' | 'event'>('article')

  const status = reactive({
    articles_count: 0,
    events_count: 0,
    chroma_db_path: ''
  })

  const articleList = ref<any[]>([])
  const eventList = ref<any[]>([])

  // 分页
  const currentPage = ref(1)
  const pageSize = ref(10)

  const currentList = computed(() => {
    return activeTab.value === 'article' ? articleList.value : eventList.value
  })

  const paginatedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return currentList.value.slice(start, start + pageSize.value)
  })

  // 加载状态
  const loadStatus = async () => {
    statusLoading.value = true
    try {
      const res = await AIService.getIndexStatus()
      status.articles_count = res.articles_count
      status.events_count = res.events_count
      status.chroma_db_path = res.chroma_db_path
    } catch (e: any) {
      ElMessage.error('获取向量库状态失败: ' + (e.message || '未知错误'))
    } finally {
      statusLoading.value = false
    }
  }

  // 加载列表
  const loadList = async () => {
    listLoading.value = true
    try {
      if (activeTab.value === 'article') {
        const res = await AIService.listArticleIndex()
        articleList.value = res.items || []
      } else {
        const res = await AIService.listEventIndex()
        eventList.value = res.items || []
      }
    } catch (e: any) {
      ElMessage.error('获取索引列表失败: ' + (e.message || '未知错误'))
    } finally {
      listLoading.value = false
    }
  }

  // 切换 Tab
  const handleTabChange = () => {
    currentPage.value = 1
    loadList()
  }

  // 刷新所有
  const refreshAll = async () => {
    await loadStatus()
    await loadList()
    ElMessage.success('已刷新')
  }

  // 删除单条
  const handleDelete = async (row: any) => {
    try {
      if (row.content_type === 'article') {
        await AIService.deleteArticleIndex(row.doc_id)
      } else {
        await AIService.deleteEventIndex(row.doc_id)
      }
      ElMessage.success(`已删除: ${row.title}`)
      await refreshAll()
    } catch (e: any) {
      ElMessage.error('删除失败: ' + (e.message || '未知错误'))
    }
  }

  // 清空集合
  const handleClearAll = async () => {
    const typeName = activeTab.value === 'article' ? '文章' : '活动'
    try {
      await ElMessageBox.confirm(`确定要清空所有${typeName}索引吗？此操作不可恢复！`, '警告', {
        type: 'warning',
        confirmButtonText: '确定清空',
        cancelButtonText: '取消'
      })
      clearLoading.value = true
      await AIService.clearIndex(activeTab.value)
      ElMessage.success(`已清空所有${typeName}索引`)
      await refreshAll()
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error('清空失败: ' + (e.message || '未知错误'))
      }
    } finally {
      clearLoading.value = false
    }
  }

  // 初始化
  onMounted(async () => {
    await loadStatus()
    await loadList()
  })
</script>

<style scoped lang="scss">
  .vector-db-page {
    padding: 20px;
  }

  .status-cards {
    margin-bottom: 20px;
  }

  .status-card {
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
    }

    .card-content {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 8px 0;
    }

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 12px;
    }

    .card-info {
      flex: 1;
    }

    .card-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
    }

    .path-value {
      font-size: 14px;
      font-weight: 500;
      word-break: break-all;
    }

    .card-label {
      margin-top: 4px;
      font-size: 14px;
      color: #909399;
    }
  }

  .articles-card {
    .card-icon {
      color: #409eff;
      background: rgb(64 158 255 / 10%);
    }

    .card-value {
      color: #409eff;
    }
  }

  .events-card {
    .card-icon {
      color: #67c23a;
      background: rgb(103 194 58 / 10%);
    }

    .card-value {
      color: #67c23a;
    }
  }

  .path-card {
    .card-icon {
      color: #e6a23c;
      background: rgb(230 162 60 / 10%);
    }

    .card-value {
      color: #606266;
    }
  }

  .main-card {
    border-radius: 12px;

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
    }
  }

  /* 分片展开区域 */
  .chunk-expand {
    padding: 12px 20px;
  }

  .chunk-header {
    margin-bottom: 12px;
  }

  .chunk-title {
    font-size: 14px;
    font-weight: 600;
    color: #606266;
  }

  .chunk-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .chunk-item {
    padding: 12px 16px;
    background: #f8f9fa;
    border: 1px solid #ebeef5;
    border-radius: 8px;
  }

  .chunk-index {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #409eff;
  }

  .chunk-id {
    margin-bottom: 6px;
    font-family: monospace;
    font-size: 11px;
    color: #c0c4cc;
  }

  .chunk-text {
    font-size: 13px;
    line-height: 1.6;
    color: #606266;
    word-break: break-all;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
</style>
