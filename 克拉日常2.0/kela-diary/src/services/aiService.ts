export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatResponse {
  message: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  
  // 支持的模型列表
  public readonly models: AIModel[] = [
    // 主要模型（用户常用）
    {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      description: '最新的Claude模型，擅长复杂推理和创作',
      provider: 'Anthropic'
    },
    {
      id: 'google/gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Google最新的高性能AI模型',
      provider: 'Google'
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      description: 'OpenAI最新的多模态模型',
      provider: 'OpenAI'
    },
    // DeepSeek模型
    {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek Chat',
      description: 'DeepSeek的对话模型，擅长中英文对话',
      provider: 'DeepSeek'
    },
    {
      id: 'deepseek/deepseek-r1',
      name: 'DeepSeek Reason',
      description: 'DeepSeek的推理模型，具备强大的逻辑推理能力',
      provider: 'DeepSeek'
    },
    // 其他可选模型
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Claude 3.5 Sonnet模型',
      provider: 'Anthropic'
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: '快速响应的Claude模型',
      provider: 'Anthropic'
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      description: 'OpenAI GPT-4o模型',
      provider: 'OpenAI'
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: '轻量级的GPT-4o模型',
      provider: 'OpenAI'
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5',
      description: 'Google Gemini Pro 1.5模型',
      provider: 'Google'
    },
    {
      id: 'meta-llama/llama-3.1-405b-instruct',
      name: 'Llama 3.1 405B',
      description: 'Meta的大型语言模型',
      provider: 'Meta'
    },
    {
      id: 'mistralai/mistral-large',
      name: 'Mistral Large',
      description: 'Mistral AI的大型模型',
      provider: 'Mistral'
    }
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 发送聊天消息到指定模型
   */
  async sendMessage(
    messages: ChatMessage[],
    modelId: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<ChatResponse> {
    const {
      temperature = 0.7,
      maxTokens = 2048,
      stream = false
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Kela Diary AI Chat'
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature,
          max_tokens: maxTokens,
          stream
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `API请求失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('API返回数据格式错误');
      }

      const choice = data.choices[0];
      
      return {
        message: choice.message?.content || '',
        model: data.model || modelId,
        usage: data.usage
      };
    } catch (error) {
      console.error('AI服务调用失败:', error);
      throw error;
    }
  }

  /**
   * 流式发送消息（用于实时响应）
   */
  async sendMessageStream(
    messages: ChatMessage[],
    modelId: string,
    onChunk: (chunk: string) => void,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<void> {
    const {
      temperature = 0.7,
      maxTokens = 2048
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Kela Diary AI Chat'
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature,
          max_tokens: maxTokens,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `API请求失败: ${response.status} ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  onChunk(content);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('流式AI服务调用失败:', error);
      throw error;
    }
  }

  /**
   * 获取模型信息
   */
  getModel(modelId: string): AIModel | undefined {
    return this.models.find(model => model.id === modelId);
  }

  /**
   * 验证API密钥
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// 创建单例实例
let aiServiceInstance: AIService | null = null;

export function createAIService(apiKey: string): AIService {
  aiServiceInstance = new AIService(apiKey);
  return aiServiceInstance;
}

export function getAIService(): AIService | null {
  return aiServiceInstance;
}