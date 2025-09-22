import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  // 可选：正文字体颜色（十六进制或 rgba）
  textColor?: string
}

export const useNotesStore = defineStore('notes', () => {
  // 笔记列表
  const notes = ref<Note[]>([])
  
  // 搜索关键词
  const searchKeyword = ref('')
  
  // 选中的标签筛选
  const selectedTag = ref('')
  
  // 可用标签列表
  const availableTags = computed(() => {
    const tags = new Set<string>()
    notes.value.forEach(note => {
      note.tags.forEach(tag => {
        tags.add(tag)
      })
    })
    return Array.from(tags).sort()
  })

  // 获取标签计数
  const getTagCount = (tag: string): number => {
    return notes.value.filter(note => note.tags.includes(tag)).length
  }
  
  // 筛选后的笔记列表
  const filteredNotes = computed(() => {
    let filtered = notes.value
    
    // 按标签筛选
    if (selectedTag.value) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag.value))
    }
    
    // 按关键词搜索
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase().trim()
      filtered = filtered.filter(note => {
        return (
          note.title.toLowerCase().includes(keyword) ||
          note.content.toLowerCase().includes(keyword) ||
          note.tags.some(tag => tag.toLowerCase().includes(keyword))
        )
      })
    }
    
    // 按更新时间倒序排列
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  })
  
  // 笔记统计
  const notesStats = computed(() => {
    const total = notes.value.length
    const withTags = notes.value.filter(note => note.tags.length > 0).length
    
    // 计算本周笔记数量
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const thisWeek = notes.value.filter(note => new Date(note.createdAt) >= startOfWeek).length
    
    // 标签统计
    const tagStats: Record<string, number> = {}
    notes.value.forEach(note => {
      note.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1
      })
    })
    
    return {
      total,
      withTags,
      withoutTags: total - withTags,
      thisWeek,
      completed: total, // 对于笔记来说，所有笔记都算是已完成的
      tagStats
    }
  })
  
  // 添加笔记
  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      id: uuidv4(),
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    notes.value.unshift(newNote)
    saveNotesToStorage()
    return newNote
  }
  
  // 更新笔记
  const updateNote = (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const index = notes.value.findIndex(note => note.id === id)
    if (index !== -1) {
      notes.value[index] = {
        ...notes.value[index],
        ...updates,
        updatedAt: new Date()
      }
      saveNotesToStorage()
      return notes.value[index]
    }
    return null
  }
  
  // 删除笔记
  const deleteNote = (id: string) => {
    const index = notes.value.findIndex(note => note.id === id)
    if (index !== -1) {
      const deletedNote = notes.value.splice(index, 1)[0]
      saveNotesToStorage()
      return deletedNote
    }
    return null
  }
  
  // 根据ID获取笔记
  const getNoteById = (id: string) => {
    return notes.value.find(note => note.id === id) || null
  }
  
  // 设置搜索关键词
  const setSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
  }
  
  // 设置标签筛选
  const setSelectedTag = (tag: string) => {
    selectedTag.value = tag
  }
  
  // 清除筛选条件
  const clearFilters = () => {
    searchKeyword.value = ''
    selectedTag.value = ''
  }
  
  // 保存笔记到本地存储
  const saveNotesToStorage = () => {
    try {
      localStorage.setItem('kela-diary-notes', JSON.stringify(notes.value))
    } catch (error) {
      console.error('保存笔记失败:', error)
    }
  }
  
  // 从本地存储加载笔记
  const loadNotesFromStorage = () => {
    try {
      const savedNotes = localStorage.getItem('kela-diary-notes')
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes)
        notes.value = parsedNotes.map((note: any) => ({
          ...note,
          // 向后兼容：可能没有 textColor 字段
          textColor: note.textColor,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }))
      } else {
        // 如果没有保存的笔记，创建示例数据
        createSampleNotes()
      }
    } catch (error) {
      console.error('加载笔记失败:', error)
      notes.value = []
      createSampleNotes()
    }
  }

  // 创建示例笔记
  const createSampleNotes = () => {
    const sampleNotes: Note[] = [
      {
        id: uuidv4(),
        title: '欢迎使用克拉日常笔记',
        content: '<h2>🎉 欢迎使用克拉日常笔记应用！</h2><p>这是一个功能丰富的个人笔记和待办管理应用。</p><h3>✨ 主要功能：</h3><ul><li><strong>📝 笔记管理</strong> - 支持富文本编辑，让你的笔记更加生动</li><li><strong>🏷️ 标签系统</strong> - 为笔记添加标签，方便分类和查找</li><li><strong>📋 待办事项</strong> - 管理你的任务，设置优先级和截止日期</li><li><strong>🔍 全文搜索</strong> - 快速找到你需要的内容</li><li><strong>🎨 动态主题</strong> - 多种精美主题，个性化你的使用体验</li></ul><p>开始记录你的想法和计划吧！</p>',
        tags: ['欢迎', '指南'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: '今日学习计划',
        content: '<h3>📚 今日学习目标</h3><ul><li>复习Vue.js组件通信</li><li>学习TypeScript高级类型</li><li>练习算法题 - 二叉树遍历</li></ul><h3>📖 学习笔记</h3><p>Vue.js中父子组件通信的几种方式：</p><ol><li><strong>Props</strong> - 父组件向子组件传递数据</li><li><strong>Events</strong> - 子组件向父组件发送事件</li><li><strong>v-model</strong> - 双向数据绑定</li><li><strong>Provide/Inject</strong> - 跨层级组件通信</li></ol>',
        tags: ['学习', '编程', 'Vue.js'],
        createdAt: new Date(Date.now() - 86400000), // 1天前
        updatedAt: new Date(Date.now() - 86400000)
      },
      {
        id: uuidv4(),
        title: '周末计划',
        content: '<h3>🎯 本周末安排</h3><h4>Saturday</h4><ul><li>🌅 早起晨跑</li><li>🛒 去超市采购</li><li>👨‍👩‍👧‍👦 和家人聚餐</li><li>📚 阅读新书《深入理解计算机系统》</li></ul><h4>Sunday</h4><ul><li>🧹 整理房间</li><li>💻 完成个人项目</li><li>🎬 看电影放松</li><li>📝 写周总结</li></ul><p><em>记得劳逸结合，保持良好的生活节奏！</em></p>',
        tags: ['生活', '计划'],
        createdAt: new Date(Date.now() - 172800000), // 2天前
        updatedAt: new Date(Date.now() - 172800000)
      }
    ]
    
    notes.value = sampleNotes
    saveNotesToStorage()
  }
  
  // 导出笔记数据
  const exportNotes = () => {
    try {
      const dataStr = JSON.stringify(notes.value, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `kela-diary-notes-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('导出笔记失败:', error)
      return false
    }
  }
  
  // 导入笔记数据
  const importNotes = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const importedNotes = JSON.parse(content)
          
          if (Array.isArray(importedNotes)) {
            const validNotes = importedNotes.filter(note => 
              note.id && note.title && note.content && note.tags
            ).map(note => ({
              ...note,
              textColor: note.textColor,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt)
            }))
            
            notes.value = validNotes
            saveNotesToStorage()
            resolve(true)
          } else {
            resolve(false)
          }
        } catch (error) {
          console.error('导入笔记失败:', error)
          resolve(false)
        }
      }
      
      reader.onerror = () => {
        resolve(false)
      }
      
      reader.readAsText(file)
    })
  }
  
  // 初始化笔记数据
  const initNotes = () => {
    loadNotesFromStorage()
  }
  
  return {
    notes,
    searchKeyword,
    selectedTag,
    availableTags,
    filteredNotes,
    notesStats,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    setSearchKeyword,
    setSelectedTag,
    clearFilters,
    exportNotes,
    importNotes,
    initNotes,
    getTagCount
  }
})