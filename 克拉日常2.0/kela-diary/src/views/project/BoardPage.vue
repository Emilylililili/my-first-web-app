<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ElMessage, 
  ElMessageBox, 
  ElButton, 
  ElDialog, 
  ElForm, 
  ElFormItem, 
  ElInput, 
  ElDatePicker, 
  ElSelect, 
  ElOption, 
  ElDropdown, 
  ElDropdownMenu, 
  ElDropdownItem, 
  ElIcon, 
  ElLoading 
} from 'element-plus'
import {
    ArrowLeft,
    Plus,
    Edit,
    Delete,
    Calendar,
    Flag,
    Document,
    Close,
    Share
  } from '@element-plus/icons-vue'
import VueDraggable from 'vuedraggable'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import { useBoardsStore } from '../../stores/boards'
import type { List, Card, Label } from '../../stores/boards'
import ProgressBar from '../../components/ProgressBar.vue'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const boardsStore = useBoardsStore()
const { boards, currentBoard, isLoading, error, predefinedLabels } = storeToRefs(boardsStore)

// 直接使用 boardsStore 调用方法

// 响应式数据
const showCreateListDialog = ref(false)
const showCreateCardDialog = ref(false)
const showEditCardDialog = ref(false)
const showEditListDialog = ref(false)
const showInviteDialog = ref(false)
const showCardDetailDialog = ref(false)
const newListTitle = ref('')
const newCardTitle = ref('')
const selectedListId = ref('')
const editingCard = ref<Card | null>(null)
const editingList = ref<List | null>(null)
const editListTitle = ref('')
const inviteEmail = ref('')

// 团队成员数据
const teamMembers = ref([
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  }
])

// 编辑卡片表单
const cardForm = ref({
  title: '',
  description: '',
  due_date: '',
  priority: '' as 'low' | 'medium' | 'high' | '',
  labels: [] as Label[]
})

// 计算属性
const lists = computed(() => currentBoard.value?.lists || [])

// 计算当前看板的进度
const boardProgress = computed(() => {
  if (!currentBoard.value) return null
  return boardsStore.getBoardProgress(currentBoard.value.id)
})

// 优先级选项
const priorityOptions = [
  { label: '低', value: 'low', color: '#67c23a' },
  { label: '中', value: 'medium', color: '#e6a23c' },
  { label: '高', value: 'high', color: '#f56c6c' }
]

// 获取优先级显示信息
const getPriorityInfo = (priority?: string) => {
  return priorityOptions.find(p => p.value === priority) || { label: '', color: '#909399' }
}

// 可用标签（排除已选择的）
const availableLabels = computed(() => {
  if (!predefinedLabels.value) return []
  const selectedLabelIds = cardForm.value.labels.map(label => label.id)
  return predefinedLabels.value.filter(label => !selectedLabelIds.includes(label.id))
})

// 添加标签
const addLabel = (label: Label) => {
  if (!cardForm.value.labels.find(l => l.id === label.id)) {
    cardForm.value.labels.push(label)
  }
}

