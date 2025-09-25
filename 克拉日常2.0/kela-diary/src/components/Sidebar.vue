<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Document,
  List,
  Plus,
  Filter,
  TrendCharts,
  Calendar,
  Briefcase,
  Reading,
  VideoPlay,
  Timer,
  ChatDotRound,
  Management
} from '@element-plus/icons-vue'
import { useNotesStore } from '../stores/notes'
import { useTodosStore } from '../stores/todos'
import SidebarCard from './SidebarCard.vue'

const router = useRouter()
const route = useRoute()
const notesStore = useNotesStore()
const todosStore = useTodosStore()

// 当前激活的页面
const currentPage = computed(() => {
  if (route.path.includes('todos')) return 'todos'
  if (route.path.includes('pomodoro')) return 'pomodoro'
  if (route.path.includes('ai')) return 'ai'
  if (route.path.includes('calendar')) return 'calendar'
  if (route.path.includes('dashboard') || route.path.includes('board') || route.path.includes('login') || route.path.includes('register')) return 'project'
  return 'notes'
})

// 标签图标映射
const tagIcons = {
  '日常': Calendar,
  '工作': Briefcase,
  '学习': Reading,
  '娱乐': VideoPlay
}

// 标签颜色映射
const tagColors = {
  '日常': '#67c23a',
  '工作': '#409eff',
  '学习': '#e6a23c',
  '娱乐': '#f56c6c'
}

// 标签列表
const tags = computed(() => {
  if (currentPage.value === 'todos') {
    return [] // 待办事项暂不使用标签
  }
  
  return notesStore.availableTags.map(tag => ({
    name: tag,
    count: notesStore.notesStats.tagStats[tag] || 0,
    color: tagColors[tag as keyof typeof tagColors] || '#909399',
    icon: tagIcons[tag as keyof typeof tagIcons] || Document
  }))
})

// 选中的标签
const selectedTag = computed(() => {
  return currentPage.value === 'todos' ? '' : notesStore.selectedTag
})

// 统计数据
const stats = computed(() => {
  if (currentPage.value === 'todos') {
    return todosStore.todosStats
  } else {
    return notesStore.notesStats
  }
})

// 页面切换
const switchPage = (page: string) => {
  if (page === 'todos') {
    router.push('/todos')
  } else if (page === 'pomodoro') {
    router.push('/pomodoro')
  } else if (page === 'ai') {
    router.push('/ai')
  } else if (page === 'calendar') {
    router.push('/calendar')
  } else if (page === 'project') {
    router.push('/dashboard')
  } else {
    router.push('/')
  }
}

// 新建操作
const createNew = () => {
  if (currentPage.value === 'todos') {
    // 新建待办 - 这里可以打开新建待办的对话框
    // TODO: 实现新建待办功能
  } else {
    // 新建笔记
    router.push('/note/new')
  }
}

// 标签筛选
const filterByTag = (tagName: string) => {
  if (currentPage.value === 'notes') {
    const newTag = notesStore.selectedTag === tagName ? '' : tagName
    notesStore.setSelectedTag(newTag)
  }
}

