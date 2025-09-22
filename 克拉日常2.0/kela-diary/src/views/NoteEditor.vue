<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Document, 
  Edit, 
  Check, 
  Close,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useNotesStore } from '../stores/notes'
import type { Note } from '../stores/notes'

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()

// 编辑器状态
const note = ref<Partial<Note>>({
  id: '',
  title: '',
  content: '',
  tags: [],
  textColor: ''
})

const isEditing = computed(() => !!route.params.id)
const isNew = computed(() => !isEditing.value)
const loading = ref(false)
const saving = ref(false)
const hasUnsavedChanges = ref(false)

// 编辑器引用，用于直接设置编辑区域样式
const quillRef = ref<any>(null)

const applyEditorTextColor = () => {
  try {
    const rootEl = (quillRef.value?.$el as HTMLElement) || null
    const editorEl = rootEl ? rootEl.querySelector('.ql-editor') as HTMLElement : null
    if (editorEl) {
      const color = note.value.textColor || '#222'
      editorEl.style.setProperty('color', color, 'important')
    }
  } catch (e) {
    // no-op
  }
}

// 标签管理
const newTag = ref('')
const showTagInput = ref(false)

// 自动保存
const autoSaveTimer = ref<NodeJS.Timeout | null>(null)
const AUTOSAVE_INTERVAL = 30000 // 30秒自动保存

// Quill编辑器配置
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  },
  placeholder: '开始写下你的想法...'
}

// 加载笔记数据
const loadNote = async () => {
  if (!isEditing.value) {
    // 新建笔记
    note.value = {
      id: '',
      title: '',
      content: '',
      tags: [],
      textColor: ''
    }
    return
  }

  loading.value = true
  try {
    const foundNote = notesStore.getNoteById(route.params.id as string)
    
    if (foundNote) {
      note.value = {
        id: foundNote.id,
        title: foundNote.title,
        content: foundNote.content,
        tags: [...foundNote.tags],
        textColor: foundNote.textColor || ''
      }
      // 应用一次颜色到编辑区域
      applyEditorTextColor()
    } else {
      ElMessage.error('笔记不存在')
      router.push('/notes')
    }
  } catch (error) {
    console.error('加载笔记失败:', error)
    ElMessage.error('加载笔记失败')
  } finally {
    loading.value = false
  }
}

// 保存笔记
const saveNote = async () => {
  if (!note.value.title?.trim()) {
    ElMessage.warning('请输入笔记标题')
    return false
  }

  saving.value = true
  try {
    const noteData = {
      title: note.value.title.trim(),
      content: note.value.content || '',
      tags: note.value.tags || [],
      textColor: note.value.textColor || ''
    }

    let savedNote: Note | null = null
    
    if (isEditing.value && note.value.id) {
      // 更新现有笔记
      savedNote = notesStore.updateNote(note.value.id, noteData)
    } else {
      // 添加新笔记
      savedNote = notesStore.addNote(noteData)
      if (savedNote) {
        note.value.id = savedNote.id
        // 更新路由到编辑模式
        router.replace(`/note/${savedNote.id}`)
      }
    }

    if (savedNote) {
      hasUnsavedChanges.value = false
      ElMessage.success('笔记已保存')
      return true
    } else {
      ElMessage.error('保存失败')
      return false
    }
  } catch (error) {
    console.error('保存笔记失败:', error)
    ElMessage.error('保存笔记失败')
    return false
  } finally {
    saving.value = false
  }
}

// 自动保存
const startAutoSave = () => {
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value)
  }
  
  autoSaveTimer.value = setInterval(() => {
    if (hasUnsavedChanges.value && note.value.title?.trim()) {
      saveNote()
    }
  }, AUTOSAVE_INTERVAL)
}

const stopAutoSave = () => {
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value)
    autoSaveTimer.value = null
  }
}

// 返回笔记列表
const goBack = async () => {
  if (hasUnsavedChanges.value) {
    try {
      await ElMessageBox.confirm(
        '有未保存的更改，是否保存后离开？',
        '确认离开',
        {
          confirmButtonText: '保存并离开',
          cancelButtonText: '直接离开',
          distinguishCancelAndClose: true,
          type: 'warning'
        }
      )
      
      const saved = await saveNote()
      if (saved) {
        router.push('/notes')
      }
    } catch (action) {
      if (action === 'cancel') {
        // 直接离开
        router.push('/notes')
      }
      // close - 不做任何操作
    }
  } else {
    router.push('/notes')
  }
}

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !note.value.tags?.includes(tag)) {
    if (!note.value.tags) {
      note.value.tags = []
    }
    note.value.tags.push(tag)
    newTag.value = ''
    showTagInput.value = false
    hasUnsavedChanges.value = true
  }
}

// 删除标签
const removeTag = (index: number) => {
  if (note.value.tags) {
    note.value.tags.splice(index, 1)
    hasUnsavedChanges.value = true
  }
}

