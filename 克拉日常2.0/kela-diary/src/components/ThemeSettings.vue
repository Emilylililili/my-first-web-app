<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Setting,
  Brush,
  VideoPlay,
  Close,
  Check,
  Picture
} from '@element-plus/icons-vue'
import { useThemeStore } from '../stores/theme'
import type { Theme } from '../stores/theme'
import { generateDynamicTheme, type AiModel } from '../services/aiBackground'
import BackgroundSelector from './BackgroundSelector.vue'

const themeStore = useThemeStore()
const showSettings = ref(false)

// 当前主题的副本，用于实时预览
const previewTheme = ref<Theme | null>(null)

// 打开设置面板
const openSettings = () => {
  showSettings.value = true
  previewTheme.value = JSON.parse(JSON.stringify(themeStore.currentTheme))
  // 确保backgroundImage属性存在
  if (previewTheme.value && !previewTheme.value.backgroundImage) {
    previewTheme.value.backgroundImage = {
      enabled: false,
      url: '',
      opacity: 0.8,
      blendMode: 'overlay',
      position: 'center',
      size: 'cover',
      repeat: 'no-repeat'
    }
  }
}

// 关闭设置面板
const closeSettings = () => {
  showSettings.value = false
  previewTheme.value = null
}

// 应用预览主题
const applyPreview = () => {
  if (previewTheme.value) {
    // 临时应用预览主题
    themeStore.applyTheme(previewTheme.value)
  }
}

// 保存设置：调用 store 的 updateTheme 会自动持久化并在当前主题时立即应用
const saveSettings = () => {
  if (!previewTheme.value) return
  const themeId = previewTheme.value.id
  const updates = { ...previewTheme.value }
  const ok = themeStore.updateTheme(themeId, updates)
  if (ok) {
    // 确保当前主题为保存的主题并已应用
    themeStore.setTheme(themeId)
  }
  closeSettings()
}

// 重置设置
const resetSettings = () => {
  if (previewTheme.value) {
    const originalTheme = themeStore.themes.find(t => t.id === previewTheme.value!.id)
    if (originalTheme) {
      previewTheme.value = JSON.parse(JSON.stringify(originalTheme))
      // 确保backgroundImage属性存在
      if (previewTheme.value && !previewTheme.value.backgroundImage) {
        previewTheme.value.backgroundImage = {
          enabled: false,
          url: '',
          opacity: 0.8,
          blendMode: 'overlay',
          position: 'center',
          size: 'cover',
          repeat: 'no-repeat'
        }
      }
      applyPreview()
    }
  }
}

// 动画类型选项
const animationTypes = [
  { label: '无动画', value: 'none' },
  { label: '粒子效果', value: 'particles' },
  { label: '漂浮粒子', value: 'floating' },
  { label: '螺旋粒子', value: 'spiral' },
  { label: '波浪效果', value: 'waves' },
  { label: '渐变动画', value: 'gradient' }
]

// 监听预览主题变化
const onPreviewChange = () => {
  applyPreview()
}

// 暴露方法给父组件
defineExpose({
  openSettings
})

// 初始化一次，避免首次打开时内容为空
onMounted(() => {
  if (!previewTheme.value) {
    previewTheme.value = JSON.parse(JSON.stringify(themeStore.currentTheme))
    // 确保backgroundImage属性存在
    if (previewTheme.value && !previewTheme.value.backgroundImage) {
      previewTheme.value.backgroundImage = {
        enabled: false,
        url: '',
        opacity: 0.8,
        blendMode: 'overlay',
        position: 'center',
        size: 'cover',
        repeat: 'no-repeat'
      }
    }
  }
})

// AI 生成主题
const aiPrompt = ref('来一款锁屏风格、柔和绚丽的渐变动态主题')
const aiModel = ref<AiModel>('anthropic/claude-3.5-sonnet')
const aiLoading = ref(false)

const generateByAI = async () => {
  if (aiLoading.value) return
  aiLoading.value = true
  try {
    const result = await generateDynamicTheme(aiPrompt.value, aiModel.value)
    if (!previewTheme.value) return
    // 将 AI 结果映射到预览主题
    previewTheme.value.gradient = result.cssGradient || previewTheme.value.gradient
    previewTheme.value.particleColor = result.particlesColor || previewTheme.value.particleColor
    previewTheme.value.animation = {
      enabled: result.animation !== 'none',
      type: result.animation,
      speed: result.speed,
      intensity: result.intensity,
      particleCount: Math.floor(80 * result.intensity),
      particleSize: Math.max(2, Math.floor(4 * result.intensity)),
      connectionLines: result.animation === 'particles',
      mouseInteraction: true
    }
    if (result.themeName) {
      previewTheme.value.name = result.themeName
    }
    applyPreview()
  } catch (error) {
    console.error('AI主题生成失败:', error)
  } finally {
    aiLoading.value = false
  }
}
</script>

