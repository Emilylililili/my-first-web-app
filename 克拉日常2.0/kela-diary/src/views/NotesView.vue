<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Edit, 
  Delete, 
  Calendar, 
  Briefcase, 
  Reading, 
  VideoPlay,
  Search
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useNotesStore } from '../stores/notes'
import type { Note } from '../stores/notes'

const router = useRouter()
const notesStore = useNotesStore()

// 标签配置
const tagConfig = {
  '日常': { color: '#67c23a', icon: Calendar },
  '工作': { color: '#409eff', icon: Briefcase },
  '学习': { color: '#e6a23c', icon: Reading },
  '娱乐': { color: '#f56c6c', icon: VideoPlay }
}

// 计算属性：筛选后的笔记
const filteredNotes = computed(() => notesStore.filteredNotes)

// 搜索关键词
const searchQuery = computed({
  get: () => notesStore.searchKeyword,
  set: (value: string) => notesStore.setSearchKeyword(value)
})

// 选中的标签
const selectedTag = computed({
  get: () => notesStore.selectedTag,
  set: (value: string) => notesStore.setSelectedTag(value)
})

// 加载状态
const loading = ref(false)

// 组件挂载时初始化
onMounted(() => {
  // 组件已挂载
})

// 删除笔记
const deleteNote = async (note: Note) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除笔记「${note.title}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const deletedNote = notesStore.deleteNote(note.id)
    if (deletedNote) {
      ElMessage.success('笔记已删除')
    } else {
      ElMessage.error('删除失败，笔记不存在')
    }
  } catch {
    // 用户取消删除
  }
}

// 编辑笔记
const editNote = (note: Note) => {
  router.push(`/note/${note.id}`)
}

// 新建笔记
const createNote = () => {
  router.push('/note/new')
}

// 格式化日期
const formatDate = (date: Date | string) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    return '无效日期'
  }
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

// 截取内容预览
const getContentPreview = (content: string, maxLength = 100) => {
  const plainText = content.replace(/[#*`>\-\+]/g, '').trim()
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...' 
    : plainText
}
</script>

<template>
  <div class="notes-view">
    <!-- 页面头部 -->
    <div class="notes-header">
      <div class="header-content">
        <h2 class="page-title">📝 我的笔记</h2>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索笔记..."
            :prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-button 
            type="primary" 
            @click="createNote"
            class="create-btn"
          >
            新建笔记
          </el-button>
        </div>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div class="notes-container" v-loading="loading">
      <div class="loading-container">

        
        <!-- 空状态 -->
        <div v-if="filteredNotes.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>{{ searchQuery ? '没有找到匹配的笔记' : '还没有笔记' }}</h3>
          <p>{{ searchQuery ? '尝试使用其他关键词搜索' : '点击「新建笔记」开始记录你的想法' }}</p>
          <el-button 
            v-if="!searchQuery"
            type="primary" 
            @click="createNote"
            class="empty-action-btn"
          >
            新建第一篇笔记
          </el-button>
          <el-button 
            type="success" 
            @click="() => notesStore.initNotes()"
            class="empty-action-btn"
            style="margin-left: 10px;"
          >
            重新加载数据
          </el-button>
        </div>

        <!-- 笔记卡片网格 -->
        <TransitionGroup 
          v-else 
          name="note-list" 
          tag="div" 
          class="notes-grid"
        >
          <div 
            v-for="(note, index) in filteredNotes" 
            :key="note.id"
            class="note-card fade-in-up card-hover"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="editNote(note)"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <h3 class="note-title">{{ note.title || '无标题' }}</h3>
              <div class="card-actions" @click.stop>
                <el-button 
                  type="primary" 
                  :icon="Edit" 
                  size="small" 
                  circle
                  @click="editNote(note)"
                  class="action-btn"
                />
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  size="small" 
                  circle
                  @click="deleteNote(note)"
                  class="action-btn"
                />
              </div>
            </div>

            <!-- 卡片内容 -->
            <div class="card-content">
              <p class="note-preview">{{ getContentPreview(note.content) }}</p>
            </div>

            <!-- 卡片底部 -->
            <div class="card-footer">
              <div class="note-meta">
                <el-tag 
                  v-if="note.tags && note.tags.length > 0"
                  :color="tagConfig[note.tags[0] as keyof typeof tagConfig]?.color || '#909399'"
                  effect="light"
                  size="small"
                  class="note-tag"
                >
                  <component 
                    :is="tagConfig[note.tags[0] as keyof typeof tagConfig]?.icon || Calendar" 
                    class="tag-icon"
                  />
                  {{ note.tags[0] }}
                </el-tag>
                <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notes-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 列表过渡动画 */
.note-list-enter-active,
.note-list-leave-active {
  transition: all 0.5s ease;
}

.note-list-enter-from,
.note-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.note-list-move {
  transition: transform 0.5s ease;
}

/* 页面头部 */
.notes-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 300px;
}

.search-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
}

.search-input :deep(.el-input__inner) {
  color: white;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

.create-btn {
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 笔记容器 */
.notes-container {
  flex: 1;
  overflow-y: auto;
}

.loading-container {
  min-height: 400px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.empty-state p {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 24px;
}

.empty-action-btn {
  border-radius: 25px;
  padding: 12px 24px;
  font-weight: 600;
}

/* 笔记网格 */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 4px;
}

/* 笔记卡片 */
.note-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-height: 200px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.15);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.note-title {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.4;
  flex: 1;
  margin-right: 12px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

.card-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.note-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 卡片内容 */
.card-content {
  flex: 1;
  margin-bottom: 16px;
}

.note-preview {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  max-height: 6.4rem;
}

/* 卡片底部 */
.card-footer {
  margin-top: auto;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  font-weight: 500;
}

.tag-icon {
  width: 12px;
  height: 12px;
}

.note-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notes-header {
    margin-bottom: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .notes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .note-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .notes-view {
    padding: 12px;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .note-card {
    padding: 12px;
  }
  
  .note-title {
    font-size: 1rem;
  }
  
  .note-preview {
    font-size: 0.85rem;
    line-height: 1.4;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
  
  .card-actions {
    opacity: 1;
  }
}
</style>