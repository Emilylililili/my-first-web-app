<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar } from '@element-plus/icons-vue'
import { useCalendarStore } from '../stores/calendar'

const router = useRouter()
const calendarStore = useCalendarStore()

// 获取今日事件
const todayEvents = computed(() => calendarStore.todayEvents)

// 获取即将到来的事件
const upcomingEvents = computed(() => calendarStore.upcomingEvents.slice(0, 3))

// 格式化日期
const formatDate = (date: Date) => {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 跳转到日历页面
const goToCalendar = () => {
  router.push('/calendar')
}

// 获取事件类型颜色
const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'todo': return '#67c23a'
    case 'task': return '#e6a23c'
    case 'note': return '#409eff'
    case 'pomodoro': return '#f56c6c'
    default: return '#909399'
  }
}

// 获取事件类型图标
const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'todo': return '📋'
    case 'task': return '✅'
    case 'note': return '📝'
    case 'pomodoro': return '🍅'
    default: return '📅'
  }
}

// 生命周期
onMounted(() => {
  calendarStore.syncAllData()
})
</script>

<template>
  <div class="calendar-card" @click="goToCalendar">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="card-icon">
        <component :is="Calendar" class="icon-component" />
      </div>
      <div class="card-title-section">
        <h3 class="card-title">日历</h3>
        <p class="card-subtitle">时间管理</p>
      </div>
      <div class="event-count" v-if="todayEvents.length > 0">
        <span class="count-badge">{{ todayEvents.length }}</span>
      </div>
    </div>

    <!-- 今日事件 -->
    <div v-if="todayEvents.length > 0" class="today-events">
      <div class="section-title">今日事件</div>
      <div class="event-list">
        <div
          v-for="event in todayEvents.slice(0, 2)"
          :key="event.id"
          class="event-item"
        >
          <div class="event-indicator" :style="{ backgroundColor: getEventTypeColor(event.type) }"></div>
          <div class="event-content">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-type">{{ getEventTypeIcon(event.type) }} {{ event.type === 'todo' ? '待办' : event.type === 'task' ? '任务' : event.type === 'note' ? '笔记' : event.type === 'pomodoro' ? '番茄钟' : '自定义' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 即将到来事件 -->
    <div v-if="upcomingEvents.length > 0" class="upcoming-events">
      <div class="section-title">即将到来</div>
      <div class="event-list">
        <div
          v-for="event in upcomingEvents"
          :key="event.id"
          class="event-item"
        >
          <div class="event-date">{{ formatDate(event.startDate) }}</div>
          <div class="event-content">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-type">{{ getEventTypeIcon(event.type) }} {{ event.type === 'todo' ? '待办' : event.type === 'task' ? '任务' : event.type === 'note' ? '笔记' : event.type === 'pomodoro' ? '番茄钟' : '自定义' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="todayEvents.length === 0 && upcomingEvents.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <div class="empty-text">暂无事件，点击添加</div>
    </div>

    <!-- 底部操作 -->
    <div class="card-footer">
      <button class="view-calendar-btn">
        查看完整日历
      </button>
    </div>
  </div>
</template>

<style scoped>
.calendar-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.calendar-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(139, 92, 246, 0.8));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
  }

  /* 统一 Element Plus 图标内部 svg 尺寸，确保与其他图标一致 */
  .icon-component :deep(svg) {
    width: 24px;
    height: 24px;
  }

.card-title-section {
  flex: 1;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.event-count {
  position: relative;
}

.count-badge {
  background: rgba(245, 108, 108, 0.9);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 12px;
  background: rgba(168, 85, 247, 0.8);
  border-radius: 2px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.event-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.event-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.event-type {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  white-space: nowrap;
}

.today-events {
  margin-bottom: 1.5rem;
}

.upcoming-events {
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.empty-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.card-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.view-calendar-btn {
  background: rgba(168, 85, 247, 0.2);
  color: rgba(168, 85, 247, 1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-calendar-btn:hover {
  background: rgba(168, 85, 247, 0.3);
  border-color: rgba(168, 85, 247, 0.5);
}

@media (max-width: 768px) {
  .calendar-card {
    padding: 1rem;
  }

  .card-header {
    gap: 0.75rem;
  }

  .card-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-subtitle {
    font-size: 0.8rem;
  }
}
</style>