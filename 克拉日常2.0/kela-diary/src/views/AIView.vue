<template>
  <div class="ai-view">
    <!-- API密钥配置模态框 -->
    <div v-if="!isApiKeyValid" class="api-key-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>配置 OpenRouter API</h2>
          <p>请输入您的 OpenRouter API 密钥以开始使用 AI 对话功能</p>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label for="api-key">API 密钥</label>
            <input
              id="api-key"
              v-model="tempApiKey"
              type="password"
              placeholder="sk-or-v1-..."
              class="api-key-input"
              @keyup.enter="handleApiKeySubmit"
            />
          </div>
          <div class="modal-actions">
            <button 
              @click="handleApiKeySubmit" 
              :disabled="!tempApiKey.trim() || isLoading"
              class="submit-btn"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? '验证中...' : '确认' }}
            </button>
          </div>
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主聊天界面 -->
    <div v-else class="chat-container">
      <!-- 侧边栏 - 会话列表 -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <button @click="createNewSession" class="new-chat-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            新对话
          </button>
          
          <!-- 搜索框 -->
          <div class="search-box">
            <input 
              v-model="searchKeyword"
              type="text"
              placeholder="搜索对话..."
              class="search-input"
            />
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          
          <!-- 导入导出按钮 -->
          <div class="import-export-buttons">
            <button @click="handleExportSessions" class="icon-btn" title="导出所有对话">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button @click="showImportModal = true" class="icon-btn" title="导入对话">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="sessions-list">
          <div 
            v-for="session in filteredSessions" 
            :key="session.id"
            :class="['session-item', { active: session.id === currentSessionId }]"
            @click="switchSession(session.id)"
          >
            <div class="session-content">
              <div class="session-title">{{ session.title }}</div>
              <div class="session-meta">
                <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
                <span class="session-model">{{ getModelName(session.model) }}</span>
              </div>
            </div>
            <div class="session-actions">
              <button 
                @click.stop="handleExportSession(session.id)"
                class="action-btn"
                title="导出对话"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button 
                @click.stop="deleteSession(session.id)"
                class="action-btn delete-btn"
                title="删除对话"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 模型选择 -->
        <div class="model-selector">
          <label>AI 模型</label>
          <select v-model="currentModel" @change="handleModelChange" class="model-select">
            <optgroup label="🎯 主要模型">
              <option value="anthropic/claude-sonnet-4">🤖 Claude Sonnet 4</option>
              <option value="google/gemini-2.5-pro">✨ Gemini 2.5 Pro</option>
              <option value="openai/gpt-4o">🧠 GPT-4o</option>
              <option value="deepseek/deepseek-chat">💬 DeepSeek Chat</option>
              <option value="deepseek/deepseek-r1">🧮 DeepSeek Reason</option>
            </optgroup>
            <optgroup label="📋 其他模型">
              <option v-for="model in otherModels" :key="model.id" :value="model.id">
                🔧 {{ model.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- 设置按钮 -->
        <div class="sidebar-footer">
          <button @click="showSettings = true" class="settings-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            设置
          </button>
        </div>
      </div>

      <!-- 聊天主区域 -->
      <div class="chat-main">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-title">
            <h3>{{ currentSession?.title || 'AI 对话' }}</h3>
            <span class="current-model">{{ getCurrentModelName() }}</span>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div v-if="!currentSession || currentSession.messages.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h4>开始新的对话</h4>
            <p>向 AI 提问任何问题，我会尽力为您提供帮助</p>
          </div>

          <div v-else class="messages-list">
            <div 
              v-for="message in currentSession.messages" 
              :key="message.id"
              :class="['message', message.role]"
            >
              <div class="message-avatar">
                <div v-if="message.role === 'user'" class="user-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div v-else class="ai-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
              </div>
              <div class="message-content">
                <div class="message-text" v-html="formatMessage(message.content)"></div>
                <div class="message-meta">
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  <span v-if="message.model" class="message-model">{{ getModelName(message.model) }}</span>
                </div>
              </div>
            </div>

            <!-- 流式消息显示 -->
            <div v-if="isStreaming" class="message assistant streaming">
              <div class="message-avatar">
                <div class="ai-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
              </div>
              <div class="message-content">
                <div class="message-text" v-html="formatMessage(streamingMessage)"></div>
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div v-if="error" class="error-banner">
            <span>{{ error }}</span>
            <button @click="clearError" class="close-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div class="input-container">
            <textarea
              v-model="inputMessage"
              @keydown="handleKeyDown"
              :disabled="isLoading || isStreaming"
              placeholder="输入消息..."
              class="message-input"
              rows="1"
              ref="messageInput"
            ></textarea>
            <button 
              @click="handleSendMessage"
              :disabled="!inputMessage.trim() || isLoading || isStreaming"
              class="send-btn"
            >
              <svg v-if="!isLoading && !isStreaming" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置模态框 -->
    <div v-if="showSettings" class="settings-modal" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>设置</h3>
          <button @click="showSettings = false" class="close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="setting-item">
            <label>API 密钥</label>
            <div class="api-key-display">
              <span>{{ maskedApiKey }}</span>
              <button @click="resetApiKey" class="reset-btn">重新设置</button>
            </div>
          </div>
          <div class="setting-item">
            <label>备份管理</label>
            <button @click="showBackupModal = true; loadBackups()" class="backup-btn">管理备份</button>
          </div>
          <div class="setting-item">
            <label>清除数据</label>
            <button @click="handleClearData" class="danger-btn">清除所有对话记录</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入对话模态框 -->
    <div v-if="showImportModal" class="import-modal" @click="showImportModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>导入对话</h3>
          <button @click="showImportModal = false" class="close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="import-options">
            <button @click="triggerFileInput" class="import-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              选择文件
            </button>
            <span class="or-text">或</span>
          </div>
          <div class="import-textarea">
            <label>粘贴JSON数据</label>
            <textarea 
              v-model="importData"
              placeholder="粘贴导出的JSON数据..."
              rows="8"
              class="import-input"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button @click="showImportModal = false" class="cancel-btn">取消</button>
            <button @click="handleImportSessions" :disabled="!importData.trim()" class="import-confirm-btn">
              导入
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 备份管理模态框 -->
    <div v-if="showBackupModal" class="backup-modal" @click="showBackupModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>备份管理</h3>
          <button @click="showBackupModal = false" class="close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="backup-actions">
            <button @click="aiChatStore.createBackup(); loadBackups()" class="backup-create-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              创建备份
            </button>
          </div>
          
          <div class="backup-list">
            <h4>可用备份</h4>
            <div v-if="availableBackups.length === 0" class="no-backups">
              <p>暂无备份</p>
            </div>
            <div v-else class="backups-container">
              <div 
                v-for="backup in availableBackups" 
                :key="backup.key"
                class="backup-item"
              >
                <div class="backup-info">
                  <div class="backup-date">{{ backup.date }}</div>
                  <div class="backup-time">{{ backup.timestamp }}</div>
                </div>
                <div class="backup-actions">
                  <button 
                    @click="aiChatStore.restoreFromBackup(backup.key); showBackupModal = false"
                    class="restore-btn"
                    title="恢复备份"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="23,4 23,10 17,10"/>
                      <polyline points="1,20 1,14 7,14"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                    </svg>
                    恢复
                  </button>
                  <button 
                    @click="aiChatStore.deleteBackup(backup.key); loadBackups()"
                    class="delete-backup-btn"
                    title="删除备份"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"/>
                    </svg>
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleFileSelect"
      style="display: none;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useAIChatStore } from '../stores/aiChat';
import { storeToRefs } from 'pinia';

const aiChatStore = useAIChatStore();
const {
  apiKey,
  currentModel,
  sessions,
  currentSessionId,
  currentSession,
  isLoading,
  error,
  isStreaming,
  streamingMessage,
  availableModels,
  isApiKeyValid,
  searchKeyword,
  filteredSessions
} = storeToRefs(aiChatStore);

// 本地状态
const tempApiKey = ref('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');
const inputMessage = ref('');
const showSettings = ref(false);
const showImportModal = ref(false);
const showBackupModal = ref(false);
const importData = ref('');
const messagesContainer = ref<HTMLElement>();
const messageInput = ref<HTMLTextAreaElement>();
const fileInput = ref<HTMLInputElement>();
const availableBackups = ref<Array<{key: string, timestamp: string, date: string}>>([]);

// 获取备份列表
const loadBackups = () => {
  availableBackups.value = aiChatStore.getAvailableBackups();
};

// 计算属性
const maskedApiKey = computed(() => {
  if (!apiKey.value) return '';
  const key = apiKey.value;
  return key.substring(0, 8) + '*'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4);
});

const otherModels = computed(() => {
  const primaryModels = ['anthropic/claude-sonnet-4', 'google/gemini-2.5-pro', 'openai/gpt-4o', 'deepseek/deepseek-chat', 'deepseek/deepseek-r1'];
  return availableModels.value.filter(model => !primaryModels.includes(model.id));
});

// 方法
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getModelName(modelId: string): string {
  const model = availableModels.value.find(m => m.id === modelId);
  return model?.name || modelId;
}

function getCurrentModelName(): string {
  return getModelName(currentModel.value);
}

function formatMessage(content: string): string {
  // 简单的 Markdown 渲染
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

async function handleApiKeySubmit() {
  if (!tempApiKey.value.trim()) return;
  
  aiChatStore.initializeAI(tempApiKey.value);
  const isValid = await aiChatStore.validateApiKey();
  
  if (isValid) {
    tempApiKey.value = '';
  }
}

function createNewSession() {
  aiChatStore.createSession();
}

function switchSession(sessionId: string) {
  aiChatStore.switchSession(sessionId);
}

function deleteSession(sessionId: string) {
  if (confirm('确定要删除这个对话吗？')) {
    aiChatStore.deleteSession(sessionId);
  }
}

function handleModelChange() {
  aiChatStore.switchModel(currentModel.value);
}

async function handleSendMessage() {
  if (!inputMessage.value.trim()) return;
  
  const message = inputMessage.value;
  inputMessage.value = '';
  
  // 自动调整输入框高度
  if (messageInput.value) {
    messageInput.value.style.height = 'auto';
  }
  
  await aiChatStore.sendMessageStream(message);
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
  });
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
  
  // 自动调整输入框高度
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto';
      messageInput.value.style.height = messageInput.value.scrollHeight + 'px';
    }
  });
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function clearError() {
  aiChatStore.clearError();
}

