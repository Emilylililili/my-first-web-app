<script setup lang="ts">
// 主页视图 - 背景现在由全局SplineBackground组件提供
</script>

<template>
  <main class="home-view">
    <div class="hero-content">
      <h1 class="hero-title">欢迎来到克拉日记</h1>
      <p class="hero-subtitle">记录生活，管理任务，规划未来</p>
    </div>
  </main>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}
</style>
