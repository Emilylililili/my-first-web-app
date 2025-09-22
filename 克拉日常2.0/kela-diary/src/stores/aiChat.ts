import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AIService, ChatMessage, AIModel, createAIService, getAIService } from '../services/aiService';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useAIChatStore = defineStore('aiChat', () => {
  // 状态
  const apiKey = ref<string>('');
  const currentModel = ref<string>('anthropic/claude-sonnet-4');
  const sessions = ref<ChatSession[]>([]);
  const currentSessionId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isStreaming = ref(false);
  const streamingMessage = ref<string>('');
  const searchKeyword = ref<string>('');

  // 计算属性
  const aiService = computed(() => getAIService());
  const availableModels = computed(() => aiService.value?.models || []);
  const currentSession = computed(() => 
    sessions.value.find(session => session.id === currentSessionId.value)
  );
  const isApiKeyValid = computed(() => !!apiKey.value && !!aiService.value);
  const filteredSessions = computed(() => {
    if (!searchKeyword.value.trim()) {
      return sessions.value;
    }
    const keyword = searchKeyword.value.toLowerCase();
    return sessions.value.filter(session => 
      session.title.toLowerCase().includes(keyword) ||
      session.messages.some(msg => msg.content.toLowerCase().includes(keyword))
    );
  });

  // 初始化API服务
  function initializeAI(key: string) {
    apiKey.value = key;
    createAIService(key);
    // 保存到localStorage
    localStorage.setItem('ai_api_key', key);
  }

  // 从localStorage恢复API密钥
  function restoreApiKey() {
    const savedKey = localStorage.getItem('ai_api_key');
    if (savedKey) {
      initializeAI(savedKey);
    }
  }

  // 验证API密钥
  async function validateApiKey(): Promise<boolean> {
    if (!aiService.value) return false;
    
    try {
      isLoading.value = true;
      error.value = null;
      const isValid = await aiService.value.validateApiKey();
      if (!isValid) {
        error.value = 'API密钥无效，请检查后重试';
      }
      return isValid;
    } catch (err) {
      error.value = '验证API密钥时发生错误';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // 创建新的聊天会话
  function createSession(title?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      id: sessionId,
      title: title || '新对话',
      messages: [],
      model: currentModel.value,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    sessions.value.unshift(session);
    currentSessionId.value = sessionId;
    saveSessions();
    return sessionId;
  }

  // 切换会话
  function switchSession(sessionId: string) {
    const session = sessions.value.find(s => s.id === sessionId);
    if (session) {
      currentSessionId.value = sessionId;
      currentModel.value = session.model;
    }
  }

  // 删除会话
  function deleteSession(sessionId: string) {
    const index = sessions.value.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions.value.splice(index, 1);
      if (currentSessionId.value === sessionId) {
        currentSessionId.value = sessions.value.length > 0 ? sessions.value[0].id : null;
      }
      saveSessions();
    }
  }

  // 更新会话标题
  function updateSessionTitle(sessionId: string, title: string) {
    const session = sessions.value.find(s => s.id === sessionId);
    if (session) {
      session.title = title;
      session.updatedAt = new Date();
      saveSessions();
    }
  }

  // 切换模型
  function switchModel(modelId: string) {
    currentModel.value = modelId;
    if (currentSession.value) {
      currentSession.value.model = modelId;
      currentSession.value.updatedAt = new Date();
      saveSessions();
    }
  }

  // 添加消息到当前会话
  function addMessage(content: string, role: 'user' | 'assistant' | 'system' = 'user') {
    if (!currentSession.value) {
      createSession();
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      model: role === 'assistant' ? currentModel.value : undefined
    };

    currentSession.value!.messages.push(message);
    currentSession.value!.updatedAt = new Date();
    
    // 自动生成会话标题
    if (currentSession.value!.messages.length === 1 && role === 'user') {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      updateSessionTitle(currentSession.value!.id, title);
    }
    
    saveSessions();
    return message;
  }

  // 发送消息
  async function sendMessage(content: string): Promise<void> {
    if (!aiService.value || !content.trim()) return;

    try {
      isLoading.value = true;
      error.value = null;

      // 添加用户消息
      addMessage(content, 'user');

      // 准备消息历史
      const messages = currentSession.value!.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // 调用AI服务
      const response = await aiService.value.sendMessage(messages, currentModel.value);
      
      // 添加AI回复
      addMessage(response.message, 'assistant');
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败';
      console.error('发送消息失败:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // 流式发送消息
  async function sendMessageStream(content: string): Promise<void> {
    if (!aiService.value || !content.trim()) return;

    try {
      isLoading.value = true;
      isStreaming.value = true;
      error.value = null;
      streamingMessage.value = '';

      // 添加用户消息
      addMessage(content, 'user');

      // 准备消息历史
      const messages = currentSession.value!.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // 流式调用AI服务
      await aiService.value.sendMessageStream(
        messages,
        currentModel.value,
        (chunk: string) => {
          streamingMessage.value += chunk;
        }
      );
      
      // 添加完整的AI回复
      if (streamingMessage.value) {
        addMessage(streamingMessage.value, 'assistant');
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败';
      console.error('流式发送消息失败:', err);
    } finally {
      isLoading.value = false;
      isStreaming.value = false;
      streamingMessage.value = '';
    }
  }

  // 清除错误
  function clearError() {
    error.value = null;
  }

  // 压缩数据
  function compressData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // 简单的压缩：移除多余空格和换行
      return jsonString.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('数据压缩失败:', error);
      return JSON.stringify(data);
    }
  }

  // 解压数据
  function decompressData(compressedData: string): any {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('数据解压失败:', error);
      return null;
    }
  }

  // 创建备份
  function createBackup() {
    try {
      const timestamp = new Date().toISOString();
      const backupData = {
        sessions: sessions.value,
        currentSessionId: currentSessionId.value,
        timestamp,
        version: '1.0'
      };
      const compressedBackup = compressData(backupData);
      localStorage.setItem(`ai_chat_backup_${timestamp}`, compressedBackup);
      
      // 保持最多5个备份
      const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('ai_chat_backup_'));
      if (backupKeys.length > 5) {
        backupKeys.sort();
        for (let i = 0; i < backupKeys.length - 5; i++) {
          localStorage.removeItem(backupKeys[i]);
        }
      }
      
      return timestamp;
    } catch (error) {
      console.error('创建备份失败:', error);
      return null;
    }
  }

  // 删除备份
  function deleteBackup(backupKey: string) {
    try {
      localStorage.removeItem(backupKey);
      return true;
    } catch (error) {
      console.error('删除备份失败:', error);
      return false;
    }
  }

  // 保存会话到localStorage
  function saveSessions() {
    try {
      const compressedSessions = compressData(sessions.value);
      localStorage.setItem('ai_chat_sessions', compressedSessions);
      localStorage.setItem('ai_chat_current_session_id', currentSessionId.value || '');
      
      // 每10次保存创建一次备份
      const saveCount = parseInt(localStorage.getItem('ai_chat_save_count') || '0') + 1;
      localStorage.setItem('ai_chat_save_count', saveCount.toString());
      if (saveCount % 10 === 0) {
        createBackup();
      }
    } catch (err) {
      console.error('保存会话失败:', err);
    }
  }

  // 获取可用备份列表
  function getAvailableBackups() {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('ai_chat_backup_'))
        .sort((a, b) => b.localeCompare(a)); // 按时间倒序
      
      return backupKeys.map(key => {
        const timestamp = key.replace('ai_chat_backup_', '');
        return {
          key,
          timestamp,
          date: new Date(timestamp).toLocaleString()
        };
      });
    } catch (error) {
      console.error('获取备份列表失败:', error);
      return [];
    }
  }

  // 从备份恢复数据
  function restoreFromBackup(backupKey: string) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('备份数据不存在');
      }
      
      const decompressedData = decompressData(backupData);
      if (!decompressedData) {
        throw new Error('备份数据解压失败');
      }
      
      // 恢复日期对象
      decompressedData.sessions.forEach((session: ChatSession) => {
        session.createdAt = new Date(session.createdAt);
        session.updatedAt = new Date(session.updatedAt);
        session.messages.forEach((message: any) => {
          message.timestamp = new Date(message.timestamp);
        });
      });
      
      sessions.value = decompressedData.sessions;
      currentSessionId.value = decompressedData.currentSessionId;
      saveSessions(); // 保存恢复的数据
      
      return true;
    } catch (error) {
      console.error('从备份恢复失败:', error);
      return false;
    }
  }

  // 从localStorage恢复会话
  function restoreSessions() {
    try {
      const saved = localStorage.getItem('ai_chat_sessions');
      const savedCurrentSessionId = localStorage.getItem('ai_chat_current_session_id');
      
      if (saved) {
        // 尝试解压数据
        const parsed = decompressData(saved) || JSON.parse(saved);
        sessions.value = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        // 恢复当前会话
        if (sessions.value.length > 0 && !currentSessionId.value) {
          currentSessionId.value = sessions.value[0].id;
          currentModel.value = sessions.value[0].model;
        }
      }
      
      if (savedCurrentSessionId) {
        currentSessionId.value = savedCurrentSessionId;
      }
    } catch (err) {
      console.error('恢复会话失败:', err);
      // 尝试从最新备份恢复
      const backups = getAvailableBackups();
      if (backups.length > 0) {
        console.log('尝试从备份恢复数据...');
        restoreFromBackup(backups[0].key);
      }
    }
  }

  // 清除所有数据
  function clearAllData() {
    sessions.value = [];
    currentSessionId.value = null;
    apiKey.value = '';
    error.value = null;
    localStorage.removeItem('ai_chat_sessions');
    localStorage.removeItem('ai_api_key');
  }

  // 搜索会话
  function searchSessions(keyword: string) {
    searchKeyword.value = keyword;
  }

  // 导出会话数据
  function exportSessions(): string {
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      sessions: sessions.value
    };
    return JSON.stringify(exportData, null, 2);
  }

  // 导出单个会话
  function exportSession(sessionId: string): string | null {
    const session = sessions.value.find(s => s.id === sessionId);
    if (!session) return null;
    
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      session: session
    };
    return JSON.stringify(exportData, null, 2);
  }

  // 导入会话数据
  function importSessions(jsonData: string): { success: boolean; message: string; imported: number } {
    try {
      const data = JSON.parse(jsonData);
      
      // 验证数据格式
      if (!data.version || !data.sessions) {
        return { success: false, message: '无效的数据格式', imported: 0 };
      }
      
      let imported = 0;
      const existingIds = new Set(sessions.value.map(s => s.id));
      
      // 导入会话，避免重复
      for (const sessionData of data.sessions) {
        if (!existingIds.has(sessionData.id)) {
          const session: ChatSession = {
            ...sessionData,
            createdAt: new Date(sessionData.createdAt),
            updatedAt: new Date(sessionData.updatedAt),
            messages: sessionData.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          };
          sessions.value.push(session);
          imported++;
        }
      }
      
      // 按更新时间排序
      sessions.value.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      saveSessions();
      
      return { 
        success: true, 
        message: `成功导入 ${imported} 个会话`, 
        imported 
      };
    } catch (err) {
      return { 
        success: false, 
        message: '解析数据失败，请检查文件格式', 
        imported: 0 
      };
    }
  }

  // 下载会话为文件
  function downloadSessions(filename?: string) {
    const data = exportSessions();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `ai-chat-sessions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 下载单个会话为文件
  function downloadSession(sessionId: string, filename?: string) {
    const data = exportSession(sessionId);
    if (!data) return;
    
    const session = sessions.value.find(s => s.id === sessionId);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${session?.title || 'session'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    // 状态
    apiKey,
    currentModel,
    sessions,
    currentSessionId,
    isLoading,
    error,
    isStreaming,
    streamingMessage,
    searchKeyword,
    
    // 计算属性
    aiService,
    availableModels,
    currentSession,
    isApiKeyValid,
    filteredSessions,
    
    // 方法
    initializeAI,
    restoreApiKey,
    validateApiKey,
    createSession,
    switchSession,
    deleteSession,
    updateSessionTitle,
    switchModel,
    addMessage,
    sendMessage,
    sendMessageStream,
    clearError,
    saveSessions,
    restoreSessions,
    getAvailableBackups,
    restoreFromBackup,
    clearAllData,
    searchSessions,
    exportSessions,
    exportSession,
    importSessions,
    downloadSessions,
    downloadSession,
    createBackup,
    deleteBackup
  };
});