function resetApiKey() {
  if (confirm('确定要重新设置 API 密钥吗？这将清除当前的配置。')) {
    aiChatStore.clearAllData();
    showSettings.value = false;
  }
}

function handleClearData() {
  if (confirm('确定要清除所有对话记录吗？此操作不可恢复。')) {
    aiChatStore.clearAllData();
    showSettings.value = false;
  }
}

// 导出所有会话
function handleExportSessions() {
  aiChatStore.downloadSessions();
}

// 导出单个会话
function handleExportSession(sessionId: string) {
  aiChatStore.downloadSession(sessionId);
}

// 触发文件选择
function triggerFileInput() {
  fileInput.value?.click();
}

// 处理文件选择
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importData.value = content;
    };
    reader.readAsText(file);
  }
}

// 导入会话
function handleImportSessions() {
  if (!importData.value.trim()) return;
  
  const result = aiChatStore.importSessions(importData.value);
  
  if (result.success) {
    alert(result.message);
    importData.value = '';
    showImportModal.value = false;
  } else {
    alert(`导入失败: ${result.message}`);
  }
}

// 监听消息变化，自动滚动到底部
watch(
  () => currentSession.value?.messages.length,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  }
);

// 监听流式消息，自动滚动到底部
watch(
  () => streamingMessage.value,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  }
);