// 移除标签
const removeLabel = (label: Label) => {
  const index = cardForm.value.labels.findIndex(l => l.id === label.id)
  if (index > -1) {
    cardForm.value.labels.splice(index, 1)
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 返回仪表盘
const goBack = () => {
  router.push('/dashboard')
}

// 创建新列表
const createList = async () => {
  if (!newListTitle.value.trim()) {
    ElMessage.warning('请输入列表标题')
    return
  }
  
  if (!currentBoard.value) {
    ElMessage.error('看板不存在')
    return
  }
  
  const result = await boardsStore.createList(currentBoard.value.id, newListTitle.value.trim())
  
  if (result.success) {
    ElMessage.success('列表创建成功！')
    showCreateListDialog.value = false
    newListTitle.value = ''
  } else {
    ElMessage.error(result.error || '创建列表失败')
  }
}

// 打开创建卡片对话框
const openCreateCardDialog = (listId: string) => {
  selectedListId.value = listId
  showCreateCardDialog.value = true
}

// 创建新卡片
const createCard = async () => {
  if (!newCardTitle.value.trim()) {
    ElMessage.warning('请输入卡片标题')
    return
  }
  
  const result = await boardsStore.createCard(selectedListId.value, newCardTitle.value.trim())
  
  if (result.success) {
    
    ElMessage.success('卡片创建成功！')
    showCreateCardDialog.value = false
    newCardTitle.value = ''
    selectedListId.value = ''
  } else {
    ElMessage.error(result.error || '创建卡片失败')
  }
}

// 打开编辑列表对话框
const openEditListDialog = (list: List) => {
  editingList.value = list
  editListTitle.value = list.title
  showEditListDialog.value = true
}

// 更新列表
const updateList = async () => {
  if (!editingList.value) return
  
  if (!editListTitle.value.trim()) {
    ElMessage.warning('请输入列表标题')
    return
  }
  
  const result = await boardsStore.updateList(editingList.value.id, {
    title: editListTitle.value.trim()
  })
  
  if (result.success) {
    ElMessage.success('列表更新成功！')
    showEditListDialog.value = false
    editingList.value = null
  } else {
    ElMessage.error(result.error || '更新列表失败')
  }
}

// 删除列表
const deleteList = async (list: List) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除列表"${list.title}"吗？这将同时删除列表中的所有卡片。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await boardsStore.deleteList(list.id)
    
    if (result.success) {
      ElMessage.success('列表删除成功！')
    } else {
      ElMessage.error(result.error || '删除列表失败')
    }
  } catch {
    // 用户取消
  }
}

// 打开任务详情弹窗
const openCardDetailDialog = (card: Card) => {
  editingCard.value = card
  cardForm.value = {
    title: card.title,
    description: card.description || '',
    due_date: card.due_date || '',
    priority: card.priority || '',
    labels: card.labels ? [...card.labels] : []
  }
  showCardDetailDialog.value = true
}

// 打开编辑卡片对话框
const openEditCardDialog = (card: Card) => {
  editingCard.value = card
  cardForm.value = {
    title: card.title,
    description: card.description || '',
    due_date: card.due_date || '',
    priority: card.priority || '',
    labels: card.labels ? [...card.labels] : []
  }
  showEditCardDialog.value = true
}

// 更新卡片
const updateCard = async () => {
  if (!editingCard.value) return
  
  if (!cardForm.value.title.trim()) {
    ElMessage.warning('请输入卡片标题')
    return
  }
  
  const updates = {
    title: cardForm.value.title.trim(),
    description: cardForm.value.description.trim() || undefined,
    due_date: cardForm.value.due_date || undefined,
    priority: cardForm.value.priority || undefined,
    labels: cardForm.value.labels
  }
  
  const result = await boardsStore.updateCard(editingCard.value.id, updates)
  
  if (result.success) {
    ElMessage.success('卡片更新成功！')
    showEditCardDialog.value = false
    editingCard.value = null
  } else {
    ElMessage.error(result.error || '更新卡片失败')
  }
}

// 删除卡片
const deleteCard = async (card: Card) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除卡片"${card.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await boardsStore.deleteCard(card.id)
    
    if (result.success) {
      ElMessage.success('卡片删除成功！')
      // 如果删除的是当前正在编辑的卡片，关闭编辑对话框
      if (editingCard.value && editingCard.value.id === card.id) {
        showEditCardDialog.value = false
        editingCard.value = null
      }
    } else {
      ElMessage.error(result.error || '删除卡片失败')
    }
  } catch {
    // 用户取消
  }
}

// 拖拽结束处理
const onCardDragEnd = async (evt: { newIndex: number; oldIndex: number; to: Element; from: Element }, listId: string) => {
  const { newIndex, oldIndex, to, from } = evt
  
  // 如果在同一个列表内移动
  if (to === from) {
    return // 位置已经在前端更新了
  }
  
  // 获取被移动的卡片
  const targetList = lists.value.find(list => list.id === listId)
  if (!targetList || !targetList.cards[newIndex]) {
    return
  }
  
  const movedCard = targetList.cards[newIndex]
  
  // 调用后端API更新卡片位置
  const result = await boardsStore.moveCard(movedCard.id, listId, newIndex)
  
  if (!result.success) {
    ElMessage.error(result.error || '移动卡片失败')
    // 这里可以考虑回滚操作
  }
}

