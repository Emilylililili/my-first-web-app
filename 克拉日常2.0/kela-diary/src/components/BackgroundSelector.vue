<script setup lang="ts">
import { ref, computed } from 'vue'
import { Picture, Close } from '@element-plus/icons-vue'

interface BackgroundOption {
  id: string
  name: string
  preview: string
  url: string
  category: 'abstract' | 'nature' | 'space' | 'geometric'
}

const props = defineProps<{
  modelValue?: {
    enabled: boolean
    url: string
    opacity: number
    blendMode: string
    position: string
    size: string
    repeat: string
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
}>()

// 预设背景图片
const backgroundOptions: BackgroundOption[] = [
  {
    id: 'abstract-waves',
    name: '抽象波浪',
    preview: '/src/assets/backgrounds/abstract-waves.svg',
    url: '/src/assets/backgrounds/abstract-waves.svg',
    category: 'abstract'
  },
  {
    id: 'geometric-pattern',
    name: '几何图案',
    preview: '/src/assets/backgrounds/geometric-pattern.svg',
    url: '/src/assets/backgrounds/geometric-pattern.svg',
    category: 'geometric'
  },
  {
    id: 'aurora-lights',
    name: '极光夜空',
    preview: '/src/assets/backgrounds/aurora-lights.svg',
    url: '/src/assets/backgrounds/aurora-lights.svg',
    category: 'nature'
  },
  {
    id: 'mountain-sunset',
    name: '山峦日落',
    preview: '/src/assets/backgrounds/mountain-sunset.svg',
    url: '/src/assets/backgrounds/mountain-sunset.svg',
    category: 'nature'
  },
  {
    id: 'space-nebula',
    name: '星云空间',
    preview: '/src/assets/backgrounds/space-nebula.svg',
    url: '/src/assets/backgrounds/space-nebula.svg',
    category: 'space'
  }
]

const categories = [
  { label: '全部', value: 'all' },
  { label: '抽象', value: 'abstract' },
  { label: '自然', value: 'nature' },
  { label: '太空', value: 'space' },
  { label: '几何', value: 'geometric' }
]

const selectedCategory = ref('all')
const showSelector = ref(false)

const filteredBackgrounds = computed(() => {
  if (selectedCategory.value === 'all') {
    return backgroundOptions
  }
  return backgroundOptions.filter(bg => bg.category === selectedCategory.value)
})

const currentBackground = computed({
  get: () => props.modelValue || {
    enabled: false,
    url: '',
    opacity: 0.8,
    blendMode: 'overlay',
    position: 'center',
    size: 'cover',
    repeat: 'no-repeat'
  },
  set: (value) => {
    emit('update:modelValue', value)
  }
})

const selectBackground = (background: BackgroundOption) => {
  currentBackground.value = {
    ...currentBackground.value,
    enabled: true,
    url: background.url
  }
  showSelector.value = false
}

const removeBackground = () => {
  currentBackground.value = {
    ...currentBackground.value,
    enabled: false,
    url: ''
  }
}

const openSelector = () => {
  showSelector.value = true
}

const closeSelector = () => {
  showSelector.value = false
}

defineExpose({
  openSelector
})
</script>

<template>
  <div class="background-selector">
    <!-- 当前背景预览 -->
    <div class="current-background">
      <div class="background-preview" @click="openSelector">
        <div 
          v-if="currentBackground.enabled && currentBackground.url"
          class="preview-image"
          :style="{
            backgroundImage: `url(${currentBackground.url})`,
            backgroundSize: currentBackground.size,
            backgroundPosition: currentBackground.position,
            backgroundRepeat: currentBackground.repeat,
            opacity: currentBackground.opacity
          }"
        >
          <div class="preview-overlay">
            <el-icon><Picture /></el-icon>
            <span>更换背景</span>
          </div>
        </div>
        <div v-else class="no-background">
          <el-icon><Picture /></el-icon>
          <span>选择背景图片</span>
        </div>
      </div>
      
      <el-button 
        v-if="currentBackground.enabled"
        @click="removeBackground"
        type="danger"
        size="small"
        :icon="Close"
        circle
        class="remove-btn"
      />
    </div>

    <!-- 背景选择器弹窗 -->
    <el-dialog
      v-model="showSelector"
      title="选择背景图片"
      width="80%"
      :before-close="closeSelector"
      append-to-body
    >
      <!-- 分类筛选 -->
      <div class="category-filter">
        <el-radio-group v-model="selectedCategory">
          <el-radio-button
            v-for="category in categories"
            :key="category.value"
            :label="category.value"
          >
            {{ category.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 背景图片网格 -->
      <div class="background-grid">
        <div
          v-for="background in filteredBackgrounds"
          :key="background.id"
          class="background-item"
          :class="{ 'selected': currentBackground.url === background.url }"
          @click="selectBackground(background)"
        >
          <div 
            class="background-thumbnail"
            :style="{ backgroundImage: `url(${background.preview})` }"
          >
            <div class="thumbnail-overlay">
              <span class="background-name">{{ background.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.background-selector {
  position: relative;
}

.current-background {
  position: relative;
  display: inline-block;
}

.background-preview {
  width: 200px;
  height: 120px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.background-preview:hover {
  border-color: var(--el-color-primary);
  transform: scale(1.02);
}

.preview-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.preview-overlay,
.no-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.no-background {
  opacity: 1;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.background-preview:hover .preview-overlay {
  opacity: 1;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 10;
}

.category-filter {
  margin-bottom: 20px;
  text-align: center;
}

.background-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.background-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.background-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.background-item.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.background-thumbnail {
  width: 100%;
  height: 120px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.thumbnail-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 8px 12px;
  color: white;
}

.background-name {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .background-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .background-preview {
    width: 150px;
    height: 90px;
  }
}
</style>