// 组件挂载时恢复数据
onMounted(async () => {
  // 如果没有API密钥，自动设置用户提供的密钥
  if (!apiKey.value && tempApiKey.value) {
    aiChatStore.initializeAI(tempApiKey.value);
    await aiChatStore.validateApiKey();
  } else {
    aiChatStore.restoreApiKey();
  }
  aiChatStore.restoreSessions();
});
</script>

<style scoped>
.ai-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* API密钥配置模态框 */
.api-key-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  backdrop-filter: var(--backdrop-blur-md);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 480px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-secondary);
}

.modal-header h2 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-header p {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.input-group {
  margin-bottom: var(--spacing-lg);
}

.input-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.api-key-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  transition: var(--transition-normal);
}

.api-key-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.submit-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: var(--transform-hover);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--error-bg);
  color: var(--error-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--error-border);
}

/* 聊天容器 */
.chat-container {
  display: flex;
  min-height: 100vh;
  flex: 1;
}

/* 聊天侧边栏 */
.chat-sidebar {
  width: 300px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100vh;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-tertiary);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* 搜索框 */
.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-right: 2.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: var(--transition-normal);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-primary);
}

.search-icon {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

/* 导入导出按钮 */
.import-export-buttons {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
}

.icon-btn {
  padding: var(--spacing-xs);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

.new-chat-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-weight: 500;
}

.new-chat-btn:hover {
  background: var(--primary-dark);
  transform: var(--transform-hover);
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  min-height: 0;
  scroll-behavior: smooth;
}

.session-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  border: 1px solid transparent;
}

