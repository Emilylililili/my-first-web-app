import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface Label {
  id: string
  name: string
  color: string
}

export interface Card {
  id: string
  title: string
  description?: string
  due_date?: string
  priority?: 'low' | 'medium' | 'high'
  labels?: Label[]
  list_id: string
  position: number
  created_at: string
}

export interface List {
  id: string
  title: string
  board_id: string
  position: number
  created_at: string
  cards: Card[]
}

export interface Board {
  id: string
  title: string
  user_id: number
  created_at: string
  lists: List[]
}

export const useBoardsStore = defineStore('boards', () => {
  // 状态
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 预定义标签
  const predefinedLabels = ref<Label[]>([
    { id: 'label-1', name: '紧急', color: '#eb5a46' },
    { id: 'label-2', name: '重要', color: '#f2d600' },
    { id: 'label-3', name: '进行中', color: '#61bd4f' },
    { id: 'label-4', name: '待审核', color: '#ff9f1a' },
    { id: 'label-5', name: '已完成', color: '#c377e0' },
    { id: 'label-6', name: '设计', color: '#0079bf' },
    { id: 'label-7', name: '开发', color: '#00c2e0' },
    { id: 'label-8', name: '测试', color: '#51e898' },
    { id: 'label-9', name: 'Bug', color: '#ff78cb' },
    { id: 'label-10', name: '功能', color: '#344563' }
  ])

  // 计算属性
  const boardsCount = computed(() => boards.value.length)
  
  const currentBoardLists = computed(() => {
    return currentBoard.value?.lists || []
  })

  // 计算看板进度
  const getBoardProgress = computed(() => (boardId?: string) => {
    const board = boardId ? boards.value.find(b => b.id === boardId) : currentBoard.value
    if (!board || !board.lists.length) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        percentage: 0,
        inProgressTasks: 0,
        todoTasks: 0
      }
    }

    // 查找已完成列表（通常是最后一个列表或标题包含"完成"的列表）
    const completedList = board.lists.find(list => 
      list.title.includes('完成') || 
      list.title.includes('已完成') || 
      list.title.includes('Done') ||
      list.position === board.lists.length - 1
    )

    // 查找进行中列表
    const inProgressList = board.lists.find(list => 
      list.title.includes('进行中') || 
      list.title.includes('正在进行') || 
      list.title.includes('In Progress') ||
      list.title.includes('Doing')
    )

    // 计算任务数量
    const totalTasks = board.lists.reduce((total, list) => total + list.cards.length, 0)
    const completedTasks = completedList ? completedList.cards.length : 0
    const inProgressTasks = inProgressList ? inProgressList.cards.length : 0
    const todoTasks = totalTasks - completedTasks - inProgressTasks

    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      percentage,
      inProgressTasks,
      todoTasks,
      boardTitle: board.title
    }
  })

  // 获取所有看板的进度统计
  const getAllBoardsProgress = computed(() => {
    return boards.value.map(board => ({
      boardId: board.id,
      boardTitle: board.title,
      ...getBoardProgress.value(board.id)
    }))
  })

  // 初始化数据
  const initBoards = () => {
    const savedBoards = localStorage.getItem('project_boards')
    if (savedBoards) {
      try {
        boards.value = JSON.parse(savedBoards)
      } catch (e) {
        console.error('Failed to parse saved boards:', e)
        boards.value = []
      }
    } else {
      // 创建示例数据
      createSampleData()
    }
  }

  // 创建示例数据
  const createSampleData = () => {
    const sampleBoard: Board = {
      id: uuidv4(),
      title: '我的第一个项目',
      user_id: 1,
      created_at: new Date().toISOString(),
      lists: [
        {
          id: uuidv4(),
          title: '待办事项',
          board_id: '',
          position: 0,
          created_at: new Date().toISOString(),
          cards: [
            {
              id: uuidv4(),
              title: '设计用户界面',
              description: '创建登录和注册页面的UI设计',
              priority: 'high',
              labels: [
                { id: 'label-1', name: '紧急', color: '#eb5a46' },
                { id: 'label-6', name: '设计', color: '#0079bf' }
              ],
              list_id: '',
              position: 0,
              created_at: new Date().toISOString()
            },
            {
              id: uuidv4(),
              title: '实现后端API',
              description: '开发用户认证相关的API接口',
              priority: 'medium',
              labels: [
                { id: 'label-7', name: '开发', color: '#00c2e0' },
                { id: 'label-10', name: '功能', color: '#344563' }
              ],
              list_id: '',
              position: 1,
              created_at: new Date().toISOString()
            }
          ]
        },
        {
          id: uuidv4(),
          title: '进行中',
          board_id: '',
          position: 1,
          created_at: new Date().toISOString(),
          cards: [
            {
              id: uuidv4(),
              title: '数据库设计',
              description: '设计用户、看板、列表、卡片的数据表结构',
              priority: 'high',
              labels: [
                { id: 'label-3', name: '进行中', color: '#61bd4f' },
                { id: 'label-6', name: '设计', color: '#0079bf' }
              ],
              list_id: '',
              position: 0,
              created_at: new Date().toISOString()
            }
          ]
        },
        {
          id: uuidv4(),
          title: '已完成',
          board_id: '',
          position: 2,
          created_at: new Date().toISOString(),
          cards: [
            {
              id: uuidv4(),
              title: '项目初始化',
              description: '创建Vue.js项目并配置基础环境',
              priority: 'low',
              labels: [
                { id: 'label-5', name: '已完成', color: '#c377e0' },
                { id: 'label-7', name: '开发', color: '#00c2e0' }
              ],
              list_id: '',
              position: 0,
              created_at: new Date().toISOString()
            }
          ]
        }
      ]
    }

    // 设置关联ID
    sampleBoard.lists.forEach(list => {
      list.board_id = sampleBoard.id
      list.cards.forEach(card => {
        card.list_id = list.id
      })
    })

    boards.value = [sampleBoard]
    saveToStorage()
  }

  // 保存到本地存储
  const saveToStorage = () => {
    localStorage.setItem('project_boards', JSON.stringify(boards.value))
  }

  // 获取所有看板
  const fetchBoards = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      // 数据已经在initBoards中加载
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取看板失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 创建新看板
  const createBoard = async (title: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const newBoard: Board = {
        id: uuidv4(),
        title,
        user_id: 1, // 当前用户ID
        created_at: new Date().toISOString(),
        lists: []
      }
      
      boards.value.push(newBoard)
      saveToStorage()
      
      return { success: true, board: newBoard }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建看板失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 获取单个看板详情
  const fetchBoard = async (boardId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const board = boards.value.find(b => b.id === boardId)
      if (!board) {
        throw new Error('看板不存在')
      }
      
      // 直接引用boards中的board对象，确保响应式更新
      currentBoard.value = board
      return { success: true, board }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取看板详情失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 创建新列表
  const createList = async (boardId: string, title: string) => {
    try {
      const board = boards.value.find(b => b.id === boardId)
      if (!board) {
        throw new Error('看板不存在')
      }
      
      const newList: List = {
        id: uuidv4(),
        title,
        board_id: boardId,
        position: board.lists.length,
        created_at: new Date().toISOString(),
        cards: []
      }
      
      board.lists.push(newList)
      
      saveToStorage()
      
      return { success: true, list: newList }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建列表失败'
      return { success: false, error: error.value }
    }
  }

  // 创建新卡片
  const createCard = async (listId: string, title: string, labels?: Label[]) => {
    try {
      const board = boards.value.find(b => 
        b.lists.some(l => l.id === listId)
      )
      if (!board) {
        throw new Error('列表不存在')
      }
      
      const list = board.lists.find(l => l.id === listId)
      if (!list) {
        throw new Error('列表不存在')
      }
      
      const newCard: Card = {
        id: uuidv4(),
        title,
        labels: labels || [],
        list_id: listId,
        position: list.cards.length,
        created_at: new Date().toISOString()
      }
      
      list.cards.push(newCard)
      
      saveToStorage()
      
      return { success: true, card: newCard }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建卡片失败'
      return { success: false, error: error.value }
    }
  }

  // 更新卡片
  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      const board = boards.value.find(b => 
        b.lists.some(l => l.cards.some(c => c.id === cardId))
      )
      if (!board) {
        throw new Error('卡片不存在')
      }
      
      const list = board.lists.find(l => l.cards.some(c => c.id === cardId))
      if (!list) {
        throw new Error('卡片不存在')
      }
      
      const cardIndex = list.cards.findIndex(c => c.id === cardId)
      if (cardIndex === -1) {
        throw new Error('卡片不存在')
      }
      
      list.cards[cardIndex] = { ...list.cards[cardIndex], ...updates }
      
      saveToStorage()
      
      return { success: true, card: list.cards[cardIndex] }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新卡片失败'
      return { success: false, error: error.value }
    }
  }

  // 移动卡片
  const moveCard = async (cardId: string, newListId: string, newPosition: number) => {
    try {
      // 找到原卡片
      let sourceBoard: Board | undefined
      let sourceList: List | undefined
      let cardIndex = -1
      
      for (const board of boards.value) {
        for (const list of board.lists) {
          const index = list.cards.findIndex(c => c.id === cardId)
          if (index !== -1) {
            sourceBoard = board
            sourceList = list
            cardIndex = index
            break
          }
        }
        if (sourceBoard) break
      }
      
      if (!sourceBoard || !sourceList || cardIndex === -1) {
        throw new Error('卡片不存在')
      }
      
      // 找到目标列表
      const targetBoard = boards.value.find(b => 
        b.lists.some(l => l.id === newListId)
      )
      if (!targetBoard) {
        throw new Error('目标列表不存在')
      }
      
      const targetList = targetBoard.lists.find(l => l.id === newListId)
      if (!targetList) {
        throw new Error('目标列表不存在')
      }
      
      // 移动卡片
      const card = sourceList.cards.splice(cardIndex, 1)[0]
      card.list_id = newListId
      card.position = newPosition
      
      targetList.cards.splice(newPosition, 0, card)
      
      // 更新位置
      targetList.cards.forEach((c, index) => {
        c.position = index
      })
      
      saveToStorage()
      
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '移动卡片失败'
      return { success: false, error: error.value }
    }
  }

  // 删除卡片
  const deleteCard = async (cardId: string) => {
    try {
      const board = boards.value.find(b => 
        b.lists.some(l => l.cards.some(c => c.id === cardId))
      )
      if (!board) {
        throw new Error('卡片不存在')
      }
      
      const list = board.lists.find(l => l.cards.some(c => c.id === cardId))
      if (!list) {
        throw new Error('卡片不存在')
      }
      
      const cardIndex = list.cards.findIndex(c => c.id === cardId)
      if (cardIndex === -1) {
        throw new Error('卡片不存在')
      }
      
      list.cards.splice(cardIndex, 1)
      
      // 更新位置
      list.cards.forEach((c, index) => {
        c.position = index
      })
      
      saveToStorage()
      
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除卡片失败'
      return { success: false, error: error.value }
    }
  }

  // 更新列表
  const updateList = async (listId: string, updates: Partial<List>) => {
    try {
      const board = boards.value.find(b => 
        b.lists.some(l => l.id === listId)
      )
      if (!board) {
        throw new Error('列表不存在')
      }
      
      const listIndex = board.lists.findIndex(l => l.id === listId)
      if (listIndex === -1) {
        throw new Error('列表不存在')
      }
      
      board.lists[listIndex] = { ...board.lists[listIndex], ...updates }
      
      saveToStorage()
      
      return { success: true, list: board.lists[listIndex] }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新列表失败'
      return { success: false, error: error.value }
    }
  }

  // 删除列表
  const deleteList = async (listId: string) => {
    try {
      const board = boards.value.find(b => 
        b.lists.some(l => l.id === listId)
      )
      if (!board) {
        throw new Error('列表不存在')
      }
      
      const listIndex = board.lists.findIndex(l => l.id === listId)
      if (listIndex === -1) {
        throw new Error('列表不存在')
      }
      
      board.lists.splice(listIndex, 1)
      
      // 更新位置
      board.lists.forEach((l, index) => {
        l.position = index
      })
      
      saveToStorage()
      
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除列表失败'
      return { success: false, error: error.value }
    }
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    boards,
    currentBoard,
    isLoading,
    error,
    predefinedLabels,
    
    // 计算属性
    boardsCount,
    currentBoardLists,
    getBoardProgress,
    getAllBoardsProgress,
    
    // 方法
    initBoards,
    fetchBoards,
    createBoard,
    fetchBoard,
    createList,
    updateList,
    deleteList,
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    clearError
  }
})