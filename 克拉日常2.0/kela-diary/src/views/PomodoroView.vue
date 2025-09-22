<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import PomodoroCard from '@/components/PomodoroCard.vue'

// 类型定义
type PomodoroState = 'work' | 'shortBreak' | 'longBreak'
type TimerStatus = 'idle' | 'running' | 'paused'

// 时间配置（分钟）
const TIME_CONFIG = {
  work: 25,
  shortBreak: 5,
  longBreak: 15
}

// 响应式状态
const currentState = ref<PomodoroState>('work')
const timerStatus = ref<TimerStatus>('idle')
const timeLeft = ref(TIME_CONFIG.work * 60) // 转换为秒
const completedSessions = ref(0)
const currentCycle = ref(1)

// 计时器
let timerInterval: NodeJS.Timeout | null = null

// 通知权限
const notificationPermission = ref<NotificationPermission>('default')

// 计算属性
const totalTime = computed(() => TIME_CONFIG[currentState.value] * 60)
const progress = computed(() => {
  return ((totalTime.value - timeLeft.value) / totalTime.value) * 100
})

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const sessionType = computed(() => {
  const typeMap = {
    work: 'work' as const,
    shortBreak: 'break' as const,
    longBreak: 'longBreak' as const
  }
  return typeMap[currentState.value]
})

const cardTitle = computed(() => {
  const titles = {
    work: '专注工作',
    shortBreak: '短暂休息',
    longBreak: '长时间休息'
  }
  return titles[currentState.value]
})

const totalSessions = computed(() => {
  return currentCycle.value * 4 // 每个周期4个番茄钟
})

const isRunning = computed(() => timerStatus.value === 'running')
const isPaused = computed(() => timerStatus.value === 'paused')

// 方法
const startTimer = () => {
  if (timerStatus.value === 'idle') {
    timerStatus.value = 'running'
  } else if (timerStatus.value === 'paused') {
    timerStatus.value = 'running'
  }
  
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      completeSession()
    }
  }, 1000)
}

const pauseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  timerStatus.value = 'paused'
}

const resetTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  timerStatus.value = 'idle'
  timeLeft.value = totalTime.value
}

const completeSession = () => {
  pauseTimer()
  playNotificationSound()
  showNotification()
  
  if (currentState.value === 'work') {
    completedSessions.value++
    // 每4个工作周期后进行长休息
    if (completedSessions.value % 4 === 0) {
      switchToState('longBreak')
    } else {
      switchToState('shortBreak')
    }
  } else {
    // 休息结束，回到工作状态
    switchToState('work')
    if (currentState.value === 'longBreak') {
      currentCycle.value++
    }
  }
}

const switchToState = (state: PomodoroState) => {
  currentState.value = state
  resetTimer()
}

const playNotificationSound = () => {
  try {
    const audioContext = new AudioContext()
    
    // 创建主音调
    const oscillator1 = audioContext.createOscillator()
    const gainNode1 = audioContext.createGain()
    
    // 创建和声
    const oscillator2 = audioContext.createOscillator()
    const gainNode2 = audioContext.createGain()
    
    // 连接音频节点
    oscillator1.connect(gainNode1)
    oscillator2.connect(gainNode2)
    gainNode1.connect(audioContext.destination)
    gainNode2.connect(audioContext.destination)
    
    // 设置频率和音量
    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime)
    
    gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime)
    
    // 创建淡出效果
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
    
    // 播放音频
    oscillator1.start(audioContext.currentTime)
    oscillator2.start(audioContext.currentTime + 0.1)
    oscillator1.stop(audioContext.currentTime + 0.8)
    oscillator2.stop(audioContext.currentTime + 0.9)
  } catch (error) {
    console.warn('无法播放提示音:', error)
  }
}

const showNotification = () => {
  const title = `${cardTitle.value}完成！`
  const message = currentState.value === 'work' 
    ? `恭喜完成第 ${completedSessions.value} 个专注时段！` 
    : '休息时间结束，准备开始新的专注！'
  
  // 显示应用内通知
  ElNotification({
    title,
    message,
    type: 'success',
    duration: 5000,
    showClose: true
  })
  
  // 显示浏览器通知
  if (notificationPermission.value === 'granted') {
    try {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'pomodoro-timer',
        requireInteraction: true
      })
      
      // 5秒后自动关闭
      setTimeout(() => {
        notification.close()
      }, 5000)
      
      // 点击通知时聚焦窗口
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } catch (error) {
      console.warn('无法显示浏览器通知:', error)
    }
  }
}

