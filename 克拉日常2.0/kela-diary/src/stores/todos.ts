import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: Date
  updatedAt: Date
}

export type TodoFilter = 'all' | 'active' | 'completed'

export const useTodosStore = defineStore('todos', () => {
  // 待办事项列表
  const todos = ref<Todo[]>([])
  
  // 当前筛选条件
  const currentFilter = ref<TodoFilter>('all')
  
  // 搜索关键词
  const searchKeyword = ref('')
  
  // 筛选后的待办事项列表
  const filteredTodos = computed(() => {
    let filtered = todos.value
    
    // 按状态筛选
    switch (currentFilter.value) {
      case 'active':
        filtered = filtered.filter(todo => !todo.completed)
        break
      case 'completed':
        filtered = filtered.filter(todo => todo.completed)
        break
      default:
        // 'all' - 不筛选
        break
    }
    
    // 按关键词搜索
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase().trim()
      filtered = filtered.filter(todo => {
        return (
          todo.title.toLowerCase().includes(keyword) ||
          (todo.description && todo.description.toLowerCase().includes(keyword))
        )
      })
    }
    
    // 排序：未完成的在前，按优先级和创建时间排序
    return filtered.sort((a, b) => {
      // 未完成的排在前面
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      
      // 如果都是未完成或都是已完成，按优先级排序
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) {
        return priorityDiff
      }
      
      // 最后按创建时间排序（新的在前）
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  })
  
  // 待办事项统计
  const todosStats = computed(() => {
    const total = todos.value.length
    const completed = todos.value.filter(todo => todo.completed).length
    const active = total - completed
    const highPriority = todos.value.filter(todo => todo.priority === 'high' && !todo.completed).length
    
    // 计算本周待办数量
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const thisWeek = todos.value.filter(todo => new Date(todo.createdAt) >= startOfWeek).length
    
    return {
      total,
      completed,
      active,
      highPriority,
      thisWeek,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })
  
  // 即将到期的待办事项（3天内）
  const upcomingTodos = computed(() => {
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    threeDaysFromNow.setHours(23, 59, 59, 999) // 设置为当天的最后一刻
    
    return todos.value.filter(todo => {
      if (todo.completed || !todo.dueDate) return false
      const dueDate = new Date(todo.dueDate)
      return dueDate <= threeDaysFromNow
    }).sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  })
  
  // 添加待办事项
  const addTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo: Todo = {
      id: uuidv4(),
      ...todoData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    todos.value.unshift(newTodo)
    saveTodosToStorage()
    return newTodo
  }
  
  // 更新待办事项
  const updateTodo = (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index !== -1) {
      todos.value[index] = {
        ...todos.value[index],
        ...updates,
        updatedAt: new Date()
      }
      saveTodosToStorage()
      return todos.value[index]
    }
    return null
  }
  
  // 切换待办事项完成状态
  const toggleTodo = (id: string) => {
    const todo = todos.value.find(todo => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
      todo.updatedAt = new Date()
      saveTodosToStorage()
      return todo
    }
    return null
  }
  
  // 删除待办事项
  const deleteTodo = (id: string) => {
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index !== -1) {
      const deletedTodo = todos.value.splice(index, 1)[0]
      saveTodosToStorage()
      return deletedTodo
    }
    return null
  }
  
  // 批量删除已完成的待办事项
  const clearCompleted = () => {
    const completedCount = todos.value.filter(todo => todo.completed).length
    todos.value = todos.value.filter(todo => !todo.completed)
    saveTodosToStorage()
    return completedCount
  }
  
  // 根据ID获取待办事项
  const getTodoById = (id: string) => {
    return todos.value.find(todo => todo.id === id) || null
  }
  
  // 设置筛选条件
  const setFilter = (filter: TodoFilter) => {
    currentFilter.value = filter
  }
  
  // 设置搜索关键词
  const setSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
  }
  
  // 清除搜索
  const clearSearch = () => {
    searchKeyword.value = ''
  }
  
  // 保存待办事项到本地存储
  const saveTodosToStorage = () => {
    try {
      localStorage.setItem('kela-diary-todos', JSON.stringify(todos.value))
    } catch (error) {
      console.error('保存待办事项失败:', error)
    }
  }
  
  // 从本地存储加载待办事项
  const loadTodosFromStorage = () => {
    try {
      const savedTodos = localStorage.getItem('kela-diary-todos')
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos)
        todos.value = parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        }))
      } else {
        // 如果没有保存的待办事项，创建示例数据
        createSampleTodos()
      }
    } catch (error) {
      console.error('加载待办事项失败:', error)
      todos.value = []
      createSampleTodos()
    }
  }

  // 创建示例待办事项
  const createSampleTodos = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const sampleTodos: Todo[] = [
      {
        id: uuidv4(),
        title: '完成项目文档',
        description: '整理项目的技术文档和用户手册，确保内容完整准确',
        completed: false,
        priority: 'high',
        dueDate: tomorrow.toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: '学习Vue 3新特性',
        description: '深入了解Composition API、Teleport等新功能',
        completed: false,
        priority: 'medium',
        dueDate: nextWeek.toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 3600000), // 1小时前
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: uuidv4(),
        title: '整理桌面文件',
        description: '清理桌面上的临时文件，整理文档分类',
        completed: true,
        priority: 'low',
        dueDate: undefined,
        createdAt: new Date(Date.now() - 86400000), // 1天前
        updatedAt: new Date(Date.now() - 7200000) // 2小时前
      },
      {
        id: uuidv4(),
        title: '准备周会汇报',
        description: '总结本周工作进展，准备下周计划',
        completed: false,
        priority: 'medium',
        dueDate: undefined,
        createdAt: new Date(Date.now() - 172800000), // 2天前
        updatedAt: new Date(Date.now() - 172800000)
      }
    ]
    
    todos.value = sampleTodos
    saveTodosToStorage()
  }
  
  // 导出待办事项数据
  const exportTodos = () => {
    try {
      const dataStr = JSON.stringify(todos.value, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `kela-diary-todos-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('导出待办事项失败:', error)
      return false
    }
  }
  
  // 导入待办事项数据
  const importTodos = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const importedTodos = JSON.parse(content)
          
          if (Array.isArray(importedTodos)) {
            const validTodos = importedTodos.filter(todo => 
              todo.id && todo.title && typeof todo.completed === 'boolean'
            ).map(todo => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              updatedAt: new Date(todo.updatedAt)
            }))
            
            todos.value = validTodos
            saveTodosToStorage()
            resolve(true)
          } else {
            resolve(false)
          }
        } catch (error) {
          console.error('导入待办事项失败:', error)
          resolve(false)
        }
      }
      
      reader.onerror = () => {
        resolve(false)
      }
      
      reader.readAsText(file)
    })
  }
  
  // 初始化待办事项数据
  const initTodos = () => {
    loadTodosFromStorage()
  }
  
  return {
    todos,
    currentFilter,
    searchKeyword,
    filteredTodos,
    todosStats,
    upcomingTodos,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    getTodoById,
    setFilter,
    setSearchKeyword,
    clearSearch,
    exportTodos,
    importTodos,
    initTodos
  }
})