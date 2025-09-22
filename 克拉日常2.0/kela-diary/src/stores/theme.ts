import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Theme {
  id: string
  name: string
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  shadow: string
  gradient: string
  particleColor: string
  // 背景图片配置
  backgroundImage?: {
    enabled: boolean
    url: string
    opacity: number
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light'
    position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right'
    size: 'cover' | 'contain' | 'auto' | '100% 100%'
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  }
  // 动态效果配置
  animation: {
    enabled: boolean
    type: 'particles' | 'waves' | 'gradient' | 'floating' | 'spiral' | 'none'
    speed: number
    intensity: number
    particleCount: number
    particleSize: number
    connectionLines: boolean
    mouseInteraction: boolean
  }
  // 特殊效果
  effects: {
    blur: boolean
    glow: boolean
    parallax: boolean
    chromatic: boolean
    noise: boolean
    vignette: boolean
  }
  isCustom?: boolean
}

export const useThemeStore = defineStore('theme', () => {
  // 当前主题ID
  const currentThemeId = ref<string>('aurora')
  
  // 预定义主题
  const themes = ref<Theme[]>([
    {
      id: 'aurora',
      name: '极光',
      primary: '#4facfe',
      secondary: '#00f2fe',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      particleColor: '#ffffff',
      backgroundImage: {
        enabled: false,
        url: '',
        opacity: 0.8,
        blendMode: 'overlay',
        position: 'center',
        size: 'cover',
        repeat: 'no-repeat'
      },
      animation: {
        enabled: true,
        type: 'particles',
        speed: 1,
        intensity: 0.8,
        particleCount: 80,
        particleSize: 3,
        connectionLines: true,
        mouseInteraction: true
      },
      effects: {
        blur: true,
        glow: true,
        parallax: false,
        chromatic: false,
        noise: false,
        vignette: true
      }
    },
    {
      id: 'sunset',
      name: '日落',
      primary: '#ff9a9e',
      secondary: '#fecfef',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      surface: 'rgba(255, 255, 255, 0.15)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(255, 255, 255, 0.25)',
      shadow: '0 8px 32px rgba(255, 154, 158, 0.3)',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      particleColor: '#ffffff',
      backgroundImage: {
          enabled: false,
          url: '',
          opacity: 0.8,
          blendMode: 'overlay',
          position: 'center',
          size: 'cover',
          repeat: 'no-repeat'
        },
      animation: {
        enabled: true,
        type: 'gradient',
        speed: 0.5,
        intensity: 0.6,
        particleCount: 60,
        particleSize: 2,
        connectionLines: false,
        mouseInteraction: true
      },
      effects: {
        blur: false,
        glow: true,
        parallax: true,
        chromatic: true,
        noise: false,
        vignette: false
      }
    },
    {
      id: 'ocean',
      name: '海洋',
      primary: '#2196f3',
      secondary: '#21cbf3',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
      gradient: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
      particleColor: '#ffffff',
      backgroundImage: {
          enabled: false,
          url: '',
          opacity: 0.8,
          blendMode: 'overlay',
          position: 'center',
          size: 'cover',
          repeat: 'no-repeat'
        },
      animation: {
        enabled: true,
        type: 'waves',
        speed: 0.8,
        intensity: 0.7,
        particleCount: 40,
        particleSize: 4,
        connectionLines: false,
        mouseInteraction: false
      },
      effects: {
        blur: true,
        glow: false,
        parallax: true,
        chromatic: false,
        noise: true,
        vignette: true
      }
    },
    {
      id: 'forest',
      name: '森林',
      primary: '#4caf50',
      secondary: '#8bc34a',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
      particleColor: '#ffffff',
      backgroundImage: {
          enabled: false,
          url: '',
          opacity: 0.8,
          blendMode: 'overlay',
          position: 'center',
          size: 'cover',
          repeat: 'no-repeat'
        },
      animation: {
        enabled: true,
        type: 'particles',
        speed: 0.3,
        intensity: 0.4,
        particleCount: 50,
        particleSize: 2,
        connectionLines: true,
        mouseInteraction: false
      },
      effects: {
        blur: false,
        glow: false,
        parallax: true,
        chromatic: false,
        noise: false,
        vignette: false
      }
    },
    {
      id: 'dark',
      name: '暗夜',
      primary: '#bb86fc',
      secondary: '#03dac6',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      surface: 'rgba(255, 255, 255, 0.05)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      particleColor: '#bb86fc',
      backgroundImage: {
          enabled: false,
          url: '',
          opacity: 0.8,
          blendMode: 'overlay',
          position: 'center',
          size: 'cover',
          repeat: 'no-repeat'
        },
      animation: {
        enabled: true,
        type: 'particles',
        speed: 1.2,
        intensity: 0.9,
        particleCount: 100,
        particleSize: 4,
        connectionLines: false,
        mouseInteraction: true
      },
      effects: {
        blur: true,
        glow: true,
        parallax: false,
        chromatic: true,
        noise: true,
        vignette: true
      }
    },
    {
      id: 'cyberpunk',
      name: '赛博朋克',
      primary: '#ff0080',
      secondary: '#00ffff',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #330066 100%)',
      surface: 'rgba(255, 0, 128, 0.1)',
      text: '#00ffff',
      textSecondary: 'rgba(0, 255, 255, 0.7)',
      border: 'rgba(255, 0, 128, 0.3)',
      shadow: '0 0 20px rgba(255, 0, 128, 0.5)',
      gradient: 'linear-gradient(135deg, #ff0080 0%, #00ffff 100%)',
      particleColor: '#ff0080',
      backgroundImage: {
          enabled: false,
          url: '',
          opacity: 0.8,
          blendMode: 'overlay',
          position: 'center',
          size: 'cover',
          repeat: 'no-repeat'
        },
      animation: {
        enabled: false,
        type: 'none',
        speed: 0,
        intensity: 0,
        particleCount: 0,
        particleSize: 0,
        connectionLines: false,
        mouseInteraction: false
      },
      effects: {
        blur: false,
        glow: false,
        parallax: false,
        chromatic: false,
        noise: false,
        vignette: false
      }
    },
    {
      id: 'spring',
      name: '春日',
      primary: '#ff6b9d',
      secondary: '#c44569',
      background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%)',
      surface: 'rgba(255, 255, 255, 0.2)',
      text: '#2d3436',
      textSecondary: 'rgba(45, 52, 54, 0.7)',
      border: 'rgba(255, 107, 157, 0.3)',
      shadow: '0 8px 32px rgba(255, 107, 157, 0.2)',
      gradient: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
      particleColor: '#ff6b9d',
      backgroundImage: {
        enabled: false,
        url: '',
        opacity: 0.8,
        blendMode: 'overlay',
        position: 'center',
        size: 'cover',
        repeat: 'no-repeat'
      },
      animation: {
        enabled: true,
        type: 'gradient',
        speed: 0.4,
        intensity: 0.5,
        particleCount: 30,
        particleSize: 3,
        connectionLines: false,
        mouseInteraction: true
      },
      effects: {
        blur: false,
        glow: false,
        parallax: true,
        chromatic: false,
        noise: false,
        vignette: false
      }
    },
    {
      id: 'galaxy',
      name: '星河',
      primary: '#8e44ad',
      secondary: '#3498db',
      background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
      surface: 'rgba(255, 255, 255, 0.08)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(142, 68, 173, 0.3)',
      shadow: '0 8px 32px rgba(142, 68, 173, 0.4)',
      gradient: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)',
      particleColor: '#8e44ad',
      backgroundImage: {
        enabled: false,
        url: '',
        opacity: 0.8,
        blendMode: 'overlay',
        position: 'center',
        size: 'cover',
        repeat: 'no-repeat'
      },
      animation: {
        enabled: true,
        type: 'particles',
        speed: 0.6,
        intensity: 0.8,
        particleCount: 120,
        particleSize: 2,
        connectionLines: true,
        mouseInteraction: true
      },
      effects: {
        blur: true,
        glow: true,
        parallax: true,
        chromatic: false,
        noise: false,
        vignette: true
      }
    }
  ])
  
  // 当前主题
  const currentTheme = computed(() => {
    return themes.value.find(theme => theme.id === currentThemeId.value) || themes.value[0]
  })
  
  // 切换主题
  const setTheme = (themeId: string) => {
    const theme = themes.value.find(t => t.id === themeId)
    if (theme) {
      currentThemeId.value = themeId
      applyTheme(theme)
      saveThemeToStorage(themeId)
    }
  }
  
  // 应用主题到CSS变量
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-secondary', theme.secondary)
    root.style.setProperty('--theme-background', theme.background)
    root.style.setProperty('--theme-surface', theme.surface)
    root.style.setProperty('--theme-text', theme.text)
    root.style.setProperty('--theme-text-secondary', theme.textSecondary)
    root.style.setProperty('--theme-border', theme.border)
    root.style.setProperty('--theme-shadow', theme.shadow)
    root.style.setProperty('--theme-gradient', theme.gradient)
    root.style.setProperty('--theme-particle-color', theme.particleColor)
    
    // 应用动画和特效相关的CSS变量
    root.style.setProperty('--theme-animation-enabled', theme.animation.enabled ? '1' : '0')
    root.style.setProperty('--theme-animation-speed', theme.animation.speed.toString())
    root.style.setProperty('--theme-animation-intensity', theme.animation.intensity.toString())
    root.style.setProperty('--theme-blur-enabled', theme.effects.blur ? '1' : '0')
    root.style.setProperty('--theme-glow-enabled', theme.effects.glow ? '1' : '0')
    root.style.setProperty('--theme-parallax-enabled', theme.effects.parallax ? '1' : '0')
  }
  
  // 保存主题到本地存储
  const saveThemeToStorage = (themeId: string) => {
    try {
      localStorage.setItem('kela-diary-theme', themeId)
      // 同时保存自定义主题配置
      localStorage.setItem('kela-diary-themes', JSON.stringify(themes.value))
    } catch (error) {
      console.error('保存主题失败:', error)
    }
  }
  
  // 从本地存储加载主题
  const loadThemeFromStorage = () => {
    try {
      // 加载自定义主题配置
      const savedThemes = localStorage.getItem('kela-diary-themes')
      if (savedThemes) {
        const parsedThemes = JSON.parse(savedThemes)
        if (Array.isArray(parsedThemes) && parsedThemes.length > 0) {
          themes.value = parsedThemes
        }
      }
      
      // 加载当前主题
      const savedTheme = localStorage.getItem('kela-diary-theme')
      if (savedTheme && themes.value.find(t => t.id === savedTheme)) {
        setTheme(savedTheme)
      } else {
        setTheme('aurora') // 默认主题
      }
    } catch (error) {
      console.error('加载主题失败:', error)
      setTheme('aurora')
    }
  }
  
  // 初始化主题
  const initTheme = () => {
    loadThemeFromStorage()
  }
  
  // 创建自定义主题
  const createCustomTheme = (baseThemeId: string, customName: string) => {
    const baseTheme = themes.value.find(t => t.id === baseThemeId)
    if (!baseTheme) return null
    
    const customTheme: Theme = {
      ...JSON.parse(JSON.stringify(baseTheme)), // 深拷贝
      id: `custom-${Date.now()}`,
      name: customName,
      isCustom: true
    }
    
    themes.value.push(customTheme)
    saveThemeToStorage(currentThemeId.value)
    return customTheme
  }
  
  // 更新主题配置
  const updateTheme = (themeId: string, updates: Partial<Theme>) => {
    const themeIndex = themes.value.findIndex(t => t.id === themeId)
    if (themeIndex === -1) return false
    
    themes.value[themeIndex] = { ...themes.value[themeIndex], ...updates }
    
    // 如果更新的是当前主题，立即应用
    if (themeId === currentThemeId.value) {
      applyTheme(themes.value[themeIndex])
    }
    
    saveThemeToStorage(currentThemeId.value)
    return true
  }
  
  // 删除自定义主题
  const deleteCustomTheme = (themeId: string) => {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme || !theme.isCustom) return false
    
    themes.value = themes.value.filter(t => t.id !== themeId)
    
    // 如果删除的是当前主题，切换到默认主题
    if (themeId === currentThemeId.value) {
      setTheme('aurora')
    }
    
    saveThemeToStorage(currentThemeId.value)
    return true
  }
  
  // 重置主题到默认配置
   const resetTheme = (themeId: string) => {
     const defaultThemes = themes.value.filter(t => !t.isCustom)
     
     const defaultTheme = defaultThemes.find(t => t.id === themeId)
     if (!defaultTheme) return false
     
     const themeIndex = themes.value.findIndex(t => t.id === themeId)
     if (themeIndex === -1) return false
     
     themes.value[themeIndex] = { ...defaultTheme }
     
     // 如果重置的是当前主题，立即应用
     if (themeId === currentThemeId.value) {
       applyTheme(themes.value[themeIndex])
     }
     
     saveThemeToStorage(currentThemeId.value)
     return true
   }

  return {
    currentThemeId,
    themes,
    currentTheme,
    setTheme,
    applyTheme,
    initTheme,
    createCustomTheme,
    updateTheme,
    deleteCustomTheme,
    resetTheme
  }
})