<template>
  <!-- 设置面板（入口由外部触发，这里不再渲染悬浮按钮） -->
  <el-drawer
    v-model="showSettings"
    title="主题设置"
    direction="rtl"
    size="400px"
    :before-close="closeSettings"
    append-to-body
    :z-index="3000"
  >
    <div v-if="previewTheme" class="settings-content">
      <!-- 基础颜色设置 -->
      <div class="setting-section">
        <h3 class="section-title">
          <el-icon><Brush /></el-icon>
          颜色配置
        </h3>
        
        <div class="color-grid">
          <div class="color-item">
            <label>主色调</label>
            <el-color-picker 
              v-model="previewTheme.primary"
              @change="onPreviewChange"
              show-alpha
            />
          </div>
          
          <div class="color-item">
            <label>辅助色</label>
            <el-color-picker 
              v-model="previewTheme.secondary"
              @change="onPreviewChange"
              show-alpha
            />
          </div>
          
          <div class="color-item">
            <label>文本颜色</label>
            <el-color-picker 
              v-model="previewTheme.text"
              @change="onPreviewChange"
              show-alpha
            />
          </div>
          
          <div class="color-item">
            <label>粒子颜色</label>
            <el-color-picker 
              v-model="previewTheme.particleColor"
              @change="onPreviewChange"
              show-alpha
            />
          </div>
        </div>
      </div>

      <!-- 动画设置 -->
      <div class="setting-section">
        <h3 class="section-title">
          <el-icon><VideoPlay /></el-icon>
          动画效果
        </h3>
        
        <div class="animation-controls">
          <div class="control-item">
            <label>启用动画</label>
            <el-switch 
              v-model="previewTheme.animation.enabled"
              @change="onPreviewChange"
            />
          </div>
          
          <div class="control-item">
            <label>动画类型</label>
            <el-select 
              v-model="previewTheme.animation.type"
              @change="onPreviewChange"
              :disabled="!previewTheme.animation.enabled"
            >
              <el-option
                v-for="type in animationTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </div>
          
          <div class="control-item">
            <label>动画速度: {{ previewTheme.animation.speed.toFixed(1) }}</label>
            <el-slider
              v-model="previewTheme.animation.speed"
              @change="onPreviewChange"
              :min="0.1"
              :max="3"
              :step="0.1"
              :disabled="!previewTheme.animation.enabled"
            />
          </div>
          
          <div class="control-item">
            <label>动画强度: {{ previewTheme.animation.intensity.toFixed(1) }}</label>
            <el-slider
              v-model="previewTheme.animation.intensity"
              @change="onPreviewChange"
              :min="0.1"
              :max="1"
              :step="0.1"
              :disabled="!previewTheme.animation.enabled"
            />
          </div>
          
          <div v-if="['particles', 'floating', 'spiral'].includes(previewTheme.animation.type)" class="particle-controls">
            <div class="control-item">
              <label>粒子数量: {{ previewTheme.animation.particleCount }}</label>
              <el-slider
                v-model="previewTheme.animation.particleCount"
                @change="onPreviewChange"
                :min="20"
                :max="200"
                :step="10"
                :disabled="!previewTheme.animation.enabled"
              />
            </div>
            
            <div class="control-item">
              <label>粒子大小: {{ previewTheme.animation.particleSize }}</label>
              <el-slider
                v-model="previewTheme.animation.particleSize"
                @change="onPreviewChange"
                :min="1"
                :max="8"
                :step="0.5"
                :disabled="!previewTheme.animation.enabled"
              />
            </div>
            
            <div class="control-item">
              <label>连接线</label>
              <el-switch 
                v-model="previewTheme.animation.connectionLines"
                @change="onPreviewChange"
                :disabled="!previewTheme.animation.enabled"
              />
            </div>
            
            <div class="control-item">
              <label>鼠标交互</label>
              <el-switch 
                v-model="previewTheme.animation.mouseInteraction"
                @change="onPreviewChange"
                :disabled="!previewTheme.animation.enabled"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 背景图片设置 -->
      <div class="setting-section">
        <h3 class="section-title">
          <el-icon><Picture /></el-icon>
          背景图片
        </h3>
        
        <div class="background-controls">
          <div class="control-item">
            <label>背景图片</label>
            <BackgroundSelector 
              v-model="previewTheme.backgroundImage"
              @update:modelValue="onPreviewChange"
            />
          </div>
          
          <div v-if="previewTheme.backgroundImage?.enabled" class="background-options">
            <div class="control-item">
              <label>透明度</label>
              <el-slider
                v-model="previewTheme.backgroundImage.opacity"
                :min="0.1"
                :max="1"
                :step="0.1"
                @change="onPreviewChange"
              />
            </div>
            
            <div class="control-item">
              <label>混合模式</label>
              <el-select 
                v-model="previewTheme.backgroundImage.blendMode"
                @change="onPreviewChange"
              >
                <el-option label="正常" value="normal" />
                <el-option label="叠加" value="overlay" />
                <el-option label="柔光" value="soft-light" />
                <el-option label="强光" value="hard-light" />
                <el-option label="正片叠底" value="multiply" />
                <el-option label="滤色" value="screen" />
              </el-select>
            </div>
            
            <div class="control-item">
              <label>尺寸</label>
              <el-select 
                v-model="previewTheme.backgroundImage.size"
                @change="onPreviewChange"
              >
                <el-option label="覆盖" value="cover" />
                <el-option label="包含" value="contain" />
                <el-option label="拉伸" value="100% 100%" />
                <el-option label="原始" value="auto" />
              </el-select>
            </div>
            
            <div class="control-item">
              <label>位置</label>
              <el-select 
                v-model="previewTheme.backgroundImage.position"
                @change="onPreviewChange"
              >
                <el-option label="居中" value="center" />
                <el-option label="左上" value="top left" />
                <el-option label="上方" value="top" />
                <el-option label="右上" value="top right" />
                <el-option label="左侧" value="left" />
                <el-option label="右侧" value="right" />
                <el-option label="左下" value="bottom left" />
                <el-option label="下方" value="bottom" />
                <el-option label="右下" value="bottom right" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <!-- 特效设置 -->
      <div class="setting-section">
        <h3 class="section-title">
          <el-icon><Setting /></el-icon>
          视觉特效
        </h3>
        
        <div class="effects-controls">
          <div class="effect-item">
            <label>模糊效果</label>
            <el-switch 
              v-model="previewTheme.effects.blur"
              @change="onPreviewChange"
            />
          </div>
          
          <div class="effect-item">
            <label>发光效果</label>
            <el-switch 
              v-model="previewTheme.effects.glow"
              @change="onPreviewChange"
            />
          </div>
          
          <div class="effect-item">
            <label>视差效果</label>
            <el-switch 
              v-model="previewTheme.effects.parallax"
              @change="onPreviewChange"
            />
          </div>
          
          <div class="effect-item">
            <label>色彩增强</label>
            <el-switch 
              v-model="previewTheme.effects.chromatic"
              @change="onPreviewChange"
            />
          </div>
          
          <div class="effect-item">
            <label>噪点效果</label>
            <el-switch 
              v-model="previewTheme.effects.noise"
              @change="onPreviewChange"
            />
          </div>
          
          <div class="effect-item">
            <label>暗角效果</label>
            <el-switch 
              v-model="previewTheme.effects.vignette"
              @change="onPreviewChange"
            />
          </div>
        </div>
      </div>

      <!-- 预设主题快速切换 -->
      <div class="setting-section">
        <h3 class="section-title">
          <el-icon><Brush /></el-icon>
          预设主题
        </h3>
        
        <div class="theme-presets">
          <div 
            v-for="theme in themeStore.themes"
            :key="theme.id"
            class="theme-preset"
            :class="{ 'active': theme.id === previewTheme.id }"
            @click="previewTheme = JSON.parse(JSON.stringify(theme)); onPreviewChange()"
          >
            <div 
              class="theme-preview"
              :style="{ background: theme.gradient }"
            ></div>
            <span class="theme-name">{{ theme.name }}</span>
          </div>
        </div>
      </div>

      <!-- AI 生成主题 -->
      <div class="setting-section">
        <h3 class="section-title">
          AI 生成动态主题
        </h3>
        <div class="ai-row">
          <el-select v-model="aiModel" style="width: 100%" :disabled="aiLoading">
            <el-option label="Anthropic Claude Sonnet 4" value="anthropic/claude-sonnet-4" />
            <el-option label="Google Gemini 2.5 Pro" value="google/gemini-2.5-pro" />
            <el-option label="OpenAI GPT-4o" value="openai/chatgpt-4o" />
          </el-select>
        </div>
        <div class="ai-row">
          <el-input v-model="aiPrompt" type="textarea" :rows="3" placeholder="描述你想要的主题/氛围/配色..." />
        </div>
        <div class="ai-row" style="text-align:right">
          <el-button :loading="aiLoading" type="primary" @click="generateByAI">生成</el-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <template #footer>
      <div class="settings-footer">
        <el-button @click="resetSettings">
          重置
        </el-button>
        <el-button @click="closeSettings">
          取消
        </el-button>
        <el-button type="primary" @click="saveSettings">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.settings-content {
  padding: 0 16px;
}

.setting-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

/* 颜色设置 */
.color-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-item label {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
}

/* 动画控制 */
.animation-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item label {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
}

.ai-row { margin: 8px 0; }

/* 背景控制 */
.background-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.background-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  margin-top: 8px;
}

/* 特效控制 */
.effects-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.effect-item label {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
}

/* 主题预设 */
.theme-presets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.theme-preset {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-preset:hover {
  border-color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

.theme-preset.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.theme-preview {
  width: 60px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
}

.theme-name {
  font-size: 0.8rem;
  color: var(--el-text-color-regular);
  text-align: center;
}

/* 底部操作 */
.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--el-border-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-settings-btn {
    bottom: 80px;
    right: 16px;
    width: 48px;
    height: 48px;
  }
  
  .color-grid {
    grid-template-columns: 1fr;
  }
  
  .theme-presets {
    grid-template-columns: 1fr;
  }
}
</style>