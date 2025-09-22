<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  description?: string
  icon?: string
  linkText?: string
  linkHref?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI-Powered Inbox Sorting',
  subtitle: '',
  description: 'OpenMail revolutionizes email management with AI-driven sorting, boosting productivity and accessibility',
  icon: 'star',
  linkText: 'Learn More',
  linkHref: '#'
})

const cardRef = ref<HTMLDivElement>()
const isHovered = ref(false)
const mousePosition = reactive({ x: 0, y: 0 })
const rotation = reactive({ x: 0, y: 0 })

// Handle mouse movement for 3D effect
const handleMouseMove = (e: MouseEvent) => {
  if (cardRef.value) {
    const rect = cardRef.value.getBoundingClientRect()
    
    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    mousePosition.x = x
    mousePosition.y = y
    
    // Calculate rotation (limited range for subtle effect)
    const rotateX = -(y / rect.height) * 5 // Max 5 degrees rotation
    const rotateY = (x / rect.width) * 5 // Max 5 degrees rotation
    
    rotation.x = rotateX
    rotation.y = rotateY
  }
}

// Reset rotation when not hovering
const handleMouseLeave = () => {
  isHovered.value = false
  rotation.x = 0
  rotation.y = 0
}

const handleMouseEnter = () => {
  isHovered.value = true
}
</script>

<template>
  <div class="gradient-card-container">
    <!-- Card container with realistic 3D effect -->
    <div
      ref="cardRef"
      class="gradient-card"
      :class="{ hovered: isHovered }"
      :style="{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(${isHovered ? '-5px' : '0'})`
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
    >
      <!-- Subtle glass reflection overlay -->
      <div 
        class="glass-reflection"
        :class="{ hovered: isHovered }"
        :style="{
          transform: `rotateX(${-rotation.x * 0.2}deg) rotateY(${-rotation.y * 0.2}deg) translateZ(1px)`
        }"
      ></div>

      <!-- Dark background with black gradient -->
      <div class="dark-background"></div>

      <!-- Noise texture overlay -->
      <div class="noise-texture"></div>

      <!-- Subtle finger smudge texture for realism -->
      <div class="smudge-texture"></div>

      <!-- Purple/blue glow effect -->
      <div 
        class="purple-glow"
        :class="{ hovered: isHovered }"
        :style="{
          transform: `translateY(${isHovered ? rotation.x * 0.5 + 'px' : '0'})`
        }"
      ></div>

      <!-- Central purple glow -->
      <div 
        class="central-glow"
        :class="{ hovered: isHovered }"
        :style="{
          transform: `translateY(calc(10% + ${isHovered ? rotation.x * 0.3 : 0}px))`
        }"
      ></div>

      <!-- Enhanced bottom border glow -->
      <div class="bottom-glow" :class="{ hovered: isHovered }"></div>
      <div class="left-glow" :class="{ hovered: isHovered }"></div>
      <div class="left-corner-glow" :class="{ hovered: isHovered }"></div>
      <div class="right-glow" :class="{ hovered: isHovered }"></div>
      <div class="right-corner-glow" :class="{ hovered: isHovered }"></div>

      <!-- Card content -->
      <div class="card-content">
        <!-- Icon circle with shadow -->
        <div 
          class="icon-circle"
          :class="{ hovered: isHovered }"
          :style="{
            transform: `translateY(${isHovered ? '-2px' : '0'}) rotateX(${isHovered ? -rotation.x * 0.5 : 0}deg) rotateY(${isHovered ? -rotation.y * 0.5 : 0}deg)`
          }"
        >
          <!-- Top-left highlight for realistic lighting -->
          <div class="icon-highlight"></div>
          <!-- Bottom shadow for depth -->
          <div class="icon-shadow"></div>
          <!-- Star icon -->
          <div class="icon-container">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 0L9.4 5.4L14.8 5.4L10.6 8.8L12 14.2L8 10.8L4 14.2L5.4 8.8L1.2 5.4L6.6 5.4L8 0Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        <!-- Content positioning -->
        <div 
          class="content-text"
          :style="{
            transform: `rotateX(${isHovered ? -rotation.x * 0.3 : 0}deg) rotateY(${isHovered ? -rotation.y * 0.3 : 0}deg)`
          }"
        >
          <h3 class="card-title" :class="{ hovered: isHovered }">
            {{ title }}
          </h3>

          <p class="card-description" :class="{ hovered: isHovered }">
            {{ description }}
          </p>

          <!-- Learn More with arrow -->
          <a 
            :href="linkHref" 
            class="learn-more-link"
            :class="{ hovered: isHovered }"
          >
            {{ linkText }}
            <svg
              class="arrow-icon"
              :class="{ hovered: isHovered }"
              width="8"
              height="8"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 8H15M15 8L8 1M15 8L8 15"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-card-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-card {
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  width: 360px;
  height: 450px;
  transform-style: preserve-3d;
  background-color: #0e131f;
  box-shadow: 0 -10px 100px 10px rgba(78, 99, 255, 0.25), 0 0 10px 0 rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-reflection {
  position: absolute;
  inset: 0;
  z-index: 35;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%);
  backdrop-filter: blur(2px);
  opacity: 0.5;
  transition: opacity 0.4s ease-out;
}

.glass-reflection.hovered {
  opacity: 0.7;
}

.dark-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(180deg, #000000 0%, #000000 70%);
}

.noise-texture {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  mix-blend-mode: overlay;
  z-index: 10;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.smudge-texture {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  mix-blend-mode: soft-light;
  z-index: 11;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='smudge'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='3' seed='5' stitchTiles='stitch'/%3E%3CfeGaussianBlur stdDeviation='10'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23smudge)'/%3E%3C/svg%3E");
  backdrop-filter: blur(1px);
}