// 监听内容变化
watch(
  () => [note.value.title, note.value.content, note.value.tags, note.value.textColor],
  () => {
    hasUnsavedChanges.value = true
  },
  { deep: true }
)

// 单独监听颜色变化，立即作用到编辑区域
watch(
  () => note.value.textColor,
  () => {
    applyEditorTextColor()
  }
)

// 组件挂载和卸载
onMounted(() => {
  loadNote()
  startAutoSave()
  // 首次挂载也尝试应用颜色
  applyEditorTextColor()
})

onBeforeUnmount(() => {
  stopAutoSave()
})
</script>

<template>
  <div class="note-editor">
    <!-- 编辑器头部 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button 
          :icon="ArrowLeft" 
          @click="goBack"
          class="back-btn"
          size="large"
        >
          返回
        </el-button>
        <div class="note-info">
          <h2 class="editor-title">
            {{ isNew ? '新建笔记' : '编辑笔记' }}
          </h2>
          <div v-if="!isNew" class="note-meta">
            <span class="meta-item">
              创建于: {{ new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).format(note.createdAt) }}
            </span>
            <span class="meta-item">
              更新于: {{ new Intl.DateTimeFormat('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).format(note.updatedAt) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Check" 
          @click="saveNote"
          :loading="saving"
          size="large"
          class="save-btn"
        >
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </div>

    <!-- 编辑器内容 -->
    <div class="editor-content" v-loading="loading">
      <!-- 笔记标题和标签 -->
      <div class="note-header">
        <el-input
          v-model="note.title"
          placeholder="输入笔记标题..."
          size="large"
          class="title-input"
        />
        
        <!-- 笔记标签 -->
        <div class="note-tags">
          <label class="tag-label">标签：</label>
          <div class="tags-container">
            <el-tag
              v-for="(tag, index) in note.tags"
              :key="index"
              closable
              @close="removeTag(index)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            
            <el-input
              v-if="showTagInput"
              v-model="newTag"
              size="small"
              class="tag-input"
              placeholder="输入标签名"
              @keyup.enter="addTag"
              @blur="addTag"
              ref="tagInputRef"
            />
            
            <el-button
              v-else
              @click="showTagInput = true"
              size="small"
              type="primary"
              plain
              :icon="Plus"
              class="add-tag-btn"
            >
              添加标签
            </el-button>
          </div>
        </div>
      </div>

      <!-- 富文本编辑器 -->
      <div class="editor-container" :style="{ '--note-text-color': note.textColor || '#222' }">
        <div class="textcolor-fab">
          <span class="textcolor-fab__label">正文字体颜色：</span>
          <el-color-picker
            v-model="note.textColor"
            show-alpha
          />
        </div>
        <QuillEditor
          v-model:content="note.content"
          :options="editorOptions"
          content-type="html"
          class="quill-editor"
          ref="quillRef"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

/* 编辑器头部 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: 12px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.25);
}

.note-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.editor-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.note-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.header-right {
  display: flex;
  align-items: center;
}

.save-btn {
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 编辑器内容 */
.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}

/* 笔记头部 */
.note-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.title-input {
  flex: 1;
}

.title-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title-input :deep(.el-input__inner) {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.title-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.note-tags {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
}

.tag-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  margin-top: 6px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.tag-item {
  margin: 0;
}

.tag-input {
  width: 120px;
}

.tag-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.tag-input :deep(.el-input__inner) {
  color: white;
}

.add-tag-btn {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 8px;
}

/* 编辑器容器 */
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.quill-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Quill编辑器样式覆盖 */
.quill-editor :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  padding: 12px 16px;
}

.quill-editor :deep(.ql-container) {
  flex: 1;
  border: none;
  font-size: 1rem;
  line-height: 1.6;
}

.quill-editor :deep(.ql-editor) {
  padding: 20px 24px;
  min-height: 400px;
  color: var(--note-text-color, #222) !important;
}

/* 强制正文内所有元素继承并应用正文颜色 */
.quill-editor :deep(.ql-editor *) {
  color: var(--note-text-color, #222) !important;
}

/* 富文本区内的颜色选择器悬浮按钮 */
.textcolor-fab {
  position: absolute;
  top: 8px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.textcolor-fab__label {
  font-size: 12px;
  color: #666;
}

.quill-editor :deep(.ql-editor.ql-blank::before) {
  color: #999;
  font-style: normal;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: space-between;
  }
  
  .note-info {
    flex: 1;
  }
  
  .editor-title {
    font-size: 1.3rem;
  }
  
  .note-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .note-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tag-select {
    width: 100%;
  }
  
  .editor-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .quill-editor :deep(.ql-toolbar) {
    padding: 8px 12px;
  }
  
  .quill-editor :deep(.ql-editor) {
    padding: 16px;
    min-height: 300px;
  }
  
  .back-btn span {
    display: none;
  }
}
</style>