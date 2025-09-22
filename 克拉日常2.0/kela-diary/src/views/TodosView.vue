<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Plus, 
  Delete, 
  Check, 
  Clock,
  Filter,
  Calendar,
  List,
  Edit
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTodosStore } from '../stores/todos'
import type { Todo, TodoFilter } from '../stores/todos'

const todosStore = useTodosStore()

// 新建待办表单数据
const newTodoTitle = ref('')
const newTodoDescription = ref('')
const newTodoPriority = ref<'low' | 'medium' | 'high'>('medium')
const newTodoDueDate = ref<string>('')
const showAddDialog = ref(false)
const loading = ref(false)

// 编辑待办表单数据
const editTodoId = ref('')
const editTodoTitle = ref('')
const editTodoDescription = ref('')
const editTodoPriority = ref<'low' | 'medium' | 'high'>('medium')
const editTodoDueDate = ref<string | undefined>()
const showEditDialog = ref(false)

// 优先级选项
const priorityOptions = [
  { value: 'low', label: '低', color: '#67c23a' },
  { value: 'medium', label: '中', color: '#e6a23c' },
  { value: 'high', label: '高', color: '#f56c6c' }
]

// 筛选选项
const filterOptions = [
  { value: 'all', label: '全部', icon: Filter },
  { value: 'active', label: '进行中', icon: Clock },
  { value: 'completed', label: '已完成', icon: Check }
]

// 筛选后的待办列表
const filteredTodos = computed(() => todosStore.filteredTodos)

// 当前筛选条件
const currentFilter = computed({
  get: () => todosStore.currentFilter,
  set: (value: TodoFilter) => todosStore.setFilter(value)
})

// 统计信息
const stats = computed(() => todosStore.todosStats)

// 添加待办
const addTodo = () => {
  if (!newTodoTitle.value.trim()) {
    ElMessage.warning('请输入待办标题')
    return
  }
  
  const newTodo = todosStore.addTodo({
    title: newTodoTitle.value.trim(),
    description: newTodoDescription.value.trim() || undefined,
    completed: false,
    priority: newTodoPriority.value,
    dueDate: newTodoDueDate.value || undefined
  })
  
  if (newTodo) {
    // 重置表单
    newTodoTitle.value = ''
    newTodoDescription.value = ''
    newTodoPriority.value = 'medium'
    newTodoDueDate.value = ''
    showAddDialog.value = false
    
    ElMessage.success('待办已添加')
  }
}

// 打开编辑对话框
const openEditDialog = (todo: Todo) => {
  editTodoId.value = todo.id
  editTodoTitle.value = todo.title
  editTodoDescription.value = todo.description || ''
  editTodoPriority.value = todo.priority
  editTodoDueDate.value = todo.dueDate
  showEditDialog.value = true
}

// 更新待办
const updateTodo = () => {
  if (!editTodoTitle.value.trim()) {
    ElMessage.warning('请输入待办标题')
    return
  }
  
  const updatedTodo = todosStore.updateTodo(editTodoId.value, {
    title: editTodoTitle.value.trim(),
    description: editTodoDescription.value.trim() || undefined,
    priority: editTodoPriority.value,
    dueDate: editTodoDueDate.value
  })
  
  if (updatedTodo) {
    showEditDialog.value = false
    ElMessage.success('待办已更新')
  } else {
    ElMessage.error('更新失败，待办不存在')
  }
}

// 切换待办完成状态
const toggleTodo = (todo: Todo) => {
  const updatedTodo = todosStore.toggleTodo(todo.id)
  if (updatedTodo) {
    ElMessage.success(updatedTodo.completed ? '待办已完成' : '待办已重新激活')
  }
}

// 删除待办
const deleteTodo = async (todo: Todo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除待办 "${todo.title}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    const deletedTodo = todosStore.deleteTodo(todo.id)
    if (deletedTodo) {
      ElMessage.success('待办已删除')
    } else {
      ElMessage.error('删除失败，待办不存在')
    }
  } catch {
    // 用户取消删除
  }
}

