<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Calendar, User, TrendCharts, ArrowRight } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { useBoardsStore } from '../../stores/boards'
import type { Board } from '../../stores/boards'

const router = useRouter()
const authStore = useAuthStore()
const boardsStore = useBoardsStore()

// 新建看板对话框
const showCreateDialog = ref(false)
const newBoardTitle = ref('')

// 计算属性
const user = computed(() => authStore.user)
const boards = computed(() => boardsStore.boards)
const isLoading = computed(() => boardsStore.isLoading)

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 获取看板统计信息
const getBoardStats = (board: Board) => {
  const totalLists = board.lists.length
  const totalCards = board.lists.reduce((sum, list) => sum + list.cards.length, 0)
  return { totalLists, totalCards }
}

// 创建新看板
const createBoard = async () => {
  if (!newBoardTitle.value.trim()) {
    ElMessage.warning('请输入看板标题')
    return
  }
  
  const result = await boardsStore.createBoard(newBoardTitle.value.trim())
  
  if (result.success) {
    ElMessage.success('看板创建成功！')
    showCreateDialog.value = false
    newBoardTitle.value = ''
  } else {
    ElMessage.error(result.error || '创建看板失败')
  }
}

// 打开看板
const openBoard = (boardId: string) => {
  router.push(`/board/${boardId}`)
}

// 统计卡片点击事件
const showBoardsDetail = () => {
  ElMessage.info(`您共有 ${boards.value.length} 个看板`)
  // 可以在这里添加更详细的看板信息展示
}

const showListsDetail = () => {
  const totalLists = boards.value.reduce((sum, board) => sum + board.lists.length, 0)
  ElMessage.info(`您共有 ${totalLists} 个列表`)
  // 可以在这里添加更详细的列表信息展示
}

const showCardsDetail = () => {
  const totalCards = boards.value.reduce((sum, board) => 
    sum + board.lists.reduce((listSum, list) => listSum + list.cards.length, 0), 0
  )
  ElMessage.info(`您共有 ${totalCards} 个任务`)
  // 可以在这里添加更详细的任务信息展示
}

// 登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '确认退出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

// 页面初始化
onMounted(async () => {
  // 检查登录状态
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  // 初始化看板数据
  boardsStore.initBoards()
  await boardsStore.fetchBoards()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 头部区域 -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1 class="welcome-title">
            <el-icon class="title-icon"><User /></el-icon>
            欢迎回来，{{ user?.username }}！
          </h1>
          <p class="welcome-subtitle">管理您的项目看板，让工作更高效</p>
        </div>
        
        <div class="header-actions">
          <el-button
            type="primary"
            :icon="Plus"
            @click="showCreateDialog = true"
            size="large"
            class="create-board-btn"
          >
            新建看板
          </el-button>
          
          <el-button
            @click="handleLogout"
            size="large"
            class="logout-btn"
          >
            退出登录
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card clickable" @click="showBoardsDetail">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ boards.length }}</div>
            <div class="stat-label">总看板数</div>
          </div>
        </div>
        
        <div class="stat-card clickable" @click="showListsDetail">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ boards.reduce((sum, board) => sum + board.lists.length, 0) }}
            </div>
            <div class="stat-label">总列表数</div>
          </div>
        </div>
        
        <div class="stat-card clickable" @click="showCardsDetail">
          <div class="stat-icon">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">
              {{ boards.reduce((sum, board) => 
                sum + board.lists.reduce((listSum, list) => listSum + list.cards.length, 0), 0
              ) }}
            </div>
            <div class="stat-label">总任务数</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 看板列表 -->
    <div class="boards-section">
      <div class="section-header">
        <h2 class="section-title">我的看板</h2>
      </div>
      
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="boards.length === 0" class="empty-state">
        <div class="empty-icon">
          <el-icon><Plus /></el-icon>
        </div>
        <h3 class="empty-title">还没有看板</h3>
        <p class="empty-description">创建您的第一个项目看板，开始管理任务吧！</p>
        <el-button
          type="primary"
          :icon="Plus"
          @click="showCreateDialog = true"
          size="large"
        >
          创建看板
        </el-button>
      </div>
      
      <div v-else class="boards-grid">
        <div
          v-for="board in boards"
          :key="board.id"
          class="board-card"
          @click="openBoard(board.id)"
        >
          <div class="board-header">
            <h3 class="board-title">{{ board.title }}</h3>
            <el-icon class="board-arrow"><ArrowRight /></el-icon>
          </div>
          
          <div class="board-stats">
            <div class="board-stat">
              <span class="stat-value">{{ getBoardStats(board).totalLists }}</span>
              <span class="stat-text">列表</span>
            </div>
            <div class="board-stat">
              <span class="stat-value">{{ getBoardStats(board).totalCards }}</span>
              <span class="stat-text">任务</span>
            </div>
          </div>
          
          <div class="board-footer">
            <span class="board-date">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(board.created_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建看板对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建新看板"
      width="400px"
      :before-close="() => { showCreateDialog = false; newBoardTitle = '' }"
    >
      <el-form @submit.prevent="createBoard">
        <el-form-item label="看板标题" required>
          <el-input
            v-model="newBoardTitle"
            placeholder="请输入看板标题"
            maxlength="50"
            show-word-limit
            @keyup.enter="createBoard"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false; newBoardTitle = ''">取消</el-button>
          <el-button
            type="primary"
            @click="createBoard"
            :loading="isLoading"
          >
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: transparent;
  padding: 0;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: white;
  padding: 40px 0;
  margin: 20px 24px 30px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-section {
  flex: 1;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 28px;
}

.welcome-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.create-board-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
}

.create-board-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.stats-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.stat-card.clickable {
  cursor: pointer;
  user-select: none;
}

.stat-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.stat-card.clickable:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.boards-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-container {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
  font-size: 32px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.empty-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.board-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.board-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.board-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.board-arrow {
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.board-card:hover .board-arrow {
  color: white;
  transform: translateX(4px);
}

.board-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.board-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: white;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.board-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.board-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .boards-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    padding: 30px 0;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .create-board-btn,
  .logout-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 0;
  }
  
  .header-content,
  .stats-section,
  .boards-section {
    padding: 0 16px;
  }
  
  .dashboard-header {
    padding: 20px 0;
  }
  
  .welcome-title {
    font-size: 20px;
  }
  
  .stat-card,
  .board-card {
    padding: 20px;
  }
}
</style>