.purple-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 66.67%;
  z-index: 20;
  background: 
    radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.7) -10%, rgba(79, 70, 229, 0) 70%),
    radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.7) -10%, rgba(79, 70, 229, 0) 70%);
  filter: blur(40px);
  opacity: 0.8;
  transition: opacity 0.4s ease-out;
}

.purple-glow.hovered {
  opacity: 0.9;
}

.central-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 66.67%;
  z-index: 21;
  background: radial-gradient(circle at bottom center, rgba(161, 58, 229, 0.7) -20%, rgba(79, 70, 229, 0) 60%);
  filter: blur(45px);
  opacity: 0.75;
  transition: opacity 0.4s ease-out;
}

.central-glow.hovered {
  opacity: 0.85;
}

.bottom-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 25;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%);
  box-shadow: 0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6), 0 0 35px 7px rgba(56, 189, 248, 0.4);
  opacity: 0.9;
  transition: all 0.4s ease-out;
}

.bottom-glow.hovered {
  box-shadow: 0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7), 0 0 40px 8px rgba(56, 189, 248, 0.5);
  opacity: 1;
}

.left-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 25%;
  width: 1px;
  z-index: 25;
  border-radius: 50%;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0) 80%);
  box-shadow: 0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6), 0 0 35px 7px rgba(56, 189, 248, 0.4);
  opacity: 0.9;
  transition: all 0.4s ease-out;
}

.left-glow.hovered {
  box-shadow: 0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7), 0 0 40px 8px rgba(56, 189, 248, 0.5);
  opacity: 1;
}

.left-corner-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 25%;
  z-index: 25;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.55) 15%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 255, 255, 0.25) 45%, rgba(255, 255, 255, 0.1) 70%, rgba(255, 255, 255, 0) 85%);
  box-shadow: 0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6), 0 0 35px 7px rgba(56, 189, 248, 0.4);
  opacity: 0.9;
  transition: all 0.4s ease-out;
}

.left-corner-glow.hovered {
  box-shadow: 0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7), 0 0 40px 8px rgba(56, 189, 248, 0.5);
  opacity: 1;
}

.right-glow {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 25%;
  width: 1px;
  z-index: 25;
  border-radius: 50%;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0.3) 40%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0) 80%);
  box-shadow: 0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6), 0 0 35px 7px rgba(56, 189, 248, 0.4);
  opacity: 0.9;
  transition: all 0.4s ease-out;
}

.right-glow.hovered {
  box-shadow: 0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7), 0 0 40px 8px rgba(56, 189, 248, 0.5);
  opacity: 1;
}

.right-corner-glow {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 33.33%;
  z-index: 25;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.55) 15%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 255, 255, 0.25) 45%, rgba(255, 255, 255, 0.1) 70%, rgba(255, 255, 255, 0) 85%);
  box-shadow: 0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6), 0 0 35px 7px rgba(56, 189, 248, 0.4);
  opacity: 0.9;
  transition: all 0.4s ease-out;
}

.right-corner-glow.hovered {
  box-shadow: 0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7), 0 0 40px 8px rgba(56, 189, 248, 0.5);
  opacity: 1;
}

.card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  z-index: 40;
}

.icon-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: linear-gradient(225deg, #171c2c 0%, #121624 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.25), 0 3px 6px -1px rgba(0, 0, 0, 0.15), inset 1px 1px 3px rgba(255, 255, 255, 0.12), inset -2px -2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.4s ease-out;
}

.icon-circle.hovered {
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.3), 0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 2px 2px 5px rgba(255, 255, 255, 0.15), inset -2px -2px 5px rgba(0, 0, 0, 0.7);
}

.icon-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 66.67%;
  height: 66.67%;
  opacity: 0.4;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.5), transparent 80%);
  pointer-events: none;
  filter: blur(10px);
}

.icon-shadow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  opacity: 0.5;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
  pointer-events: none;
  backdrop-filter: blur(3px);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 10;
}

.content-text {
  margin-bottom: auto;
  transition: transform 0.4s ease-out;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: white;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
  line-height: 1.2;
  filter: blur(3px);
  opacity: 0.7;
  transition: all 1.2s ease-out;
  animation: fadeInTitle 1.2s ease-out 0.2s forwards;
}

.card-title.hovered {
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.card-description {
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  color: rgb(209, 213, 219);
  line-height: 1.5;
  font-weight: 350;
  filter: blur(3px);
  opacity: 0.7;
  transition: all 1.2s ease-out;
  animation: fadeInDescription 1.2s ease-out 0.4s forwards;
}

.card-description.hovered {
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  opacity: 0.85;
}

.learn-more-link {
  display: inline-flex;
  align-items: center;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  filter: blur(3px);
  opacity: 0.7;
  transition: all 1.2s ease-out;
  animation: fadeInLink 1.2s ease-out 0.6s forwards;
}

.learn-more-link:hover {
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

.arrow-icon {
  margin-left: 0.25rem;
  width: 1rem;
  height: 1rem;
  transition: transform 0.6s ease-out;
}

.arrow-icon.hovered {
  transform: translateX(4px);
}

@keyframes fadeInTitle {
  to {
    filter: blur(0px);
    opacity: 1;
  }
}

@keyframes fadeInDescription {
  to {
    filter: blur(0px);
    opacity: 0.85;
  }
}

@keyframes fadeInLink {
  to {
    filter: blur(0px);
    opacity: 0.9;
  }
}
</style>