// 清除已完成的待办
const clearCompleted = async () => {
  const completedCount = stats.value.completed
  
  if (completedCount === 0) {
    ElMessage.info('没有已完成的待办')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要清除 ${completedCount} 个已完成的待办吗？`,
      '确认清除',
      {
        confirmButtonText: '清除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const clearedCount = todosStore.clearCompleted()
    ElMessage.success(`已清除 ${clearedCount} 个已完成的待办`)
  } catch {
    // 用户取消清除
  }
}

// 获取优先级信息
const getPriorityInfo = (priority: string) => {
  return priorityOptions.find(option => option.value === priority) || priorityOptions[1]
}

// 格式化日期
const formatDate = (date: Date | string) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    return '无效日期'
  }
  
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj)
  }
}

// 检查是否即将到期
const isOverdue = (dueDate: Date | string) => {
  if (!dueDate) return false
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  if (isNaN(dateObj.getTime())) return false
  return dateObj < new Date()
}

const isDueSoon = (dueDate: Date | string) => {
  if (!dueDate) return false
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  if (isNaN(dateObj.getTime())) return false
  
  const today = new Date()
  const diffTime = dateObj.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 3 && diffDays >= 0
}
</script>

<template>
  <div class="todos-view">
    <!-- 页面头部 -->
    <div class="todos-header">
      <div class="header-content">
        <h2 class="page-title">✅ 待办清单</h2>
        <div class="stats-summary">
          <el-tag type="info" size="large">总计: {{ stats.total }}</el-tag>
          <el-tag type="warning" size="large">进行中: {{ stats.active }}</el-tag>
          <el-tag type="success" size="large">已完成: {{ stats.completed }}</el-tag>
        </div>
      </div>
    </div>

    <!-- 新建待办 -->
    <div class="todo-creator">
      <div class="creator-container">
        <el-button 
          @click="showAddDialog = true"
          type="primary"
          size="large"
          :icon="Plus"
          class="add-todo-btn"
        >
          新建待办
        </el-button>
      </div>

      <!-- 新建待办对话框 -->
      <el-dialog
        v-model="showAddDialog"
        title="新建待办"
        width="500px"
        :before-close="() => { showAddDialog = false }"
      >
        <el-form :model="{ title: newTodoTitle, description: newTodoDescription, priority: newTodoPriority, dueDate: newTodoDueDate }" label-width="80px">
          <el-form-item label="标题" required>
            <el-input
              v-model="newTodoTitle"
              placeholder="请输入待办标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input
              v-model="newTodoDescription"
              type="textarea"
              placeholder="请输入待办描述（可选）"
              :rows="3"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="优先级">
            <el-select v-model="newTodoPriority" placeholder="选择优先级">
              <el-option
                v-for="option in priorityOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                <span :style="{ color: option.color }">{{ option.label }}优先级</span>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="截止日期">
            <el-date-picker
              v-model="newTodoDueDate"
              type="date"
              placeholder="选择截止日期（可选）"
              :disabled-date="(date: Date) => date < new Date()"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showAddDialog = false">取消</el-button>
            <el-button type="primary" @click="addTodo" :loading="loading">
              添加待办
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 编辑待办对话框 -->
      <el-dialog
        v-model="showEditDialog"
        title="编辑待办"
        width="500px"
        :before-close="() => { showEditDialog = false }"
      >
        <el-form :model="{ title: editTodoTitle, description: editTodoDescription, priority: editTodoPriority, dueDate: editTodoDueDate }" label-width="80px">
          <el-form-item label="标题" required>
            <el-input
              v-model="editTodoTitle"
              placeholder="请输入待办标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input
              v-model="editTodoDescription"
              type="textarea"
              placeholder="请输入待办描述（可选）"
              :rows="3"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="优先级">
            <el-select v-model="editTodoPriority" placeholder="选择优先级">
              <el-option
                v-for="option in priorityOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                <span :style="{ color: option.color }">{{ option.label }}优先级</span>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="截止日期">
            <el-date-picker
              v-model="editTodoDueDate"
              type="date"
              placeholder="选择截止日期（可选）"
              :disabled-date="(date: Date) => date < new Date()"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showEditDialog = false">取消</el-button>
            <el-button type="primary" @click="updateTodo" :loading="loading">
              更新待办
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>

    <!-- 筛选器 -->
    <div class="todo-filters">
      <el-radio-group v-model="currentFilter" class="filter-group">
        <el-radio-button 
          v-for="option in filterOptions" 
          :key="option.value" 
          :label="option.value"
        >
          <el-icon><component :is="option.icon" /></el-icon>
          {{ option.label }}
        </el-radio-button>
      </el-radio-group>
      
      <el-button 
        v-if="stats.completed > 0"
        type="danger"
        size="small"
        @click="clearCompleted"
        class="clear-btn"
      >
        清除已完成 ({{ stats.completed }})
      </el-button>
    </div>

    <!-- 待办列表 -->
    <div class="todos-container" v-loading="loading">
      <div class="loading-container">
        <!-- 空状态 -->
        <div v-if="filteredTodos.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>
            {{ currentFilter === 'all' ? '还没有待办事项' : 
               currentFilter === 'active' ? '没有进行中的待办' : 
               '没有已完成的待办' }}
          </h3>
          <p>
            {{ currentFilter === 'all' ? '添加一个待办事项开始管理你的任务' : 
               currentFilter === 'active' ? '所有任务都已完成，真棒！' : 
               '还没有完成任何任务' }}
          </p>
        </div>

        <!-- 待办列表 -->
        <TransitionGroup 
          v-else 
          name="todo-list" 
          tag="div" 
          class="todos-list"
        >
          <div 
            v-for="(todo, index) in filteredTodos" 
            :key="todo.id"
            :class="['todo-item', 'fade-in-up', 'card-hover', { 'completed': todo.completed }]"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <!-- 完成状态切换 -->
            <div class="todo-checkbox" @click="toggleTodo(todo)">
              <el-icon 
                :class="['checkbox-icon', { 'checked': todo.completed }]"
                :size="20"
              >
                <Check v-if="todo.completed" />
                <div v-else class="checkbox-empty"></div>
              </el-icon>
            </div>
            
            <!-- 待办内容 -->
            <div class="todo-content">
              <div :class="['todo-text', { 'completed': todo.completed }]">
                {{ todo.title }}
              </div>
              <div v-if="todo.description" class="todo-description">
                {{ todo.description }}
              </div>
              <div class="todo-meta">
                <div class="todo-priority">
                  <el-tag 
                    :color="getPriorityInfo(todo.priority).color"
                    size="small"
                    effect="light"
                  >
                    {{ getPriorityInfo(todo.priority).label }}优先级
                  </el-tag>
                </div>
                <div v-if="todo.dueDate" class="todo-due-date">
                  <el-icon><Calendar /></el-icon>
                  <span 
                    :class="{
                      'overdue': isOverdue(todo.dueDate),
                      'due-soon': isDueSoon(todo.dueDate)
                    }"
                  >
                    {{ formatDate(todo.dueDate) }}
                  </span>
                </div>
                <span class="todo-date">
                  创建于 {{ formatDate(todo.createdAt) }}
                </span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="todo-actions">
              <el-button 
                type="primary" 
                :icon="Edit" 
                size="small" 
                circle
                @click="openEditDialog(todo)"
                class="edit-btn"
              />
              <el-button 
                type="danger" 
                :icon="Delete" 
                size="small" 
                circle
                @click="deleteTodo(todo)"
                class="delete-btn"
              />
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todos-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 列表过渡动画 */
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.4s ease;
}

.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.todo-list-move {
  transition: transform 0.4s ease;
}

/* 页面头部 */
.todos-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.stats-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 新建待办 */
.todo-creator {
  margin-bottom: 20px;
}

.creator-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.add-todo-btn {
  min-width: 150px;
  height: 45px;
  border-radius: 25px;
  font-weight: 500;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 筛选器 */
.todo-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-group {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

.filter-group .el-radio-button {
  margin-right: 8px;
}

.filter-group .el-radio-button__inner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
}

.filter-group :deep(.el-radio-button__inner) {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  font-weight: 500;
}

.filter-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.clear-btn {
  border-radius: 16px;
  font-weight: 500;
}

/* 待办容器 */
.todos-container {
  flex: 1;
  overflow-y: auto;
}

.loading-container {
  min-height: 300px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.empty-state p {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 24px;
}

/* 待办列表 */
.todos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 待办项 */
.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
  min-height: 80px;
}

.todo-item:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.todo-item.completed {
  opacity: 0.7;
}

/* 复选框 */
.todo-checkbox {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: white;
}

.checkbox-icon.checked {
  background: #67c23a;
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.checkbox-empty {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: transparent;
}

.todo-checkbox:hover .checkbox-icon {
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 待办内容 */
.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-text {
  color: white;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 8px;
  word-break: break-word;
  word-wrap: break-word;
  hyphens: auto;
  transition: all 0.3s ease;
  overflow-wrap: break-word;
}

.todo-text.completed {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.6);
}

.todo-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin-bottom: 8px;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  max-height: 4.2rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.85rem;
}

.todo-priority {
  display: flex;
  align-items: center;
}

.todo-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.todo-due-date .overdue {
  color: #f56c6c;
  font-weight: 500;
}

.todo-due-date .due-soon {
  color: #e6a23c;
  font-weight: 500;
}

.todo-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* 待办操作 */
.todo-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}

.edit-btn {
  width: 32px;
  height: 32px;
  background: rgba(64, 158, 255, 0.2);
  border: 1px solid rgba(64, 158, 255, 0.3);
  color: #409eff;
}

.edit-btn:hover {
  background: rgba(64, 158, 255, 0.3);
  border-color: rgba(64, 158, 255, 0.5);
}

.delete-btn {
  width: 32px;
  height: 32px;
  background: rgba(245, 108, 108, 0.2);
  border: 1px solid rgba(245, 108, 108, 0.3);
  color: #f56c6c;
}

.delete-btn:hover {
  background: rgba(245, 108, 108, 0.3);
  border-color: rgba(245, 108, 108, 0.5);
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todos-header {
    margin-bottom: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .stats-summary {
    justify-content: center;
  }
  
  .creator-container {
    flex-direction: column;
  }
  
  .add-todo-btn {
    width: 100%;
  }
  
  .todo-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    justify-content: center;
  }
  
  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .todo-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .todo-item {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .todo-content {
    width: 100%;
  }
  
  .todo-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .todos-view {
    padding: 12px;
  }
  
  .todo-item {
    padding: 12px 16px;
  }
  
  .todo-actions {
    opacity: 1;
  }
  
  .stats-summary {
    flex-direction: column;
  }
  
  .filter-group .el-radio-button__inner {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .todo-text {
    font-size: 0.9rem;
  }
  
  .todo-description {
    font-size: 0.8rem;
  }
  
  .edit-btn,
  .delete-btn {
    width: 32px;
    height: 32px;
  }
}
</style>