.session-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-secondary);
}

.session-item.active {
  background: var(--primary-bg);
  border-color: var(--primary-color);
}

.session-content {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  font-size: 0.9rem;
}

.session-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.session-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: var(--transition-normal);
}

.session-item:hover .session-actions {
  opacity: 1;
}

.action-btn {
  padding: var(--spacing-xs);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn.delete-btn:hover {
  background: var(--error-bg);
  color: var(--error-color);
}

.model-selector {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-tertiary);
}

.model-selector label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
}

.model-select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: var(--transition-normal);
  font-size: 0.95rem;
  font-weight: 500;
  min-height: 44px;
  cursor: pointer;
}

.model-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-primary);
  background: var(--bg-secondary);
}

.model-select:hover {
  border-color: var(--border-primary);
  background: var(--bg-hover);
}

.model-select option {
  background: #2c3e50 !important;
  color: #ffffff !important;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 0.95rem;
  font-weight: 500;
  min-height: 40px;
  line-height: 1.5;
  border: none;
}

.model-select option:hover {
  background: var(--primary-bg) !important;
  color: var(--primary-color) !important;
}

.model-select option:checked {
  background: var(--primary-color) !important;
  color: white !important;
  font-weight: 600;
}

.model-select optgroup {
  background: #34495e !important;
  color: #bdc3c7 !important;
  font-weight: 700;
  font-size: 0.85rem;
  padding: var(--spacing-sm) var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-tertiary);
}

/* 增强下拉框的显示效果 */
.model-selector {
  position: relative;
}

.model-selector::after {
  content: '▼';
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

/* 确保下拉选项在所有浏览器中都有足够的高度 */
@supports (-webkit-appearance: none) {
  .model-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: none;
  }
}

/* Firefox 特定样式 */
@-moz-document url-prefix() {
  .model-select option {
    background: #2c3e50 !important;
    color: #ffffff !important;
    padding: var(--spacing-md) var(--spacing-lg) !important;
    min-height: 40px !important;
  }
}

/* 增强选中状态的视觉效果 */
.model-select:focus option:checked {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)) !important;
  color: white !important;
  font-weight: 700;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.2);
}

/* 强化下拉选项背景色 - 确保在所有浏览器中都有足够对比度 */
.model-select option,
.model-select optgroup {
  background-color: #2c3e50 !important;
}

/* WebKit 浏览器特定样式 */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .model-select option {
    background: #2c3e50 !important;
    color: #ffffff !important;
  }
  
  .model-select optgroup {
    background: #34495e !important;
    color: #bdc3c7 !important;
  }
}

/* 确保下拉框展开时的背景色 */
.model-select[size],
.model-select[multiple] {
  background: #2c3e50 !important;
}

.model-select[size] option,
.model-select[multiple] option {
  background: #2c3e50 !important;
  color: #ffffff !important;
}

.sidebar-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-tertiary);
}

.settings-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.settings-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-primary);
}