// 分享看板
const shareBoard = () => {
  const shareUrl = `${window.location.origin}/board/${props.id}`
  navigator.clipboard.writeText(shareUrl).then(() => {
    ElMessage.success('看板链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制链接')
  })
}

// 邀请团队成员
const inviteTeamMember = async () => {
  if (!inviteEmail.value.trim()) {
    ElMessage.warning('请输入邮箱地址')
    return
  }
  
  // 这里应该调用后端API邀请成员
  // const result = await boardsStore.inviteMember(props.id, inviteEmail.value)
  
  // 模拟邀请成功
  ElMessage.success(`邀请已发送到 ${inviteEmail.value}`)
  showInviteDialog.value = false
  inviteEmail.value = ''
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
  
  // 获取看板详情
  const result = await boardsStore.fetchBoard(props.id)
  
  if (!result.success) {
    ElMessage.error(result.error || '获取看板详情失败')
    router.push('/dashboard')
  }
})
</script>

<template>
  <div class="board-container">
    <!-- 头部区域 -->
    <div class="board-header">
      <div class="header-content">
        <div class="header-left">
          <el-button
            :icon="ArrowLeft"
            @click="goBack"
            class="back-button"
            size="large"
          >
            返回
          </el-button>
          
          <div class="board-info">
            <h1 class="board-title">{{ currentBoard?.title || '加载中...' }}</h1>
            <p class="board-subtitle">管理您的项目任务</p>
          </div>
        </div>
        
        <div class="header-actions">
          <!-- 团队成员协作区域 -->
          <div class="team-collaboration">
            <!-- 成员头像列表 -->
            <div class="team-members">
              <el-tooltip
                v-for="member in teamMembers"
                :key="member.id"
                :content="member.name"
                placement="bottom"
              >
                <el-avatar
                  :size="32"
                  :src="member.avatar"
                  class="member-avatar"
                >
                  {{ member.name.charAt(0) }}
                </el-avatar>
              </el-tooltip>
              
              <!-- 邀请新成员按钮 -->
              <el-tooltip content="邀请团队成员" placement="bottom">
                <el-button
                  :icon="Plus"
                  circle
                  size="small"
                  class="invite-button"
                  @click="showInviteDialog = true"
                >
                </el-button>
              </el-tooltip>
            </div>
            
            <!-- 分享按钮 -->
            <el-button
              :icon="Share"
              type="primary"
              size="default"
              @click="shareBoard"
            >
              分享
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 项目进度条 -->
      <div v-if="boardProgress && boardProgress.totalTasks > 0" class="board-progress-section">
        <ProgressBar
          :value="boardProgress.percentage"
          :completed-tasks="boardProgress.completedTasks"
          :total-tasks="boardProgress.totalTasks"
          :label="`${boardProgress.boardTitle} - 项目进度`"
          :show-value="true"
          :show-percentage="true"
          :animated="true"
          height="24px"
          border-radius="12px"
        />
      </div>
    </div>
    
    <!-- 看板内容 -->
    <div class="board-content">
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="!currentBoard" class="error-state">
        <h3>看板不存在</h3>
        <p>请检查看板ID是否正确</p>
      </div>
      
      <div v-else class="lists-container">
        <div
          v-for="list in lists"
          :key="list.id"
          class="list-column"
        >
          <div class="list-header">
            <h3 class="list-title">{{ list.title }}</h3>
            <div class="list-header-actions">
              <span class="card-count">{{ list.cards.length }}</span>
              <el-dropdown trigger="click">
                <el-button type="text" size="small" class="list-menu">
                  ⋯
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openEditListDialog(list)">
                      <el-icon><Edit /></el-icon>
                      编辑列表
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteList(list)" class="danger">
                      <el-icon><Delete /></el-icon>
                      删除列表
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="cards-container">
            <VueDraggable
              v-model="list.cards"
              group="cards"
              @end="(evt: any) => onCardDragEnd(evt, list.id)"
              item-key="id"
              class="draggable-cards"
              :animation="150"
              :easing="'cubic-bezier(0.25, 0.46, 0.45, 0.94)'"
              ghost-class="card-ghost"
              chosen-class="card-chosen"
              drag-class="card-drag"
              :force-fallback="false"
              :fallback-tolerance="3"
              :scroll-sensitivity="100"
              :scroll-speed="20"
            >
              <template #item="{ element: card }">
                <div
                    class="task-card"
                    @click="openCardDetailDialog(card)"
                  >
                  <!-- 标签区域 -->
                  <div v-if="card.labels && card.labels.length > 0" class="card-labels">
                    <span 
                      v-for="label in card.labels" 
                      :key="label.id"
                      class="card-label"
                      :style="{ backgroundColor: label.color }"
                    >
                      {{ label.name }}
                    </span>
                  </div>
                  
                  <div class="card-header">
                    <h4 class="card-title">{{ card.title }}</h4>
                    <el-dropdown trigger="click" @click.stop>
                      <el-button type="text" size="small" class="card-menu">
                        ⋯
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="openEditCardDialog(card)">
                            <el-icon><Edit /></el-icon>
                            编辑
                          </el-dropdown-item>
                          <el-dropdown-item @click="deleteCard(card)" class="danger">
                            <el-icon><Delete /></el-icon>
                            删除
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                  
                  <div v-if="card.description" class="card-description">
                    {{ card.description }}
                  </div>
                  
                  <div class="card-footer">
                    <div class="card-meta">
                      <span v-if="card.due_date" class="card-date">
                        <el-icon><Calendar /></el-icon>
                        {{ formatDate(card.due_date) }}
                      </span>
                      
                      <span v-if="card.priority" class="card-priority">
                        <el-icon><Flag /></el-icon>
                        <span 
                          class="priority-dot"
                          :style="{ backgroundColor: getPriorityInfo(card.priority).color }"
                        ></span>
                        {{ getPriorityInfo(card.priority).label }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </VueDraggable>
          </div>
          
          <!-- 添加卡片按钮 -->
          <div class="add-card-section">
            <el-button
              class="add-card-button"
              @click="openCreateCardDialog(list.id)"
              type="default"
              :icon="Plus"
            >
              添加卡片
            </el-button>
          </div>
        </div>
        
        <!-- 添加新列表 -->
        <div class="add-list-column">
          <el-button
            class="add-list-button"
            @click="showCreateListDialog = true"
            type="default"
          >
            <el-icon><Plus /></el-icon>
            添加另一个列表
          </el-button>
        </div>
        
        <!-- 空状态 -->
        <div v-if="lists.length === 0" class="empty-lists">
          <div class="empty-icon">
            <el-icon><Document /></el-icon>
          </div>
          <h3>还没有列表</h3>
          <p>创建您的第一个列表来开始管理任务</p>
          <el-button
            type="primary"
            :icon="Plus"
            @click="showCreateListDialog = true"
          >
            创建列表
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 创建列表对话框 -->
    <el-dialog
      v-model="showCreateListDialog"
      title="创建新列表"
      width="400px"
    >
      <el-form @submit.prevent="createList">
        <el-form-item label="列表标题" required>
          <el-input
            v-model="newListTitle"
            placeholder="请输入列表标题"
            maxlength="50"
            show-word-limit
            @keyup.enter="createList"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateListDialog = false; newListTitle = ''">取消</el-button>
          <el-button
            type="primary"
            @click="createList"
            :loading="isLoading"
          >
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 创建卡片对话框 -->
    <el-dialog
      v-model="showCreateCardDialog"
      title="创建新卡片"
      width="400px"
    >
      <el-form @submit.prevent="createCard">
        <el-form-item label="卡片标题" required>
          <el-input
            v-model="newCardTitle"
            placeholder="请输入卡片标题"
            maxlength="100"
            show-word-limit
            @keyup.enter="createCard"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateCardDialog = false; newCardTitle = ''; selectedListId = ''">取消</el-button>
          <el-button
            type="primary"
            @click="createCard"
            :loading="isLoading"
          >
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 编辑列表对话框 -->
    <el-dialog
      v-model="showEditListDialog"
      title="编辑列表"
      width="400px"
    >
      <el-form @submit.prevent="updateList">
        <el-form-item label="列表标题" required>
          <el-input
            v-model="editListTitle"
            placeholder="请输入列表标题"
            maxlength="50"
            show-word-limit
            @keyup.enter="updateList"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditListDialog = false; editingList = null">取消</el-button>
          <el-button
            type="primary"
            @click="updateList"
            :loading="isLoading"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 编辑卡片对话框 -->
    <el-dialog
      v-model="showEditCardDialog"
      title="编辑卡片"
      width="500px"
    >
      <el-form :model="cardForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input
            v-model="cardForm.title"
            placeholder="请输入卡片标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="cardForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入卡片描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="cardForm.due_date"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select
            v-model="cardForm.priority"
            placeholder="选择优先级"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="option in priorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <div class="priority-option">
                <span 
                  class="priority-dot"
                  :style="{ backgroundColor: option.color }"
                ></span>
                {{ option.label }}
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签">
          <div class="label-selector">
            <div class="selected-labels">
              <span 
                v-for="label in cardForm.labels" 
                :key="label.id"
                class="selected-label"
                :style="{ backgroundColor: label.color }"
                @click="removeLabel(label)"
              >
                {{ label.name }}
                <el-icon class="remove-icon"><Close /></el-icon>
              </span>
            </div>
            <el-dropdown trigger="click" @click.stop>
              <el-button size="small" type="default">
                <el-icon><Plus /></el-icon>
                添加标签
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="label in availableLabels" 
                    :key="label.id"
                    @click="addLabel(label)"
                  >
                    <div class="label-option">
                      <span 
                        class="label-color"
                        :style="{ backgroundColor: label.color }"
                      ></span>
                      {{ label.name }}
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditCardDialog = false; editingCard = null">取消</el-button>
          <el-button
            type="primary"
            @click="updateCard"
            :loading="isLoading"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 邀请团队成员对话框 -->
    <el-dialog
      v-model="showInviteDialog"
      title="邀请团队成员"
      width="400px"
    >
      <el-form @submit.prevent="inviteTeamMember">
        <el-form-item label="邮箱地址" required>
          <el-input
            v-model="inviteEmail"
            placeholder="请输入成员邮箱地址"
            type="email"
            @keyup.enter="inviteTeamMember"
          />
        </el-form-item>
        <el-form-item>
          <div class="invite-info">
            <p>被邀请的成员将收到邮件通知，并可以访问此看板。</p>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showInviteDialog = false; inviteEmail = ''">取消</el-button>
          <el-button
            type="primary"
            @click="inviteTeamMember"
            :loading="isLoading"
          >
            发送邀请
          </el-button>
        </div>
      </template>
     </el-dialog>
     
     <!-- 任务详情弹窗 -->
     <el-dialog
       v-model="showCardDetailDialog"
       :title="editingCard?.title || '任务详情'"
       width="600px"
       class="card-detail-dialog"
     >
       <div class="card-detail-content">
         <!-- 标签区域 -->
         <div v-if="editingCard?.labels && editingCard.labels.length > 0" class="detail-labels">
           <span 
             v-for="label in editingCard.labels" 
             :key="label.id"
             class="detail-label"
             :style="{ backgroundColor: label.color }"
           >
             {{ label.name }}
           </span>
         </div>
         
         <!-- 任务信息 -->
         <div class="task-info">
           <div class="info-row">
             <div class="info-label">
               <el-icon><Calendar /></el-icon>
               创建时间
             </div>
             <div class="info-value">
               {{ formatDate(editingCard?.created_at) }}
             </div>
           </div>
           
           <div v-if="editingCard?.due_date" class="info-row">
             <div class="info-label">
               <el-icon><Calendar /></el-icon>
               截止日期
             </div>
             <div class="info-value">
               {{ formatDate(editingCard.due_date) }}
             </div>
           </div>
           
           <div v-if="editingCard?.priority" class="info-row">
             <div class="info-label">
               <el-icon><Flag /></el-icon>
               优先级
             </div>
             <div class="info-value">
               <span 
                 class="priority-badge"
                 :class="`priority-${editingCard.priority}`"
               >
                 {{ priorityOptions.find(p => p.value === editingCard?.priority)?.label }}
               </span>
             </div>
           </div>
         </div>
         
         <!-- 任务描述 -->
         <div v-if="editingCard?.description" class="task-description">
           <h4>描述</h4>
           <p>{{ editingCard.description }}</p>
         </div>
         
         <!-- 活动记录 -->
         <div class="task-activity">
           <h4>活动记录</h4>
           <div class="activity-list">
             <div class="activity-item">
               <el-avatar :size="24" class="activity-avatar">
                 {{ teamMembers[0]?.name.charAt(0) }}
               </el-avatar>
               <div class="activity-content">
                 <span class="activity-user">{{ teamMembers[0]?.name }}</span>
                 <span class="activity-action">创建了这个任务</span>
                 <span class="activity-time">{{ formatDate(editingCard?.created_at) }}</span>
               </div>
             </div>
           </div>
         </div>
       </div>
       
       <template #footer>
         <div class="dialog-footer">
           <el-button @click="showCardDetailDialog = false">关闭</el-button>
           <el-button
             type="primary"
             @click="showCardDetailDialog = false; openEditCardDialog(editingCard!)"
           >
             编辑任务
           </el-button>
         </div>
       </template>
     </el-dialog>
   </div>
 </template>

<style scoped>
.board-container {
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.board-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: white;
  padding: 16px 0;
  margin: 20px 24px 0 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.board-progress-section {
  margin: 20px 24px 24px 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 3px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: none;
}

.board-info {
  flex: 1;
}

.board-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.board-subtitle {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.board-content {
  padding: 12px;
  max-width: 100%;
  margin: 0;
  flex: 1;
  overflow: hidden;
}

.loading-container {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.error-state {
  text-align: center;
  padding: 60px 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.lists-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 4px 8px 4px;
  height: calc(100vh - 80px);
  align-items: flex-start;
}

.list-column {
  flex: 0 0 272px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  margin: 0 4px;
}

.list-header {
  padding: 10px 8px;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border-radius: 0;
  min-height: 20px;
}

.list-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-menu {
   color: rgba(255, 255, 255, 0.7);
   padding: 4px;
   font-size: 16px;
   line-height: 1;
 }
 
 .danger {
   color: #f56c6c !important;
 }
 
 .danger:hover {
   background-color: #fef0f0 !important;
   color: #f56c6c !important;
 }

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.list-title:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.card-count {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  min-width: 20px;
  text-align: center;
}

.cards-container {
  flex: 1;
  padding: 0 8px 8px 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.draggable-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 8px;
}

.task-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
}

.task-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin: 0;
  flex: 1;
  line-height: 1.3;
  word-wrap: break-word;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card-menu {
  color: rgba(255, 255, 255, 0.6);
  padding: 2px;
  font-size: 14px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .card-menu {
    opacity: 1;
  }
  
  /* 标签样式 */
  .card-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 6px;
  }
  
  .card-label {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }
  
  .card-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
  margin-bottom: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 8px;
}

.card-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.card-date,
.card-priority {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

/* 标签选择器样式 */
.label-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
}

.selected-label {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-label:hover {
  opacity: 0.8;
  transform: scale(0.95);
}

.remove-icon {
  margin-left: 4px;
  font-size: 10px;
}

.label-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.add-card-section {
  padding: 2px 8px 8px 8px;
  border-top: none;
}

.add-card-button {
  width: 100%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-card-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.empty-lists {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
  font-size: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.danger {
  color: #f56c6c;
}

/* 拖拽样式 */
.card-ghost {
  opacity: 0.5;
  background: #dfe1e6;
  transform: rotate(5deg);
}

.card-chosen {
  background: #f4f5f7;
  box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25);
}

.card-drag {
  transform: rotate(5deg);
  opacity: 0.9;
  box-shadow: 0 8px 16px rgba(9, 30, 66, 0.25);
  z-index: 1000;
}

/* 列表拖拽样式 */
  .list-ghost {
    opacity: 0.5;
    background: #dfe1e6;
  }
  
  .list-chosen {
    background: #f4f5f7;
  }
  
  .list-drag {
    opacity: 0.9;
    transform: rotate(2deg);
  }
  
  /* 添加列表按钮 */
  .add-list-column {
    flex: 0 0 272px;
    margin: 0 4px;
    display: flex;
    align-items: flex-start;
  }
  
  .add-list-button {
    width: 100%;
    background: rgba(255, 255, 255, 0.24);
    border: none;
    color: white;
    border-radius: 3px;
    padding: 12px;
    font-size: 14px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
  }
  
  .add-list-button:hover {
    background: rgba(255, 255, 255, 0.32);
    color: white;
  }

.task-card {
  cursor: grab;
}

.task-card:active {
  cursor: grabbing;
}

/* 团队协作样式 */
.team-collaboration {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-members {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
}

.member-avatar:hover {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.1);
}

.invite-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.4);
  color: white;
  transition: all 0.2s ease;
}

.invite-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
}

.invite-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.invite-info p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
  }
  
  /* 任务详情弹窗样式 */
  .card-detail-dialog .el-dialog__body {
    padding: 20px;
  }
  
  .card-detail-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .detail-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .detail-label {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  }
  
  .task-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .info-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    color: #606266;
    min-width: 100px;
  }
  
  .info-value {
    color: #303133;
  }
  
  .priority-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .priority-badge.priority-high {
    background: #f56c6c;
    color: white;
  }
  
  .priority-badge.priority-medium {
    background: #e6a23c;
    color: white;
  }
  
  .priority-badge.priority-low {
    background: #67c23a;
    color: white;
  }
  
  .task-description {
    border-top: 1px solid #ebeef5;
    padding-top: 16px;
  }
  
  .task-description h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  
  .task-description p {
    margin: 0;
    line-height: 1.6;
    color: #606266;
  }
  
  .task-activity {
    border-top: 1px solid #ebeef5;
    padding-top: 16px;
  }
  
  .task-activity h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  
  .activity-avatar {
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .activity-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .activity-user {
    font-weight: 500;
    color: #303133;
  }
  
  .activity-action {
    color: #606266;
    font-size: 14px;
  }
  
  .activity-time {
    color: #909399;
    font-size: 12px;
  }

/* 响应式设计 */
@media (max-width: 1200px) {
  .lists-container {
    gap: 12px;
  }
  
  .list-column {
    flex: 0 0 260px;
  }
}

@media (max-width: 992px) {
  .board-content {
    padding: 16px;
  }
  
  .header-content {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .team-collaboration {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .team-members {
    justify-content: flex-start;
  }
  
  .lists-container {
    gap: 10px;
  }
  
  .list-column {
    flex: 0 0 240px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-left {
    width: 100%;
    justify-content: space-between;
  }
  
  .board-info {
    text-align: center;
  }
  
  .board-title {
    font-size: 20px;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .team-collaboration {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .team-members {
    justify-content: center;
  }
  
  .board-progress-section {
    margin: 0 16px 20px 16px;
    padding: 16px;
  }
  
  .lists-container {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .list-column {
    flex: none;
    max-height: none;
    width: 100%;
    max-width: 400px;
  }
  
  .list-header {
    padding: 12px 10px;
  }
  
  .list-title {
    font-size: 14px;
  }
  
  .task-card {
    padding: 10px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-description {
    font-size: 12px;
  }
  
  .card-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .card-labels {
    flex-wrap: wrap;
  }
  
  .card-label {
    font-size: 11px;
    padding: 2px 6px;
  }
  
  .board-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .board-header {
    padding: 12px 0;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .board-title {
    font-size: 18px;
  }
  
  .board-subtitle {
    font-size: 12px;
  }
  
  .member-avatar {
    width: 28px !important;
    height: 28px !important;
    font-size: 11px;
  }
  
  .invite-button {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .list-column {
    margin: 0;
    max-width: 100%;
  }
  
  .list-header {
    padding: 10px 8px;
  }
  
  .list-title {
    font-size: 13px;
  }
  
  .task-card {
    padding: 8px;
  }
  
  .card-title {
    font-size: 13px;
  }
  
  .card-description {
    font-size: 11px;
  }
  
  .priority-dot {
    width: 5px;
    height: 5px;
  }
  
  .card-label {
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .board-content {
    padding: 12px;
  }
  
  /* 弹窗响应式 */
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
  }
  
  .card-detail-dialog :deep(.el-dialog__body) {
    padding: 15px;
  }
  
  .detail-labels {
    gap: 6px;
  }
  
  .detail-label {
    font-size: 10px;
    padding: 3px 8px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .info-label {
    min-width: auto;
    font-size: 13px;
  }
  
  .activity-item {
    gap: 8px;
  }
  
  .activity-avatar {
    width: 24px !important;
    height: 24px !important;
    font-size: 10px;
  }
}
</style>