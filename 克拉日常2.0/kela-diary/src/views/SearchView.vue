<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Document, 
  Calendar, 
  Collection,
  Check,
  Clock,
  Edit
} from '@element-plus/icons-vue'
import { useNotesStore } from '../stores/notes'
import { useTodosStore } from '../stores/todos'
import type { Note } from '../stores/notes'
import type { Todo } from '../stores/todos'

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()
const todosStore = useTodosStore()

// 搜索关键词
const searchKeyword = computed(() => {
  return (route.query.q as string) || ''
})

// 搜索匹配函数
const searchMatch = (text: string, keyword: string): boolean => {
  if (!text || !keyword) return false
  
  const normalizedText = text.toLowerCase().trim()
  const normalizedKeyword = keyword.toLowerCase().trim()
  
  // 精确匹配
  if (normalizedText.includes(normalizedKeyword)) {
    return true
  }
  
  // 分词搜索（支持空格分隔的多个关键词）
  const keywords = normalizedKeyword.split(/\s+/).filter(k => k.length > 0)
  if (keywords.length > 1) {
    return keywords.every(k => normalizedText.includes(k))
  }
  
  // 模糊匹配（去除标点符号）
  const cleanText = normalizedText.replace(/[^\w\u4e00-\u9fa5]/g, '')
  const cleanKeyword = normalizedKeyword.replace(/[^\w\u4e00-\u9fa5]/g, '')
  
  return cleanText.includes(cleanKeyword)
}

// 搜索结果
const searchResults = computed(() => {
  if (!searchKeyword.value.trim()) {
    // 空搜索时显示所有内容
    return {
      notes: notesStore.notes.slice(0, 10), // 限制显示前10条
      todos: todosStore.todos.slice(0, 10), // 限制显示前10条
      total: notesStore.notes.length + todosStore.todos.length
    }
  }
  
  const keyword = searchKeyword.value.trim()
  
  // 搜索笔记
  const notes = notesStore.notes.filter(note => {
    return (
      searchMatch(note.title, keyword) ||
      searchMatch(note.content, keyword) ||
      note.tags.some(tag => searchMatch(tag, keyword))
    )
  })
  
  // 搜索待办
  const todos = todosStore.todos.filter(todo => {
    return (
      searchMatch(todo.title, keyword) ||
      (todo.description && searchMatch(todo.description, keyword))
    )
  })
  
  // 按相关性排序
  const sortedNotes = notes.sort((a, b) => {
    const aScore = getRelevanceScore(a, keyword)
    const bScore = getRelevanceScore(b, keyword)
    return bScore - aScore
  })
  
  const sortedTodos = todos.sort((a, b) => {
    const aScore = getTodoRelevanceScore(a, keyword)
    const bScore = getTodoRelevanceScore(b, keyword)
    return bScore - aScore
  })
  
  return {
    notes: sortedNotes,
    todos: sortedTodos,
    total: notes.length + todos.length
  }
})