/* 聊天主区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-secondary);
  background: var(--bg-secondary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.chat-title h3 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.current-model {
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-tertiary);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  min-height: 0;
  scroll-behavior: smooth;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.message {
  display: flex;
  gap: var(--spacing-md);
  max-width: 80%;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.assistant {
  align-self: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.user-avatar,
.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  background: var(--primary-color);
  color: white;
}

.ai-avatar {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-secondary);
}

.message-content {
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  overflow: hidden;
}

.message-text {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-secondary);
  line-height: 1.6;
  word-wrap: break-word;
}

.message.user .message-text {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.message-text code {
  background: var(--bg-tertiary);
  padding: 2px 4px;
  border-radius: var(--radius-xs);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.message.user .message-text code {
  background: var(--white-alpha-20);
}

.message-meta {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.message.user .message-meta {
  flex-direction: row-reverse;
}

.streaming .typing-indicator {
  display: flex;
  gap: 4px;
  margin-top: var(--spacing-sm);
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-height: 600px) {
  .chat-header {
    padding: var(--spacing-md);
  }
  
  .messages-container {
    padding: var(--spacing-md);
  }
  
  .input-container {
    padding: var(--spacing-md);
  }
}

@media (max-width: 768px) {
  .chat-sidebar {
    width: 250px;
  }
  
  .message {
    max-width: 90%;
  }
}

@media (max-width: 640px) {
  .chat-container {
    flex-direction: column;
  }
  
  .chat-sidebar {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--border-secondary);
  }
  
  .message {
    max-width: 95%;
  }
}

/* 输入区域 */
.chat-input-area {
  border-top: 1px solid var(--border-secondary);
  background: var(--bg-secondary);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--error-bg);
  color: var(--error-color);
  border-bottom: 1px solid var(--error-border);
}

.close-error {
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: var(--transition-normal);
}

.close-error:hover {
  background: var(--white-alpha-10);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.message-input {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: var(--spacing-md);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  resize: none;
  transition: var(--transition-normal);
  font-family: inherit;
  line-height: 1.5;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-primary);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 44px;
  height: 44px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: var(--transform-hover);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 设置模态框 */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  backdrop-filter: var(--backdrop-blur-md);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal .modal-content {
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: var(--transition-normal);
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.setting-item {
  margin-bottom: var(--spacing-lg);
}

.setting-item label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.api-key-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.api-key-display span {
  flex: 1;
  min-width: 0;
  word-break: break-all;
  overflow-wrap: break-word;
}

.reset-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--warning-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-normal);
  font-size: 0.875rem;
}

.reset-btn:hover {
  background: var(--warning-dark);
}

.danger-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
}

.danger-btn:hover {
  background: var(--error-dark);
  transform: var(--transform-hover);
}

/* 导入模态框 */
.import-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  backdrop-filter: var(--backdrop-blur-md);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.import-options {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.import-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
}

.import-btn:hover {
  background: var(--primary-dark);
  transform: var(--transform-hover);
}

.or-text {
  color: var(--text-secondary);
  font-style: italic;
}

.import-textarea {
  margin-bottom: var(--spacing-lg);
}

.import-textarea label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.import-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 120px;
  transition: var(--transition-normal);
}

.import-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-primary);
}

.cancel-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
}

.cancel-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-primary);
}

.import-confirm-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
}

.import-confirm-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: var(--transform-hover);
}

.import-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 备份管理模态框 */
.backup-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  backdrop-filter: var(--backdrop-blur-md);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.backup-modal .modal-content {
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.backup-actions {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-secondary);
}

.backup-create-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
}

.backup-create-btn:hover {
  background: var(--primary-dark);
  transform: var(--transform-hover);
}

.backup-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
}

.backup-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-primary);
}

.backup-list h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.no-backups {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.no-backups p {
  margin: 0;
  font-style: italic;
}

.backups-container {
  max-height: 300px;
  overflow-y: auto;
}

.backup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
}

.backup-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-primary);
}

.backup-info {
  flex: 1;
}

.backup-date {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.backup-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.backup-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.restore-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  font-weight: 500;
}

.restore-btn:hover {
  background: var(--success-dark);
  transform: var(--transform-hover);
}

.delete-backup-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  font-weight: 500;
}

.delete-backup-btn:hover {
  background: var(--error-dark);
  transform: var(--transform-hover);
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }
  
  .chat-sidebar {
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--border-secondary);
  }
  
  .sessions-list {
    max-height: 200px;
  }
  
  .message {
    max-width: 95%;
  }
  
  .modal-content {
    margin: var(--spacing-lg);
    width: calc(100% - 2 * var(--spacing-lg));
    max-width: none;
  }
  
  .api-key-display {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .reset-btn {
    width: 100%;
    justify-self: stretch;
  }
}

@media (max-width: 480px) {
  .chat-sidebar {
    max-height: 30vh;
  }
  
  .sessions-list {
    max-height: 150px;
  }
  
  .input-container {
    padding: var(--spacing-md);
  }
  
  .message {
    max-width: 100%;
  }
}
</style>