<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  title: string
  timeRemaining: number
  totalTime: number
  isRunning: boolean
  currentSession: number
  totalSessions: number
  sessionType: 'work' | 'break' | 'longBreak'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  start: []
  pause: []
  reset: []
  skip: []
}>()

const cardRef = ref<HTMLDivElement>()
const isHovered = ref(false)
const mousePosition = reactive({ x: 0, y: 0 })
const rotation = reactive({ x: 0, y: 0 })

// Computed properties
const progress = computed(() => {
  return ((props.totalTime - props.timeRemaining) / props.totalTime) * 100
})

const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60)
  const seconds = props.timeRemaining % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const sessionTypeText = computed(() => {
  switch (props.sessionType) {
    case 'work': return '专注时间'
    case 'break': return '短休息'
    case 'longBreak': return '长休息'
    default: return '番茄钟'
  }
})

const sessionTypeColor = computed(() => {
  switch (props.sessionType) {
    case 'work': return 'rgba(239, 68, 68, 0.8)' // Red
    case 'break': return 'rgba(34, 197, 94, 0.8)' // Green
    case 'longBreak': return 'rgba(59, 130, 246, 0.8)' // Blue
    default: return 'rgba(168, 85, 247, 0.8)' // Purple
  }
})

// Handle mouse movement for 3D effect
const handleMouseMove = (e: MouseEvent) => {
  if (cardRef.value) {
    const rect = cardRef.value.getBoundingClientRect()
    
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    mousePosition.x = x
    mousePosition.y = y
    
    const rotateX = -(y / rect.height) * 3
    const rotateY = (x / rect.width) * 3
    
    rotation.x = rotateX
    rotation.y = rotateY
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
  rotation.x = 0
  rotation.y = 0
}

const handleMouseEnter = () => {
  isHovered.value = true
}

// Event handlers
const handleStartPause = () => {
  if (props.isRunning) {
    emit('pause')
  } else {
    emit('start')
  }
}

const handleReset = () => {
  emit('reset')
}

const handleSkip = () => {
  emit('skip')
}
</script>

<template>
  <div class="pomodoro-card-container">
    <div
      ref="cardRef"
      class="pomodoro-card"
      :class="{ hovered: isHovered, running: isRunning }"
      :style="{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(${isHovered ? '-8px' : '0'})`
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
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

      <!-- Dynamic glow based on session type -->
      <div 
        class="session-glow"
        :class="{ hovered: isHovered, running: isRunning }"
        :style="{
          background: `radial-gradient(ellipse at bottom center, ${sessionTypeColor} -20%, transparent 60%)`
        }"
      ></div>

      <!-- Progress glow -->
      <div 
        class="progress-glow"
        :class="{ running: isRunning }"
        :style="{
          background: `conic-gradient(from 0deg at 50% 50%, ${sessionTypeColor} 0%, ${sessionTypeColor} ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
          opacity: progress > 0 ? 0.3 : 0
        }"
      ></div>

      <!-- Enhanced border glows -->
      <div 
        class="border-glow"
        :class="{ hovered: isHovered, running: isRunning }"
        :style="{
          boxShadow: `0 0 20px 2px ${sessionTypeColor}, 0 0 40px 4px ${sessionTypeColor.replace('0.8', '0.4')}`
        }"
      ></div>

      <!-- Card content -->
      <div class="card-content">
        <!-- Header with session info -->
        <div class="card-header">
          <div class="session-info">
            <h3 class="session-type">{{ sessionTypeText }}</h3>
            <div class="session-counter">
              {{ currentSession }} / {{ totalSessions }}
            </div>
          </div>
          
          <!-- Status indicator -->
          <div 
            class="status-indicator"
            :class="{ running: isRunning }"
            :style="{ backgroundColor: sessionTypeColor }"
          >
            <div class="status-pulse" :class="{ running: isRunning }"></div>
          </div>
        </div>

        <!-- Time display -->
        <div class="time-section">
          <div class="time-display">
            {{ formattedTime }}
          </div>
          
          <!-- Progress ring -->
          <div class="progress-ring">
            <svg class="progress-svg" width="200" height="200">
              <circle
                class="progress-background"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                stroke-width="4"
              />
              <circle
                class="progress-bar"
                :class="{ running: isRunning }"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                :stroke="sessionTypeColor"
                stroke-width="4"
                stroke-linecap="round"
                :stroke-dasharray="`${2 * Math.PI * 90}`"
                :stroke-dashoffset="`${2 * Math.PI * 90 * (1 - progress / 100)}`"
                transform="rotate(-90 100 100)"
              />
            </svg>
          </div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <button
            class="control-btn primary"
            :class="{ running: isRunning }"
            @click="handleStartPause"
          >
            <svg v-if="!isRunning" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            {{ isRunning ? '暂停' : '开始' }}
          </button>
          
          <button class="control-btn secondary" @click="handleReset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            重置
          </button>
          
          <button class="control-btn secondary" @click="handleSkip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
            跳过
          </button>
        </div>

        <!-- Progress indicator -->
        <div class="progress-indicator">
          <div class="progress-text">
            进度: {{ Math.round(progress) }}%
          </div>
          <div class="progress-bar-container">
            <div 
              class="progress-bar-fill"
              :style="{ 
                width: `${progress}%`,
                backgroundColor: sessionTypeColor
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pomodoro-card-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.pomodoro-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  width: 400px;
  height: 600px;
  transform-style: preserve-3d;
  background-color: #0a0f1c;
  box-shadow: 
    0 -10px 80px 10px rgba(168, 85, 247, 0.15),
    0 0 20px 0 rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.pomodoro-card.running {
  box-shadow: 
    0 -10px 100px 15px rgba(168, 85, 247, 0.25),
    0 0 30px 5px rgba(168, 85, 247, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.glass-reflection {
  position: absolute;
  inset: 0;
  z-index: 35;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
  backdrop-filter: blur(1px);
  opacity: 0.6;
  transition: opacity 0.4s ease-out;
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
  opacity: 0.2;
  mix-blend-mode: overlay;
  z-index: 10;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.session-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
  z-index: 20;
  filter: blur(60px);
  opacity: 0.6;
  transition: all 0.4s ease-out;
}

.session-glow.hovered {
  opacity: 0.8;
}

.session-glow.running {
  opacity: 0.9;
  animation: pulse 2s ease-in-out infinite;
}

.progress-glow {
  position: absolute;
  inset: 0;
  z-index: 21;
  border-radius: 24px;
  filter: blur(20px);
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

.progress-glow.running {
  animation: progressPulse 3s ease-in-out infinite;
}

.border-glow {
  position: absolute;
  inset: -2px;
  z-index: 25;
  border-radius: 26px;
  background: transparent;
  opacity: 0.7;
  transition: all 0.4s ease-out;
}

.border-glow.hovered {
  opacity: 0.9;
}

.border-glow.running {
  opacity: 1;
  animation: borderPulse 2s ease-in-out infinite;
}

.card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  z-index: 40;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.session-info {
  flex: 1;
}

.session-type {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.session-counter {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.status-indicator.running {
  opacity: 1;
}

.status-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: inherit;
  opacity: 0;
}

.status-pulse.running {
  animation: statusPulse 2s ease-in-out infinite;
}

.time-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
  position: relative;
}

.time-display {
  font-size: 3.5rem;
  font-weight: 300;
  color: white;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: -0.02em;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.progress-svg {
  transform: scale(0.8);
}

.progress-bar {
  transition: stroke-dashoffset 0.5s ease-in-out;
  filter: drop-shadow(0 0 8px currentColor);
}

.progress-bar.running {
  animation: progressGlow 2s ease-in-out infinite;
}

.controls {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn.primary {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(139, 92, 246, 0.8));
  color: white;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.control-btn.primary:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(139, 92, 246, 0.9));
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
  transform: translateY(-2px);
}

.control-btn.primary.running {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8));
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.control-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.control-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateY(-1px);
}

.progress-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.progress-bar-container {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease-in-out;
  box-shadow: 0 0 8px currentColor;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

@keyframes progressPulse {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.4; }
}

@keyframes borderPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes statusPulse {
  0% { opacity: 0; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.5); }
  100% { opacity: 0; transform: scale(2); }
}

@keyframes progressGlow {
  0%, 100% { filter: drop-shadow(0 0 8px currentColor); }
  50% { filter: drop-shadow(0 0 16px currentColor); }
}

@media (max-width: 768px) {
  .pomodoro-card {
    width: 350px;
    height: 550px;
  }
  
  .time-display {
    font-size: 3rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .pomodoro-card {
    width: 320px;
    height: 500px;
  }
  
  .time-display {
    font-size: 2.5rem;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .control-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>