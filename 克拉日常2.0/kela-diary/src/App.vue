<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import SplineBackground from './components/SplineBackground.vue'
import ThemeSettings from './components/ThemeSettings.vue'
import { useThemeStore } from './stores/theme'
import { useNotesStore } from './stores/notes'
import { useTodosStore } from './stores/todos'
import { useAuthStore } from './stores/auth'
import { useBoardsStore } from './stores/boards'

// 初始化stores
const themeStore = useThemeStore()
const notesStore = useNotesStore()
const todosStore = useTodosStore()
const authStore = useAuthStore()
const boardsStore = useBoardsStore()



onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  
  // 初始化数据
  notesStore.initNotes()
  todosStore.initTodos()
  
  // 初始化认证状态
  authStore.initAuth()
  
  // 初始化看板数据
  boardsStore.initBoards()
})
</script>

<template>
  <div class="app-container">
    <!-- Spline 3D背景 -->
    <SplineBackground />
    
    <!-- 主导航栏 -->
    <Navbar />
    
    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <Sidebar />
      
      <!-- 内容区域 -->
      <main class="content-area">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
    
    <!-- 主题设置入口统一由导航栏按钮触发 -->
    <!-- 移除此处重复入口，避免出现多个设置按钮 -->
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
  position: relative;
}

/* 动态背景样式 */
.app-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transition: all 0.5s ease;
}

/* 星空主题 */
.background-starry {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  animation: starryNight 20s ease-in-out infinite alternate;
}

@keyframes starryNight {
  0% { background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%); }
  100% { background: linear-gradient(135deg, #16213e 0%, #1a1a2e 50%, #0c0c0c 100%); }
}

/* 宇宙主题 */
.background-universe {
  background: linear-gradient(45deg, #2c1810 0%, #8b4513 25%, #4b0082 50%, #191970 75%, #000000 100%);
  animation: universeFlow 25s ease-in-out infinite alternate;
}

@keyframes universeFlow {
  0% { background: linear-gradient(45deg, #2c1810 0%, #8b4513 25%, #4b0082 50%, #191970 75%, #000000 100%); }
  100% { background: linear-gradient(225deg, #000000 0%, #191970 25%, #4b0082 50%, #8b4513 75%, #2c1810 100%); }
}

/* 蓝天白云主题 */
.background-bluesky {
  background: linear-gradient(to bottom, #87ceeb 0%, #98d8e8 50%, #b0e0e6 100%);
  animation: skyMovement 30s ease-in-out infinite alternate;
}

@keyframes skyMovement {
  0% { background: linear-gradient(to bottom, #87ceeb 0%, #98d8e8 50%, #b0e0e6 100%); }
  100% { background: linear-gradient(to bottom, #b0e0e6 0%, #98d8e8 50%, #87ceeb 100%); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    order: 2;
  }
  
  .content-area {
    margin-left: 0;
    padding: 16px;
    order: 1;
  }
  
  .navbar {
    padding: 0 12px;
  }
  
  .navbar-content {
    gap: 12px;
  }
  
  .brand-title {
    font-size: 1.2rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .search-input {
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .navbar {
    height: 60px;
    padding: 0 8px;
  }
  
  .content-area {
    padding: 12px;
    margin-top: 60px;
  }
  
  .brand-title {
    font-size: 1rem;
  }
  
  .search-input {
    max-width: 150px;
  }
  
  .theme-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .settings-button {
    width: 40px;
    height: 40px;
  }
}

/* 云朵主题 */
.background-clouds {
  background: linear-gradient(to bottom, #f0f8ff 0%, #e6f3ff 50%, #ddeeff 100%);
  animation: cloudDrift 35s ease-in-out infinite alternate;
}

@keyframes cloudDrift {
  0% { background: linear-gradient(to bottom, #f0f8ff 0%, #e6f3ff 50%, #ddeeff 100%); }
  100% { background: linear-gradient(to bottom, #ddeeff 0%, #e6f3ff 50%, #f0f8ff 100%); }
}

/* 主容器布局 */
.main-container {
  display: flex;
  min-height: calc(100vh - 75px); /* 减去导航栏高度 */
  margin-top: 75px;
  gap: 0;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: var(--spacing-3xl);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-xl);
  margin: var(--spacing-xl);
  margin-left: var(--spacing-lg);
  box-shadow: var(--card-shadow);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: var(--transition-slow);
  position: relative;
  overflow: hidden;
}

.content-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--border-hover) 50%, transparent 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    margin-top: 75px;
  }
  
  .content-area {
    margin: 16px;
    padding: 24px;
    border-radius: 16px;
  }
}

@media (max-width: 480px) {
  .content-area {
    margin: 12px;
    padding: 20px;
    border-radius: 12px;
  }
}
</style>
