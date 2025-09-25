/*
  OpenRouter AI 背景生成服务（仅用于开发代理 /openrouter）
  生产构建时不会暴露密钥；请在 .env.local 设置：
  OPENROUTER_API_KEY=sk-or-xxx
*/

export type AiModel = 'anthropic/claude-3.5-sonnet' | 'anthropic/claude-3.7-sonnet' | 'anthropic/claude-sonnet-4' | 'google/gemini-2.5-pro' | 'openai/chatgpt-4o'

export interface GeneratedThemeResult {
  themeName: string
  cssGradient?: string
  particlesColor?: string
  animation: 'particles' | 'waves' | 'gradient' | 'none'
  speed: number
  intensity: number
  // 可选的图片背景（base64 或远程 URL，建议 base64 小图+css 覆盖）
  imageDataUrl?: string
}

const SYSTEM_PROMPT = `
你必须严格按照以下要求回复：

1. 只能返回一个有效的JSON对象，不能有任何其他文字、解释或markdown标记
2. 根据用户需求生成日记应用的动态主题方案
3. 如果用户提到"锁屏风格"，生成柔和渐变效果
4. 如果用户提到"绚丽"，使用丰富色彩搭配
5. 如果用户提到"柔和"，使用温和色彩过渡

必须返回的JSON格式：
{
  "themeName": "中文主题名称",
  "cssGradient": "CSS渐变代码",
  "particlesColor": "rgba(r,g,b,a)",
  "animation": "gradient",
  "speed": 数字0.1-3,
  "intensity": 数字0.1-1
}

重要：只返回JSON，不要任何其他内容！
`

export async function generateDynamicTheme(prompt: string, model: AiModel): Promise<GeneratedThemeResult> {
  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 500
  }

  const res = await fetch('/api/openrouter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenRouter 请求失败: ${res.status} ${text}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('空响应')

  // OpenRouter 统一标准：content 可能是字符串
  let jsonContent = typeof content === 'string' ? content : JSON.stringify(content)
  
  // 清理可能的 markdown 代码块标记
  jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim()
  
  const parsed = JSON.parse(jsonContent)
  return parsed as GeneratedThemeResult
}