// 新建笔记
const createNewNote = () => {
  router.push('/note/new')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <!-- 页面切换 -->
      <div class="tab-switcher">
        <div class="tab-grid">
          <SidebarCard 
            :icon="List"
            title="待办"
            :variant="currentPage === 'todos' ? 'primary' : 'secondary'"
            :glow-color="currentPage === 'todos' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.8)'"
            @click="switchPage('todos')"
            class="tab-card"
          />
          <SidebarCard 
            :icon="Timer"
            title="番茄钟"
            :variant="currentPage === 'pomodoro' ? 'primary' : 'secondary'"
            :glow-color="currentPage === 'pomodoro' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.8)'"
            @click="switchPage('pomodoro')"
            class="tab-card"
          />
          <SidebarCard
            :icon="ChatDotRound"
            title="AI对话"
            :variant="currentPage === 'ai' ? 'primary' : 'secondary'"
            :glow-color="currentPage === 'ai' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.8)'"
            @click="switchPage('ai')"
            class="tab-card"
          />
          <SidebarCard
            :icon="Calendar"
            title="日历"
            :variant="currentPage === 'calendar' ? 'primary' : 'secondary'"
            :glow-color="currentPage === 'calendar' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.8)'"
            @click="switchPage('calendar')"
            class="tab-card"
          />
          <SidebarCard
            :icon="Management"
            title="项目管理"
            :variant="currentPage === 'project' ? 'primary' : 'secondary'"
            :glow-color="currentPage === 'project' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.8)'"
            @click="switchPage('project')"
            class="tab-card"
          />
          <SidebarCard 
            :icon="Plus"
            title="新建笔记"
            :variant="'secondary'"
            :glow-color="'rgba(255, 255, 255, 0.8)'"
            @click="createNewNote()"
            class="tab-card"
          />
          <SidebarCard 
            :icon="Document"
            title="笔记"
            :variant="currentPage === 'notes' ? 'primary' : 'secondary'"
            :glow-color="currentPage === 'notes' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.8)'"
            @click="switchPage('notes')"
            class="tab-card"
          />
        </div>
      </div>
      
      <!-- 标签筛选 (仅在笔记页面显示) -->
      <div v-if="currentPage === 'notes'" class="tag-filter">
        <h3 class="section-title">标签筛选</h3>
        <div class="tag-list">
          <!-- 全部标签选项 -->
          <div 
            :class="['tag-item', { 'active': selectedTag === '' }]"
            @click="filterByTag('')"
          >
            <component 
              :is="Filter" 
              style="color: #909399"
              class="tag-icon"
            />
            <span class="tag-name">全部</span>
            <span class="tag-count">({{ notesStore.notesStats.total }})</span>
          </div>
          <!-- 具体标签 -->
            <div 
              v-for="tag in notesStore.availableTags" 
              :key="tag"
              :class="['tag-item', { 'active': notesStore.selectedTag === tag }]"
              @click="notesStore.setSelectedTag(tag)"
            >
              <component 
                :is="tagIcons[tag as keyof typeof tagIcons] || Document" 
                :style="{ color: tagColors[tag as keyof typeof tagColors] || '#909399' }"
                class="tag-icon"
              />
              <span class="tag-name">{{ tag }}</span>
              <span class="tag-count">({{ notesStore.notesStats.tagStats[tag] || 0 }})</span>
            </div>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="stats-section">
        <h3 class="section-title">
          <component :is="TrendCharts" class="section-icon" />
          统计
        </h3>
        <div class="stats-grid">
          <template v-if="currentPage === 'notes'">
            <SidebarCard 
              variant="info"
              :interactive="false"
              class="stat-card"
            >
              <div class="stat-content">
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">总笔记</div>
              </div>
            </SidebarCard>
            <SidebarCard 
              variant="success"
              :interactive="false"
              class="stat-card"
            >
              <div class="stat-content">
                <div class="stat-number">{{ stats.thisWeek }}</div>
                <div class="stat-label">本周新增</div>
              </div>
            </SidebarCard>
          </template>
          <template v-else>
            <SidebarCard 
              variant="info"
              :interactive="false"
              class="stat-card"
            >
              <div class="stat-content">
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">总待办</div>
              </div>
            </SidebarCard>
            <SidebarCard 
              variant="success"
              :interactive="false"
              class="stat-card"
            >
              <div class="stat-content">
                <div class="stat-number">{{ stats.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </SidebarCard>
          </template>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 300px;
  background: var(--sidebar-bg);
  backdrop-filter: var(--blur-lg);
  border-right: 1px solid var(--sidebar-border);
  box-shadow: var(--shadow-2xl);
  transition: var(--transition-slow);
}

.sidebar-content {
  padding: 24px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: stretch;
}

/* 页面切换 */
.tab-switcher {
  display: flex;
  justify-content: center;
}

.tab-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  width: 100%;
}

.tab-card {
  height: 70px;
}

.tab-card.full-width {
  grid-column: 1 / -1;
}



/* 标签筛选 */
.tag-filter {
  flex: 1;
}

.section-title {
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 16px;
  height: 16px;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 48px;
}

.tag-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
  transform: scaleY(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tag-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.tag-item:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(8px) scale(1.02);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.tag-item:hover::before {
  transform: scaleY(1);
  width: 4px;
}

.tag-item:hover::after {
  left: 100%;
}

.tag-item:active {
  transform: translateX(4px) scale(1.01);
  background: rgba(255, 255, 255, 0.25);
}

.tag-item.active {
  background: rgba(100, 181, 246, 0.25);
  border-color: rgba(100, 181, 246, 0.5);
  box-shadow: 0 8px 32px rgba(100, 181, 246, 0.3);
  transform: translateX(8px) scale(1.02);
  color: #64B5F6;
}

.tag-item.active::before {
  transform: scaleY(1);
  width: 4px;
  background: #64B5F6;
}

.tag-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-name {
  font-weight: 500;
  font-size: 0.9rem;
  flex: 1;
  line-height: 1.4;
}

.tag-count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  flex-shrink: 0;
}

/* 统计信息 */
.stats-section {
  margin-top: auto;
  padding-top: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: stretch;
}

.stat-card {
  height: 80px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    margin: 0;
    border-radius: 0;
    border-right: 1px solid var(--border-secondary);
  }
  
  .sidebar-content {
    padding: var(--spacing-lg);
    gap: var(--spacing-lg);
  }
  
  .tab-button {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.85rem;
  }
  
  .create-button {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 0.9rem;
  }
  
  .tag-item {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.85rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-radius: 0;
    border-right: none;
    border-bottom: 1px solid var(--border-secondary);
    padding: var(--spacing-md);
  }
  
  .sidebar-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .tab-grid {
    flex: 1;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
  }
  
  .tab-card {
    height: 40px;
  }
  
  .create-section {
    margin-top: 0;
    flex-shrink: 0;
  }
  
  .create-card {
    height: 40px;
  }
  
  .tag-filter {
    display: none;
  }
  
  .stats-section {
    display: none;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .tag-item {
    padding: var(--spacing-sm);
    font-size: 0.8rem;
  }
  
  .section-title {
    font-size: 0.8rem;
  }
}
</style>