const resetAll = () => {
  resetTimer()
  completedSessions.value = 0
  currentCycle.value = 1
  currentState.value = 'work'
}

// PomodoroCard事件处理
const handleStart = () => {
  startTimer()
}

const handlePause = () => {
  pauseTimer()
}

const handleReset = () => {
  resetTimer()
}

const handleSkip = () => {
  completeSession()
}

// 监听状态变化更新页面标题
watch([timerStatus, timeLeft, currentState], () => {
  if (timerStatus.value === 'running') {
    document.title = `${formattedTime.value} - ${cardTitle.value} | 克拉日常`
  } else {
    document.title = '番茄钟 | 克拉日常'
  }
})

// 请求通知权限
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission()
      notificationPermission.value = permission
      if (permission === 'granted') {
        ElMessage.success('通知权限已开启')
      } else if (permission === 'denied') {
        ElMessage.warning('通知权限被拒绝，将只显示应用内通知')
      }
    } catch (error) {
      console.warn('请求通知权限失败:', error)
    }
  }
}

// 生命周期
onMounted(() => {
  timeLeft.value = totalTime.value
  
  // 检查通知权限
  if ('Notification' in window) {
    notificationPermission.value = Notification.permission
    if (notificationPermission.value === 'default') {
      // 延迟请求权限，避免页面加载时立即弹出
      setTimeout(requestNotificationPermission, 2000)
    }
  }
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  document.title = '克拉日常'
})
</script>

<template>
  <div class="pomodoro-container">
    <!-- 使用新的PomodoroCard组件 -->
    <PomodoroCard
      :title="cardTitle"
      :time-remaining="timeLeft"
      :total-time="totalTime"
      :is-running="isRunning"
      :current-session="completedSessions + 1"
      :total-sessions="totalSessions"
      :session-type="sessionType"
      @start="handleStart"
      @pause="handlePause"
      @reset="handleReset"
      @skip="handleSkip"
    />
    
    <!-- 状态切换按钮 -->
    <div class="state-controls">
      <button 
        v-for="state in ['work', 'shortBreak', 'longBreak'] as PomodoroState[]"
        :key="state"
        :class="['state-btn', { active: currentState === state }]"
        @click="switchToState(state)"
        :disabled="isRunning"
      >
        {{ state === 'work' ? '工作' : state === 'shortBreak' ? '短休息' : '长休息' }}
      </button>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ completedSessions }}</div>
        <div class="stat-label">已完成番茄钟</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ currentCycle }}</div>
        <div class="stat-label">当前轮次</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ Math.floor(completedSessions * 25 / 60) }}</div>
        <div class="stat-label">专注小时</div>
      </div>
    </div>

    <!-- 重置所有按钮 -->
    <div class="reset-section">
      <button 
        class="reset-btn"
        @click="resetAll"
        :disabled="isRunning"
      >
        重置所有数据
      </button>
    </div>
  </div>
</template>

<style scoped>
.pomodoro-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  gap: 2rem;
}

.state-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.state-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
}

.state-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateY(-2px);
}

.state-btn.active {
  background: rgba(168, 85, 247, 0.8);
  border-color: rgba(168, 85, 247, 0.8);
  color: white;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.state-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.stats-section {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  min-width: 120px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.reset-section {
  display: flex;
  justify-content: center;
}

.reset-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
  color: rgba(239, 68, 68, 0.9);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(239, 68, 68);
  transform: translateY(-1px);
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pomodoro-container {
    padding: 1rem;
    gap: 1.5rem;
  }
  
  .state-controls {
    gap: 0.5rem;
  }
  
  .state-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  .stats-section {
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
    min-width: 100px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .state-controls {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
  
  .state-btn {
    width: 100%;
  }
  
  .stats-section {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
  
  .stat-card {
    width: 100%;
  }
}

</style>