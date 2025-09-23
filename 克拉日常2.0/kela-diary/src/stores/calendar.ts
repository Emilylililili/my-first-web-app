import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useTodosStore } from './todos'
import { useBoardsStore } from './boards'
import { useNotesStore } from './notes'

// 日历事件类型
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  type: 'todo' | 'task' | 'note' | 'pomodoro' | 'custom'
  sourceId?: string // 关联到原始数据的ID
  priority?: 'low' | 'medium' | 'high'
  color?: string
  completed?: boolean
  location?: string
  reminder?: Date
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: Date
  }
  createdAt: Date
  updatedAt: Date
}

// 日历视图类型
export type CalendarView = 'month' | 'week' | 'day'

// 日历状态接口
export interface CalendarState {
  events: CalendarEvent[]
  currentView: CalendarView
  selectedDate: Date
  displayDate: Date // 当前显示的月份/周/日
}

export const useCalendarStore = defineStore('calendar', () => {
  // 状态
  const events = ref<CalendarEvent[]>([])
  const currentView = ref<CalendarView>('month')
  const selectedDate = ref(new Date())
  const displayDate = ref(new Date())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 获取其他store的引用
  const todosStore = useTodosStore()
  const boardsStore = useBoardsStore()
  const notesStore = useNotesStore()

  // 监听其他store的变化
  watch(
    () => todosStore.todos,
    () => syncTodosToEvents(),
    { deep: true }
  )

  watch(
    () => boardsStore.boards,
    () => syncTasksToEvents(),
    { deep: true }
  )

  // 计算属性 - 过滤事件
  const filteredEvents = computed(() => {
    const startOfPeriod = getStartOfPeriod(displayDate.value, currentView.value)
    const endOfPeriod = getEndOfPeriod(displayDate.value, currentView.value)

    return events.value.filter(event => {
      const eventDate = event.startDate
      return eventDate >= startOfPeriod && eventDate <= endOfPeriod
    })
  })

  // 计算属性 - 按日期分组的事件
  const eventsByDate = computed(() => {
    const grouped: Record<string, CalendarEvent[]> = {}

    filteredEvents.value.forEach(event => {
      const dateKey = formatDateKey(event.startDate)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return grouped
  })

  // 计算属性 - 今日事件
  const todayEvents = computed(() => {
    const today = formatDateKey(new Date())
    return eventsByDate.value[today] || []
  })

  // 计算属性 - 即将到期的事件
  const upcomingEvents = computed(() => {
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return events.value
      .filter(event => {
        const eventDate = event.startDate
        return eventDate > now && eventDate <= weekFromNow && !event.completed
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 10)
  })

  // 工具函数 - 格式化日期键
  function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  // 工具函数 - 获取期间开始
  function getStartOfPeriod(date: Date, view: CalendarView): Date {
    const newDate = new Date(date)

    switch (view) {
      case 'day':
        return new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
      case 'week':
        const dayOfWeek = newDate.getDay()
        const diff = newDate.getDate() - dayOfWeek
        return new Date(newDate.getFullYear(), newDate.getMonth(), diff)
      case 'month':
        return new Date(newDate.getFullYear(), newDate.getMonth(), 1)
      default:
        return newDate
    }
  }

  // 工具函数 - 获取期间结束
  function getEndOfPeriod(date: Date, view: CalendarView): Date {
    const newDate = new Date(date)

    switch (view) {
      case 'day':
        return new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 23, 59, 59)
      case 'week':
        const dayOfWeek = newDate.getDay()
        const diff = newDate.getDate() - dayOfWeek + 6
        return new Date(newDate.getFullYear(), newDate.getMonth(), diff, 23, 59, 59)
      case 'month':
        return new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0, 23, 59, 59)
      default:
        return newDate
    }
  }

  // 同步待办事项到日历事件
  function syncTodosToEvents() {
    todosStore.todos.forEach(todo => {
      if (todo.dueDate) {
        const existingEvent = events.value.find(e =>
          e.sourceId === todo.id && e.type === 'todo'
        )

        if (existingEvent) {
          // 更新现有事件
          existingEvent.title = todo.title
          existingEvent.description = todo.description
          existingEvent.startDate = new Date(todo.dueDate)
          existingEvent.completed = todo.completed
          existingEvent.priority = todo.priority
          existingEvent.updatedAt = new Date()
        } else {
          // 创建新事件
          const event: CalendarEvent = {
            id: uuidv4(),
            title: todo.title,
            description: todo.description,
            startDate: new Date(todo.dueDate),
            type: 'todo',
            sourceId: todo.id,
            priority: todo.priority,
            color: getPriorityColor(todo.priority),
            completed: todo.completed,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          events.value.push(event)
        }
      }
    })
  }

  // 同步项目任务到日历事件
  function syncTasksToEvents() {
    boardsStore.boards.forEach(board => {
      board.lists.forEach(list => {
        list.cards.forEach(card => {
          if (card.due_date) {
            const existingEvent = events.value.find(e =>
              e.sourceId === card.id && e.type === 'task'
            )

            if (existingEvent) {
              // 更新现有事件
              existingEvent.title = card.title
              existingEvent.description = card.description
              existingEvent.startDate = new Date(card.due_date)
              existingEvent.priority = card.priority
              existingEvent.updatedAt = new Date()
            } else {
              // 创建新事件
              const event: CalendarEvent = {
                id: uuidv4(),
                title: card.title,
                description: card.description,
                startDate: new Date(card.due_date),
                type: 'task',
                sourceId: card.id,
                priority: card.priority,
                color: getTaskColor(card.priority),
                createdAt: new Date(),
                updatedAt: new Date()
              }
              events.value.push(event)
            }
          }
        })
      })
    })
  }

  // 获取优先级颜色
  function getPriorityColor(priority?: 'low' | 'medium' | 'high'): string {
    switch (priority) {
      case 'high': return '#f56c6c'
      case 'medium': return '#e6a23c'
      case 'low': return '#67c23a'
      default: return '#409eff'
    }
  }

  // 获取任务颜色
  function getTaskColor(priority?: 'low' | 'medium' | 'high'): string {
    switch (priority) {
      case 'high': return '#eb5a46'
      case 'medium': return '#f2d600'
      case 'low': return '#61bd4f'
      default: return '#00c2e0'
    }
  }

  // 同步所有数据
  function syncAllData() {
    isLoading.value = true
    try {
      syncTodosToEvents()
      syncTasksToEvents()
      error.value = null
    } catch (err) {
      error.value = '同步数据失败'
      console.error('Calendar sync error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 创建自定义事件
  function createEvent(eventData: Partial<CalendarEvent>) {
    const event: CalendarEvent = {
      id: uuidv4(),
      title: eventData.title || '新事件',
      startDate: eventData.startDate || new Date(),
      type: 'custom',
      color: eventData.color || '#409eff',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...eventData
    }

    events.value.push(event)
    return event
  }

  // 更新事件
  function updateEvent(id: string, updates: Partial<CalendarEvent>) {
    const event = events.value.find(e => e.id === id)
    if (event) {
      Object.assign(event, { ...updates, updatedAt: new Date() })
    }
  }

  // 删除事件
  function deleteEvent(id: string) {
    const index = events.value.findIndex(e => e.id === id)
    if (index > -1) {
      events.value.splice(index, 1)
    }
  }

  // 获取指定日期的事件
  function getEventsForDate(date: Date): CalendarEvent[] {
    const dateKey = formatDateKey(date)
    return eventsByDate.value[dateKey] || []
  }

  // 导航到上一期
  function navigatePrevious() {
    const newDate = new Date(displayDate.value)

    switch (currentView.value) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1)
        break
    }

    displayDate.value = newDate
  }

  // 导航到下一期
  function navigateNext() {
    const newDate = new Date(displayDate.value)

    switch (currentView.value) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1)
        break
    }

    displayDate.value = newDate
  }

  // 导航到今天
  function navigateToToday() {
    const today = new Date()
    selectedDate.value = today
    displayDate.value = today
  }

  // 更改视图
  function changeView(view: CalendarView) {
    currentView.value = view
  }

  // 选择日期
  function selectDate(date: Date) {
    selectedDate.value = date
  }

  // 获取月份数据
  function getMonthData(year: number, month: number) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: formatDateKey(date) === formatDateKey(new Date()),
        isSelected: formatDateKey(date) === formatDateKey(selectedDate.value),
        events: getEventsForDate(date)
      })
    }

    return days
  }

  return {
    // 状态
    events,
    currentView,
    selectedDate,
    displayDate,
    isLoading,
    error,

    // 计算属性
    filteredEvents,
    eventsByDate,
    todayEvents,
    upcomingEvents,

    // 方法
    syncAllData,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    navigatePrevious,
    navigateNext,
    navigateToToday,
    changeView,
    selectDate,
    getMonthData
  }
})