// 计算笔记相关性得分
const getRelevanceScore = (note: Note, keyword: string): number => {
  let score = 0
  const lowerKeyword = keyword.toLowerCase()
  
  // 标题匹配权重更高
  if (note.title.toLowerCase().includes(lowerKeyword)) {
    score += 10
  }
  
  // 内容匹配
  if (note.content.toLowerCase().includes(lowerKeyword)) {
    score += 5
  }
  
  // 标签匹配
  note.tags.forEach(tag => {
    if (tag.toLowerCase().includes(lowerKeyword)) {
      score += 3
    }
  })
  
  // 最近更新的笔记得分稍高
  const daysSinceUpdate = (Date.now() - new Date(note.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  score += Math.max(0, 2 - daysSinceUpdate / 30)
  
  return score
}

// 计算待办相关性得分
const getTodoRelevanceScore = (todo: Todo, keyword: string): number => {
  let score = 0
  const lowerKeyword = keyword.toLowerCase()
  
  // 标题匹配权重更高
  if (todo.title.toLowerCase().includes(lowerKeyword)) {
    score += 10
  }
  
  // 描述匹配
  if (todo.description && todo.description.toLowerCase().includes(lowerKeyword)) {
    score += 5
  }
  
  // 未完成的待办得分更高
  if (!todo.completed) {
    score += 2
  }
  
  // 高优先级得分更高
  if (todo.priority === 'high') {
    score += 3
  } else if (todo.priority === 'medium') {
    score += 1
  }
  
  return score
}

// 高亮搜索关键词
const highlightKeyword = (text: string) => {
  if (!searchKeyword.value.trim() || !text) return text
  
  const keyword = searchKeyword.value.trim()
  
  // 处理多个关键词（空格分隔）
  const keywords = keyword.split(/\s+/).filter(k => k.length > 0)
  
  let highlightedText = text
  
  keywords.forEach(k => {
    // 转义特殊字符
    const escapedKeyword = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedKeyword})`, 'gi')
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
  })
  
  return highlightedText
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

// 跳转到笔记编辑
const goToNote = (note: Note) => {
  router.push(`/notes/edit/${note.id}`)
}

// 跳转到待办页面
const goToTodos = () => {
  router.push('/todos')
}

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colors = {
    high: '#f56c6c',
    medium: '#e6a23c',
    low: '#67c23a'
  }
  return colors[priority as keyof typeof colors] || '#909399'
}

// 截取内容预览
const getContentPreview = (content: string, maxLength = 100) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}
</script>

<template>
  <div class="search-view">
    <!-- 搜索头部 -->
    <div class="search-header">
      <h2 class="search-title">
        <el-icon><Document /></el-icon>
        搜索结果
      </h2>
      <div class="search-info">
        <span v-if="searchKeyword" class="search-keyword">
          "{{ searchKeyword }}" 
        </span>
        <span class="search-count">
          {{ searchKeyword ? `找到 ${searchResults.total} 个结果` : `显示最近的 ${searchResults.notes.length + searchResults.todos.length} 项内容` }}
        </span>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-content">
      <!-- 空状态 -->
      <div v-if="searchKeyword && searchResults.total === 0" class="empty-state">
        <div class="empty-icon">😔</div>
        <h3>没有找到相关内容</h3>
        <p>尝试使用不同的关键词或检查拼写</p>
      </div>

      <!-- 有结果或显示所有内容 -->
      <div v-else class="results-container">
        <!-- 笔记结果 -->
        <div v-if="searchResults.notes.length > 0" class="result-section">
          <h3 class="section-title">
            <el-icon><Document /></el-icon>
            笔记 ({{ searchResults.notes.length }})
          </h3>
          <div class="results-list">
            <div 
              v-for="note in searchResults.notes" 
              :key="note.id"
              class="result-item note-item"
              @click="goToNote(note)"
            >
              <div class="item-header">
                <h4 class="item-title" v-html="highlightKeyword(note.title)"></h4>
                <div class="item-meta">
                  <span class="item-date">
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(note.updatedAt) }}
                  </span>
                </div>
              </div>
              
              <div class="item-content">
                <p v-html="highlightKeyword(getContentPreview(note.content))"></p>
              </div>
              
              <div v-if="note.tags.length > 0" class="item-tags">
                <el-tag 
                  v-for="tag in note.tags" 
                  :key="tag"
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 待办结果 -->
        <div v-if="searchResults.todos.length > 0" class="result-section">
          <h3 class="section-title">
            <el-icon><Check /></el-icon>
            待办事项 ({{ searchResults.todos.length }})
          </h3>
          <div class="results-list">
            <div 
              v-for="todo in searchResults.todos" 
              :key="todo.id"
              class="result-item todo-item"
              @click="goToTodos"
            >
              <div class="item-header">
                <div class="todo-status">
                  <el-icon 
                    :class="['status-icon', { 'completed': todo.completed }]"
                  >
                    <Check v-if="todo.completed" />
                    <Clock v-else />
                  </el-icon>
                </div>
                <h4 
                  :class="['item-title', { 'completed': todo.completed }]"
                  v-html="highlightKeyword(todo.title)"
                ></h4>
                <div class="item-meta">
                  <el-tag 
                    :color="getPriorityColor(todo.priority)"
                    size="small"
                    effect="light"
                  >
                    {{ todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低' }}优先级
                  </el-tag>
                </div>
              </div>
              
              <div v-if="todo.description" class="item-content">
                <p v-html="highlightKeyword(getContentPreview(todo.description))"></p>
              </div>
              
              <div class="item-footer">
                <span class="item-date">
                  <el-icon><Calendar /></el-icon>
                  创建于 {{ formatDate(todo.createdAt) }}
                </span>
                <span v-if="todo.dueDate" class="due-date">
                  截止: {{ formatDate(todo.dueDate) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 搜索头部 */
.search-header {
  margin-bottom: 24px;
}

.search-title {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-keyword {
  color: #409eff;
  font-weight: 600;
  font-size: 1.1rem;
}

.search-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* 搜索内容 */
.search-content {
  flex: 1;
  overflow-y: auto;
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

/* 结果容器 */
.results-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 结果分组 */
.result-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
}

.section-title {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 结果列表 */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 结果项 */
.result-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 项目头部 */
.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.todo-item .item-header {
  align-items: flex-start;
}

.todo-status {
  flex-shrink: 0;
}

.status-icon {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.6);
}

.status-icon.completed {
  color: #67c23a;
}

.item-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.item-title.completed {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.6);
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.item-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 项目内容 */
.item-content {
  margin: 8px 0;
}

.item-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* 标签 */
.item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 8px;
}

/* 待办项底部 */
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 0.8rem;
}

.due-date {
  color: #e6a23c;
  font-weight: 500;
}

/* 高亮样式 */
:deep(mark) {
  background: linear-gradient(45deg, rgba(255, 235, 59, 0.4), rgba(255, 193, 7, 0.4));
  color: #fff;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(255, 235, 59, 0.3);
  border: 1px solid rgba(255, 235, 59, 0.5);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 1px 3px rgba(255, 235, 59, 0.3);
  }
  50% {
    box-shadow: 0 2px 8px rgba(255, 235, 59, 0.6);
  }
  100% {
    box-shadow: 0 1px 3px rgba(255, 235, 59, 0.3);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-title {
    font-size: 1.5rem;
  }
  
  .search-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .todo-item .item-header {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .item-meta {
    align-self: stretch;
  }
  
  .item-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .result-section {
    padding: 16px;
  }
  
  .result-item {
    padding: 12px;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
}
</style>