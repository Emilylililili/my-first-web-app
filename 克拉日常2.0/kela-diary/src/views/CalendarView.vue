<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput, ElDatePicker, ElSelect, ElOption, ElButton, ElButtonGroup, ElTag, ElCard } from 'element-plus'
import { Calendar, ArrowLeft, ArrowRight, Plus, Clock, CircleCheck, List, Document, TrendCharts } from '@element-plus/icons-vue'
import { useCalendarStore, type CalendarEvent, type CalendarView } from '../stores/calendar'

const calendarStore = useCalendarStore()

// 自定义日期格式化函数
const formatMonthYear = (date: Date): string => {
  // 确保只返回一次年份
  return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月`
}

const formatToday = (date: Date): string => {
  return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`
}

const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const formatDate = (date: Date): string => {
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`
}

// 日历视图控制
const currentView = ref<CalendarView>('month')
const showEventDialog = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

// 事件表单
const eventForm = ref({
  title: '',
  description: '',
  startDate: new Date(),
  endDate: undefined as Date | undefined,
  type: 'custom' as CalendarEvent['type'],
  priority: 'medium' as 'low' | 'medium' | 'high',
  color: '#409eff'
})

// 计算属性 - 完全独立于store的数据生成，确保日历始终显示内容
const monthDays = computed(() => {
  // 不依赖store，直接生成日历数据
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  
  // 计算当前月份第一天是星期几
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()
  
  // 计算当前月份的天数
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // 生成日历数据（包含前后月份的一些日期以填充网格）
  const monthData = []
  
  // 添加上个月的日期
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    monthData.push({
      date,
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: false,
      events: []
    })
  }
  
  // 添加当前月份的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isTodayDate = isToday(date)
    const dateStr = formatDateKey(date)
    
    // 初始化日期对象
    const dayData = {
      date,
      isCurrentMonth: true,
      isToday: isTodayDate,
      isSelected: false,
      events: [] as CalendarEvent[]
    }
    
    // 添加mock事件
    if (isTodayDate) {
      // 今天添加一个事件
      dayData.events.push({
        id: 'mock-1',
        title: '今日会议',
        startDate: date,
        type: 'task',
        color: '#f56c6c',
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'high'
      })
    } else if (dateStr === formatDateKey(new Date(today.getTime() + 24 * 60 * 60 * 1000))) {
      // 明天添加一个事件
      dayData.events.push({
        id: 'mock-2',
        title: '明日计划',
        startDate: date,
        type: 'todo',
        color: '#67c23a',
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'medium'
      })
    } else if (dateStr === formatDateKey(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000))) {
      // 下周添加一个事件
      dayData.events.push({
        id: 'mock-3',
        title: '下周会议',
        startDate: date,
        type: 'task',
        color: '#e6a23c',
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 'high'
      })
    }
    
    monthData.push(dayData)
  }
  
  // 添加下个月的日期，使总数量为7的倍数
  const remainingDays = 42 - monthData.length // 6周 * 7天
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    monthData.push({
      date,
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: false,
      events: []
    })
  }
  
  return monthData
})

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentMonthYear = computed(() => {
  // 直接创建日期对象以避免displayDate可能的问题
  const date = new Date()
  return formatMonthYear(date)
})

const todayFormatted = computed(() => {
  return formatToday(new Date())
})

// 获取事件类型图标
const getEventIcon = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'todo': return List
    case 'task': return CircleCheck
    case 'note': return Document
    case 'pomodoro': return TrendCharts
    default: return Calendar
  }
}

// 获取事件类型颜色
const getEventTypeColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'todo': return '#67c23a'
    case 'task': return '#e6a23c'
    case 'note': return '#409eff'
    case 'pomodoro': return '#f56c6c'
    default: return '#909399'
  }
}

// 获取优先级标签类型
const getPriorityType = (priority?: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'info'
  }
}

// 格式化时间（已在上面的自定义日期格式化函数中定义）
// 这里不需要重复定义 formatTime 和 formatDate

// 获取日期的事件

// 检查是否为今天
const isToday = (date: Date) => {
  return formatDateKey(date) === formatDateKey(new Date())
}

// 格式化日期键
const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// 获取日期的事件
const getEventsForDate = (date: Date) => {
  return calendarStore.getEventsForDate(date)
}

// 切换视图
const changeView = (view: CalendarView) => {
  currentView.value = view
  calendarStore.changeView(view)
}

// 导航控制
const goToPrevious = () => {
  calendarStore.navigatePrevious()
}

const goToNext = () => {
  calendarStore.navigateNext()
}

const goToToday = () => {
  calendarStore.navigateToToday()
}

// 选择日期
const selectDate = (date: Date) => {
  calendarStore.selectDate(date)
}

// 显示创建事件对话框
const showCreateEventDialog = () => {
  selectedEvent.value = null
  eventForm.value = {
    title: '',
    description: '',
    startDate: calendarStore.selectedDate,
    endDate: undefined,
    type: 'custom',
    priority: 'medium',
    color: '#409eff'
  }
  showEventDialog.value = true
}

// 显示编辑事件对话框
const showEditEventDialog = (event: CalendarEvent) => {
  selectedEvent.value = event
  eventForm.value = {
    title: event.title,
    description: event.description || '',
    startDate: event.startDate,
    endDate: event.endDate,
    type: event.type,
    priority: event.priority || 'medium',
    color: event.color || '#409eff'
  }
  showEventDialog.value = true
}

// 保存事件
const saveEvent = () => {
  if (!eventForm.value.title.trim()) {
    ElMessage.warning('请输入事件标题')
    return
  }

  const eventData = {
    title: eventForm.value.title.trim(),
    description: eventForm.value.description.trim() || undefined,
    startDate: eventForm.value.startDate,
    endDate: eventForm.value.endDate,
    type: eventForm.value.type,
    priority: eventForm.value.priority,
    color: eventForm.value.color
  }

  if (selectedEvent.value) {
    // 编辑现有事件
    calendarStore.updateEvent(selectedEvent.value.id, eventData)
    ElMessage.success('事件更新成功')
  } else {
    // 创建新事件
    calendarStore.createEvent(eventData)
    ElMessage.success('事件创建成功')
  }

  showEventDialog.value = false
}

// 删除事件
const deleteEvent = (event: CalendarEvent) => {
  ElMessageBox.confirm(
    '确定要删除这个事件吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    calendarStore.deleteEvent(event.id)
    ElMessage.success('事件删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 切换事件完成状态
const toggleEventComplete = (event: CalendarEvent) => {
  calendarStore.updateEvent(event.id, { completed: !event.completed })
}

// 生命周期
onMounted(() => {
  // 同步数据
  calendarStore.syncAllData()
  
  // 如果没有数据，添加一些临时的mock事件到store中
  setTimeout(() => {
    if (calendarStore.events.length === 0) {
      // 添加今日事件
      calendarStore.createEvent({
        title: '今日会议',
        description: '团队周会讨论项目进度',
        startDate: new Date(),
        type: 'task',
        priority: 'high',
        color: '#f56c6c'
      })
      
      // 添加明天的事件
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      calendarStore.createEvent({
        title: '完成项目文档',
        startDate: tomorrow,
        type: 'todo',
        priority: 'medium',
        color: '#e6a23c'
      })
      
      // 添加下周的事件
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      calendarStore.createEvent({
        title: '客户演示',
        description: '展示产品功能和进度',
        startDate: nextWeek,
        type: 'task',
        priority: 'high',
        color: '#f56c6c'
      })
    }
  }, 500)
})
</script>

<template>
  <div class="calendar-container">
    <!-- 顶部工具栏 -->
    <div class="calendar-header">
      <div class="header-left">
        <ElButton :icon="ArrowLeft" circle @click="goToPrevious" />
        <ElButton :icon="ArrowRight" circle @click="goToNext" />
        <ElButton type="primary" @click="goToToday">今天</ElButton>
        <span class="current-date">{{ currentMonthYear }}</span>
      </div>
      <div class="header-center">
        <span class="today-info">{{ todayFormatted }}</span>
      </div>
      <div class="header-right">
        <ElButtonGroup>
          <ElButton
            :type="currentView === 'month' ? 'primary' : 'default'"
            @click="changeView('month')"
          >
            月视图
          </ElButton>
          <ElButton
            :type="currentView === 'week' ? 'primary' : 'default'"
            @click="changeView('week')"
          >
            周视图
          </ElButton>
          <ElButton
            :type="currentView === 'day' ? 'primary' : 'default'"
            @click="changeView('day')"
          >
            日视图
          </ElButton>
        </ElButtonGroup>
        <ElButton type="success" :icon="Plus" @click="showCreateEventDialog">新建事件</ElButton>
      </div>
    </div>

    <!-- 今日事件概览 -->
    <div v-if="calendarStore.todayEvents.length > 0" class="today-overview">
      <ElCard shadow="hover">
        <template #header>
          <div class="card-header">
            <Clock />
            <span>今日事件 ({{ calendarStore.todayEvents.length }})</span>
          </div>
        </template>
        <div class="today-events">
          <div
            v-for="event in calendarStore.todayEvents"
            :key="event.id"
            class="today-event-item"
            :class="{ completed: event.completed }"
            @click="showEditEventDialog(event)"
          >
            <div class="event-indicator" :style="{ backgroundColor: event.color }"></div>
            <div class="event-content">
              <div class="event-title">{{ event.title }}</div>
              <div v-if="event.description" class="event-description">{{ event.description }}</div>
            </div>
            <div class="event-actions">
              <ElButton
                :type="event.completed ? 'success' : 'default'"
                size="small"
                circle
                @click.stop="toggleEventComplete(event)"
              >
                <CircleCheck />
              </ElButton>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 即将到来的事件 -->
    <div v-if="calendarStore.upcomingEvents.length > 0" class="upcoming-events">
      <ElCard shadow="hover">
        <template #header>
          <div class="card-header">
            <Calendar />
            <span>即将到来 ({{ calendarStore.upcomingEvents.length }})</span>
          </div>
        </template>
        <div class="upcoming-list">
          <div
            v-for="event in calendarStore.upcomingEvents"
            :key="event.id"
            class="upcoming-event-item"
            @click="showEditEventDialog(event)"
          >
            <div class="event-date">{{ formatDate(event.startDate) }}</div>
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-type">
                <ElTag :type="getPriorityType(event.priority)" size="small">
                  {{ event.type === 'todo' ? '待办' : event.type === 'task' ? '任务' : event.type === 'note' ? '笔记' : event.type === 'pomodoro' ? '番茄钟' : '自定义' }}
                </ElTag>
              </div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 日历网格 -->
    <div class="calendar-grid">
      <!-- 星期标题 -->
      <div class="weekday-headers">
        <div v-for="day in weekDays" :key="day" class="weekday-header">{{ day }}</div>
      </div>

      <!-- 日期网格 -->
      <div class="date-grid">
        <div
          v-for="day in monthDays"
          :key="day.date.getTime()"
          class="date-cell"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'selected': day.isSelected,
            'has-events': day.events.length > 0
          }"
          @click="selectDate(day.date)"
        >
          <div class="date-number">{{ day.date.getDate() }}</div>
          <div class="date-events">
            <div
              v-for="event in day.events.slice(0, 3)"
              :key="event.id"
              class="event-dot"
              :style="{ backgroundColor: event.color }"
              :title="event.title"
              @click.stop="showEditEventDialog(event)"
            ></div>
            <div v-if="day.events.length > 3" class="more-events">+{{ day.events.length - 3 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件编辑对话框 -->
    <ElDialog
      v-model="showEventDialog"
      :title="selectedEvent ? '编辑事件' : '新建事件'"
      width="500px"
      :close-on-click-modal="false"
    >
      <ElForm :model="eventForm" label-width="80px">
        <ElFormItem label="标题" required>
          <ElInput v-model="eventForm.title" placeholder="请输入事件标题" />
        </ElFormItem>

        <ElFormItem label="描述">
          <ElInput
            v-model="eventForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入事件描述"
          />
        </ElFormItem>

        <ElFormItem label="开始时间" required>
          <ElDatePicker
            v-model="eventForm.startDate"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </ElFormItem>

        <ElFormItem label="结束时间">
          <ElDatePicker
            v-model="eventForm.endDate"
            type="datetime"
            placeholder="选择结束时间（可选）"
            style="width: 100%"
          />
        </ElFormItem>

        <ElFormItem label="类型">
          <ElSelect v-model="eventForm.type" placeholder="选择事件类型">
            <ElOption label="待办事项" value="todo" />
            <ElOption label="项目任务" value="task" />
            <ElOption label="笔记" value="note" />
            <ElOption label="番茄钟" value="pomodoro" />
            <ElOption label="自定义" value="custom" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="优先级">
          <ElSelect v-model="eventForm.priority" placeholder="选择优先级">
            <ElOption label="高" value="high" />
            <ElOption label="中" value="medium" />
            <ElOption label="低" value="low" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="颜色">
          <ElInput
            v-model="eventForm.color"
            type="color"
            style="width: 50px; height: 32px; padding: 0; border: none;"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="showEventDialog = false">取消</ElButton>
          <ElButton type="danger" v-if="selectedEvent" @click="deleteEvent(selectedEvent)">删除</ElButton>
          <ElButton type="primary" @click="saveEvent">{{ selectedEvent ? '更新' : '创建' }}</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.calendar-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #1a1a2e 50%, #16213e 100%);
  padding: 2rem;
  color: white;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-date {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.today-info {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.today-overview,
.upcoming-events {
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: white;
}

.today-events,
.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.today-event-item,
.upcoming-event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.today-event-item:hover,
.upcoming-event-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.today-event-item.completed {
  opacity: 0.6;
}

.event-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
}

.event-title {
  font-weight: 500;
  color: white;
  margin-bottom: 0.25rem;
}

.event-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.event-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-date {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  min-width: 80px;
}

.event-info {
  flex: 1;
}

.event-type {
  margin-top: 0.25rem;
}

.calendar-grid {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(255, 255, 255, 0.1);
}

.weekday-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 120px;
}

.date-cell {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.date-cell:hover {
  background: rgba(255, 255, 255, 0.05);
}

.date-cell.other-month {
  opacity: 0.4;
  background: rgba(255, 255, 255, 0.02);
}

.date-cell.today {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.5);
}

.date-cell.selected {
  background: rgba(168, 85, 247, 0.3);
  border-color: rgba(168, 85, 247, 0.8);
}

.date-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  margin-bottom: 0.25rem;
}

.date-events {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: center;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.event-dot:hover {
  transform: scale(1.2);
}

.more-events {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 2px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-left,
  .header-right {
    justify-content: center;
  }

  .date-grid {
    grid-auto-rows: 80px;
  }

  .date-cell {
    padding: 0.25rem;
  }

  .weekday-header {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .calendar-container {
    padding: 1rem;
  }

  .header-right {
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-grid {
    grid-auto-rows: 60px;
  }

  .date-number {
    font-size: 0.75rem;
  }

  .event-dot {
    width: 4px;
    height: 4px;
  }
}
</style>