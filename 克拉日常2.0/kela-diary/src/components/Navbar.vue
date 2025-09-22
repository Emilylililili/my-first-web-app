<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Search
} from '@element-plus/icons-vue'
import { useNotesStore } from '../stores/notes'
import { useTodosStore } from '../stores/todos'

// 使用stores
const notesStore = useNotesStore()
const todosStore = useTodosStore()
const route = useRoute()
const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 搜索历史
const searchHistory = ref<string[]>([])
const showSearchSuggestions = ref(false)

// 从localStorage加载搜索历史
const loadSearchHistory = () => {
  try {
    const saved = localStorage.getItem('search-history')
    if (saved) {
      searchHistory.value = JSON.parse(saved).slice(0, 10) // 最多保存10条
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return
  
  const trimmedKeyword = keyword.trim()
  
  // 移除重复项
  const filtered = searchHistory.value.filter(item => item !== trimmedKeyword)
  
  // 添加到开头
  searchHistory.value = [trimmedKeyword, ...filtered].slice(0, 10)
  
  try {
    localStorage.setItem('search-history', JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 初始化搜索历史
loadSearchHistory()

// 搜索处理
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  
  if (keyword) {
    saveSearchHistory(keyword)
    showSearchSuggestions.value = false
    router.push({
      path: '/search',
      query: { q: keyword }
    })
  } else {
    // 空搜索时也跳转到搜索页面
    showSearchSuggestions.value = false
    router.push('/search')
  }
}

// 搜索按钮点击
const onSearchClick = () => {
  handleSearch()
}

// 清空搜索
const onSearchClear = () => {
  searchKeyword.value = ''
  showSearchSuggestions.value = false
  // 如果当前在搜索页面，返回首页
  if (route.path === '/search') {
    router.push('/')
  }
}

// 搜索输入框聚焦
const onSearchFocus = () => {
  if (searchHistory.value.length > 0) {
    showSearchSuggestions.value = true
  }
}

// 搜索输入框失焦
const onSearchBlur = () => {
  // 延迟隐藏，允许点击建议项
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

// 选择搜索建议
const selectSuggestion = (suggestion: string) => {
  searchKeyword.value = suggestion
  handleSearch()
}

// 删除搜索历史项
const removeHistoryItem = (index: number) => {
  searchHistory.value.splice(index, 1)
  try {
    localStorage.setItem('search-history', JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('删除搜索历史失败:', error)
  }
}

// 清空搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  showSearchSuggestions.value = false
  try {
    localStorage.removeItem('search-history')
  } catch (error) {
    console.error('清空搜索历史失败:', error)
  }
}


</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">
      <!-- Logo区域 -->
      <div class="navbar-brand">
        <h1 class="brand-title">克拉日记</h1>
        <span class="brand-subtitle">记录美好时光</span>
      </div>

      <!-- 搜索区域 -->
      <div class="navbar-search">
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索笔记或待办..."
            :prefix-icon="Search"
            size="large"
            class="search-input"
            @keyup.enter="handleSearch"
            @clear="onSearchClear"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
            clearable
          >
            <template #append>
              <el-button 
                :icon="Search" 
                @click="onSearchClick"
                class="search-button"
              />
            </template>
          </el-input>
          
          <!-- 搜索建议下拉框 -->
          <div v-if="showSearchSuggestions && searchHistory.length > 0" class="search-suggestions">
            <div class="suggestions-header">
              <span class="suggestions-title">搜索历史</span>
              <el-button 
                text 
                size="small" 
                @click="clearSearchHistory"
                class="clear-history-btn"
              >
                清空
              </el-button>
            </div>
            <div class="suggestions-list">
              <div 
                v-for="(item, index) in searchHistory" 
                :key="index"
                class="suggestion-item"
                @click="selectSuggestion(item)"
              >
                <el-icon class="suggestion-icon"><Search /></el-icon>
                <span class="suggestion-text">{{ item }}</span>
                <el-button 
                  text 
                  size="small" 
                  @click.stop="removeHistoryItem(index)"
                  class="remove-btn"
                >
                  ×
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作区域已移除主题相关按钮 -->
    </div>

  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 75px;
  background: var(--navbar-bg);
  backdrop-filter: var(--blur-lg);
  border-bottom: 1px solid var(--navbar-border);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
}

.navbar-content {
  height: 100%;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 8px;
}

.navbar-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 200px;
}

.brand-title {
  color: white;
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 3px;
  letter-spacing: 0.3px;
}

.navbar-search {
  flex: 1;
  max-width: 500px;
  min-width: 280px;
  display: flex;
  justify-content: center;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  margin-top: 8px;
  overflow: hidden;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.1);
}

.suggestions-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
}

.clear-history-btn {
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.8rem;
  padding: 4px 8px;
}

.clear-history-btn:hover {
  color: rgba(0, 0, 0, 0.8);
  background: rgba(255, 255, 255, 0.3);
}

.suggestions-list {
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-icon {
  color: rgba(0, 0, 0, 0.4);
  margin-right: 12px;
  font-size: 14px;
}

.suggestion-text {
  flex: 1;
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.9rem;
}

.remove-btn {
  color: rgba(0, 0, 0, 0.3);
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  color: rgba(220, 53, 69, 0.8);
  background: rgba(220, 53, 69, 0.1);
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 28px;
  box-shadow: var(--shadow-lg);
  transition: var(--transition-slow);
  padding: 4px var(--spacing-xl);
}

.search-input :deep(.el-input__wrapper):hover {
  background: var(--input-hover-bg);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-xl);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: var(--input-focus-bg);
  border-color: var(--input-focus-border);
  box-shadow: var(--shadow-xl);
}

.search-input :deep(.el-input__inner) {
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 12px 0;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.65);
  font-weight: 400;
}

