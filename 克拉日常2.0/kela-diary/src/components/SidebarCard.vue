<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { 
  Document, 
  Clock, 
  ChatDotRound, 
  Management,
  Plus,
  Filter,
  TrendCharts
} from '@element-plus/icons-vue'

interface Props {
  title?: string
  icon?: any
  variant?: 'primary' | 'secondary' | 'success' | 'info'
  glowColor?: string
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  variant: 'primary',
  glowColor: 'rgba(168, 85, 247, 0.8)',
  interactive: true
})

const emit = defineEmits<{
  click: []
}>()

const cardRef = ref<HTMLDivElement>()
const isHovered = ref(false)
const mousePosition = reactive({ x: 0, y: 0 })
const rotation = reactive({ x: 0, y: 0 })

// Variant colors
const variantColors = {
  primary: 'rgba(168, 85, 247, 0.8)',
  secondary: 'rgba(59, 130, 246, 0.8)',
  success: 'rgba(34, 197, 94, 0.8)',
  info: 'rgba(14, 165, 233, 0.8)'
}

const currentGlowColor = computed(() => {
  return props.glowColor || variantColors[props.variant]
})

// Handle mouse movement for 3D effect
const handleMouseMove = (e: MouseEvent) => {
  if (!props.interactive || !cardRef.value) return
  
  const rect = cardRef.value.getBoundingClientRect()
  
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  
  mousePosition.x = x
  mousePosition.y = y
  
  const rotateX = -(y / rect.height) * 2
  const rotateY = (x / rect.width) * 2
  
  rotation.x = rotateX
  rotation.y = rotateY
}

const handleMouseLeave = () => {
  isHovered.value = false
  rotation.x = 0
  rotation.y = 0
}

const handleMouseEnter = () => {
  if (props.interactive) {
    isHovered.value = true
  }
}

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <div 
    ref="cardRef"
    class="sidebar-card"
    :class="{ 
      hovered: isHovered, 
      interactive: interactive,
      [`variant-${variant}`]: true 
    }"
    :style="{
      transform: interactive ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(${isHovered ? '-4px' : '0'})` : 'none'
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @click="handleClick"
  >
    <!-- Glass reflection overlay -->
    <div 
      class="glass-reflection"
      :class="{ hovered: isHovered }"
    ></div>

    <!-- Dark background -->
    <div class="dark-background"></div>

    <!-- Noise texture -->
    <div class="noise-texture"></div>

    <!-- Dynamic glow -->
    <div 
      class="card-glow"
      :class="{ hovered: isHovered }"
      :style="{
        background: `radial-gradient(ellipse at center, ${currentGlowColor} -20%, transparent 70%)`
      }"
    ></div>

    <!-- Enhanced border glows -->
    <div 
      class="border-glow"
      :class="{ hovered: isHovered }"
      :style="{
        boxShadow: `0 0 15px 1px ${currentGlowColor}, 0 0 30px 2px ${currentGlowColor.replace('0.8', '0.3')}`
      }"
    ></div>

    <!-- Card content -->
    <div class="card-content">
      <slot>
        <div v-if="icon || title" class="default-content">
          <component 
            v-if="icon" 
            :is="icon" 
            class="card-icon"
            :style="{ color: currentGlowColor }"
          />
          <span v-if="title" class="card-title">{{ title }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.sidebar-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background-color: #0a0f1c;
  box-shadow: 
    0 -5px 40px 5px rgba(168, 85, 247, 0.1),
    0 0 15px 0 rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.sidebar-card.interactive {
  cursor: pointer;
}

.sidebar-card.interactive:hover {
  box-shadow: 
    0 -5px 60px 8px rgba(168, 85, 247, 0.2),
    0 0 25px 2px rgba(168, 85, 247, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.sidebar-card.variant-secondary:hover {
  box-shadow: 
    0 -5px 60px 8px rgba(59, 130, 246, 0.2),
    0 0 25px 2px rgba(59, 130, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.sidebar-card.variant-success:hover {
  box-shadow: 
    0 -5px 60px 8px rgba(34, 197, 94, 0.2),
    0 0 25px 2px rgba(34, 197, 94, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.sidebar-card.variant-info:hover {
  box-shadow: 
    0 -5px 60px 8px rgba(14, 165, 233, 0.2),
    0 0 25px 2px rgba(14, 165, 233, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.glass-reflection {
  position: absolute;
  inset: 0;
  z-index: 35;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%);
  backdrop-filter: blur(1px);
  opacity: 0.6;
  transition: opacity 0.3s ease-out;
}

.glass-reflection.hovered {
  opacity: 0.8;
}

.dark-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(180deg, #0a0f1c 0%, #000000 100%);
}

.noise-texture {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  mix-blend-mode: overlay;
  z-index: 10;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.card-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  z-index: 20;
  filter: blur(40px);
  opacity: 0.4;
  transition: all 0.3s ease-out;
}

.card-glow.hovered {
  opacity: 0.6;
}

.border-glow {
  position: absolute;
  inset: -1px;
  z-index: 25;
  border-radius: 17px;
  background: transparent;
  opacity: 0.5;
  transition: all 0.3s ease-out;
}

.border-glow.hovered {
  opacity: 0.8;
}

.card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.4rem 0.3rem;
  z-index: 40;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  box-sizing: border-box;
  overflow: hidden;
}

.default-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  text-align: center;
}

.card-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
  transition: all 0.3s ease;
  line-height: 1;
}

/* 统一 Element Plus 图标内部 svg 尺寸，避免不同图标视觉大小不一致 */
.card-icon :deep(svg) {
  width: 28px;
  height: 28px;
}

.card-title {
  color: rgba(255, 255, 255, 1);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  transition: all 0.3s ease;
  letter-spacing: 0.2px;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.sidebar-card.hovered .card-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
}

.sidebar-card.hovered .card-title {
  color: rgba(255, 255, 255, 1);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
}

/* Animation keyframes */
@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes borderPulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>