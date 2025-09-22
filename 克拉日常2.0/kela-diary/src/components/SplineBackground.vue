<template>
  <div class="spline-background">
    <div ref="splineContainer" class="spline-container"></div>
    <div class="overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Application } from '@splinetool/runtime'

const splineContainer = ref<HTMLDivElement>()
let app: Application | null = null

onMounted(async () => {
  if (splineContainer.value) {
    try {
      // 创建canvas元素
      const canvas = document.createElement('canvas')
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      splineContainer.value.appendChild(canvas)
      
      app = new Application(canvas)
      await app.load('https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode')
    } catch (error) {
      console.error('Failed to load Spline scene:', error)
    }
  }
})

onUnmounted(() => {
  if (app) {
    app.dispose()
  }
})
</script>

<style scoped>
.spline-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

.spline-container {
  width: 100%;
  height: 100vh;
  pointer-events: auto;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: transparent;
  pointer-events: none;
}
</style>