.search-input :deep(.el-input__prefix-inner) {
  color: rgba(255, 255, 255, 0.7);
}

.search-input :deep(.el-input-group__append) {
  background: rgba(255, 255, 255, 0.1);
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.search-button {
  background: transparent !important;
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.search-button:hover:not(:disabled) {
  color: white;
  background: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.search-button:disabled {
  color: rgba(255, 255, 255, 0.3);
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* 覆盖Element Plus按钮的所有可能状态 */
.search-input :deep(.el-button),
.search-input :deep(.el-button:focus),
.search-input :deep(.el-button:active),
.search-input :deep(.el-button:hover),
.search-input :deep(.el-button::before),
.search-input :deep(.el-button::after),
.search-input :deep(.el-input-group__append .el-button),
.search-input :deep(.el-input-group__append),
.search-input :deep(*) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 强制覆盖所有可能的边框样式 */
.search-input :deep(*),
.search-input :deep(*:before),
.search-input :deep(*:after) {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}

/* 最高优先级覆盖 - 针对Element Plus按钮 */
.search-input :deep(.el-input-group__append .el-button.el-button--default) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.search-input :deep(.el-input-group__append .el-button.el-button--default:hover),
.search-input :deep(.el-input-group__append .el-button.el-button--default:focus),
.search-input :deep(.el-input-group__append .el-button.el-button--default:active) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: rgba(255, 255, 255, 0.1) !important;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 var(--spacing-lg);
    height: 70px;
  }
  
  .navbar-content {
    gap: var(--spacing-lg);
  }
  
  .brand-title {
    font-size: 1.3rem;
  }
  
  .brand-subtitle {
    font-size: 0.7rem;
  }
  
  .navbar-search {
    max-width: 280px;
    min-width: 200px;
  }
  

}

@media (max-width: 480px) {
  .navbar {
    padding: 0 var(--spacing-md);
    height: 65px;
  }
  
  .navbar-content {
    gap: var(--spacing-md);
  }
  
  .navbar-brand {
    min-width: 80px;
  }
  
  .brand-title {
    font-size: 1.1rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .navbar-search {
    max-width: 160px;
    min-width: 120px;
  }
  
  .navbar-actions {
    gap: var(--spacing-sm);
    min-width: 100px;
  }
  
  .theme-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.8rem;
  }
  
  .settings-button {
    width: 40px;
    height: 40px;
  }
}
</style>