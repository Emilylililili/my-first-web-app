<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  // 当前进度值 (0-100)
  value: number
  // 最大值，默认100
  max?: number
  // 进度条高度
  height?: string
  // 进度条颜色
  color?: string
  // 背景颜色
  backgroundColor?: string
  // 是否显示百分比文字
  showPercentage?: boolean
  // 是否显示具体数值
  showValue?: boolean
  // 自定义标签
  label?: string
  // 是否启用动画
  animated?: boolean
  // 是否显示条纹
  striped?: boolean
  // 圆角大小
  borderRadius?: string
  // 完成任务数
  completedTasks?: number
  // 总任务数
  totalTasks?: number
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  height: '20px',
  color: '#409eff',
  backgroundColor: '#f5f7fa',
  showPercentage: true,
  showValue: false,
  animated: true,
  striped: false,
  borderRadius: '10px',
  completedTasks: 0,
  totalTasks: 0
})

// 计算进度百分比
const percentage = computed(() => {
  const percent = Math.min(Math.max((props.value / props.max) * 100, 0), 100)
  return Math.round(percent * 100) / 100 // 保留两位小数
})

// 计算进度条颜色
const progressColor = computed(() => {
  if (percentage.value >= 100) return '#67c23a' // 绿色 - 完成
  if (percentage.value >= 80) return '#e6a23c'  // 橙色 - 接近完成
  if (percentage.value >= 50) return '#409eff'  // 蓝色 - 进行中
  return '#f56c6c' // 红色 - 刚开始
})

// 悬停状态
const isHovered = ref(false)

// 进度条样式
const progressBarStyle = computed(() => ({
  height: props.height,
  backgroundColor: props.backgroundColor,
  borderRadius: props.borderRadius,
  overflow: 'hidden',
  position: 'relative' as const,
  transition: 'all 0.3s ease'
}))

// 进度填充样式
const progressFillStyle = computed(() => ({
  width: `${percentage.value}%`,
  height: '100%',
  backgroundColor: props.color || progressColor.value,
  transition: props.animated ? 'width 0.6s ease, background-color 0.3s ease' : 'none',
  borderRadius: props.borderRadius,
  position: 'relative' as const,
  overflow: 'hidden'
}))

// 条纹样式
const stripedStyle = computed(() => {
  if (!props.striped) return {}
  return {
    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)',
    backgroundSize: '1rem 1rem',
    animation: props.animated ? 'progress-bar-stripes 1s linear infinite' : 'none'
  }
})

// 获取状态文本
const statusText = computed(() => {
  if (percentage.value >= 100) return '已完成'
  if (percentage.value >= 80) return '即将完成'
  if (percentage.value >= 50) return '进行中'
  if (percentage.value > 0) return '已开始'
  return '未开始'
})
</script>

<template>
  <div class="progress-container">
    <!-- 标签和状态 -->
    <div v-if="label || showValue || showPercentage" class="progress-header">
      <span v-if="label" class="progress-label">{{ label }}</span>
      <div class="progress-info">
        <span v-if="showValue && totalTasks > 0" class="progress-value">
          {{ completedTasks }}/{{ totalTasks }} 任务
        </span>
        <span v-if="showPercentage" class="progress-percentage">
          {{ percentage }}%
        </span>
      </div>
    </div>
    
    <!-- 进度条主体 -->
    <div 
      class="progress-bar"
      :style="progressBarStyle"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <div 
        class="progress-fill"
        :style="{ ...progressFillStyle, ...stripedStyle }"
      >
        <!-- 进度条内文字 -->
        <div v-if="showPercentage && percentage > 15" class="progress-text">
          {{ percentage }}%
        </div>
      </div>
      
      <!-- 悬停提示 -->
      <div v-if="isHovered" class="progress-tooltip">
        <div class="tooltip-content">
          <div class="tooltip-title">{{ label || '任务进度' }}</div>
          <div class="tooltip-details">
            <div v-if="totalTasks > 0">
              <span class="tooltip-label">完成任务:</span>
              <span class="tooltip-value">{{ completedTasks }}/{{ totalTasks }}</span>
            </div>
            <div>
              <span class="tooltip-label">完成率:</span>
              <span class="tooltip-value">{{ percentage }}%</span>
            </div>
            <div>
              <span class="tooltip-label">状态:</span>
              <span class="tooltip-value" :class="`status-${statusText}`">{{ statusText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  width: 100%;
  margin: 8px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.progress-label {
  font-weight: 500;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.progress-value {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.progress-percentage {
  color: white;
  font-weight: 600;
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.progress-bar {
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.progress-bar:hover {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.progress-fill {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
}

.progress-text {
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.progress-tooltip {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
  animation: fadeInUp 0.2s ease;
}

.tooltip-content {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  backdrop-filter: blur(10px);
}

.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.tooltip-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tooltip-details > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tooltip-label {
  font-size: 12px;
  opacity: 0.8;
}

.tooltip-value {
  font-size: 12px;
  font-weight: 500;
}

.status-已完成 {
  color: #67c23a;
}

.status-即将完成 {
  color: #e6a23c;
}

.status-进行中 {
  color: #409eff;
}

.status-已开始 {
  color: #f56c6c;
}

.status-未开始 {
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .progress-info {
    gap: 8px;
  }
  
  .tooltip-content {
    min-width: 160px;
    padding: 10px 12px;
  }
  
  .progress-bar {
    height: 16px !important;
  }
}

@media (max-width: 480px) {
  .progress-container {
    margin: 6px 0;
  }
  
  .progress-header {
    margin-bottom: 6px;
  }
  
  .progress-label,
  .progress-value,
  .progress-percentage {
    font-size: 12px;
  }
  
  .progress-bar {
    height: 14px !important;
  }
  
  .progress-text {
    font-size: 10px;
  }
}

/* 动画 */
@keyframes progress-bar-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 无障碍支持 */
.progress-bar:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .progress-fill,
  .progress-bar,
  .progress-tooltip {
    transition: none;
    animation: none;
  }
}
</style>