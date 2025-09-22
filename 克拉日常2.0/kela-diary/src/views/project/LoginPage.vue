<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import type { LoginCredentials } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const loginForm = reactive<LoginCredentials>({
  email: 'demo@example.com',
  password: 'password'
})

// 表单验证规则
const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 控制密码显示
const showPassword = ref(false)
const formRef = ref()

// 登录处理
const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const result = await authStore.login(loginForm)
    
    if (result.success) {
      ElMessage.success('登录成功！')
      router.push('/dashboard')
    } else {
      ElMessage.error(result.error || '登录失败')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 返回主页
const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
    
    <!-- 返回按钮 -->
    <el-button 
      class="back-button"
      @click="goToHome"
      type="text"
      size="large"
    >
      ← 返回主页
    </el-button>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">项目管理系统</h1>
        <p class="login-subtitle">登录您的账户</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱地址"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            clearable
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <el-icon 
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <View v-if="!showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="authStore.isLoading"
            @click="handleLogin"
            size="large"
          >
            {{ authStore.isLoading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p class="register-link">
          还没有账户？
          <el-button type="text" @click="goToRegister" class="link-button">
            立即注册
          </el-button>
        </p>
        
        <!-- 演示账户信息 -->
        <div class="demo-info">
          <p class="demo-title">演示账户</p>
          <p class="demo-text">邮箱: demo@example.com</p>
          <p class="demo-text">密码: password</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  z-index: 0;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.back-button {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 3;
  color: white;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  color: rgba(255, 255, 255, 0.8);
  transform: translateX(-5px);
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.login-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.login-form {
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.password-toggle {
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
}

.login-button {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:hover::before {
  left: 100%;
}

.login-footer {
  text-align: center;
}

.register-link {
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.link-button {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  padding: 0;
  margin-left: 5px;
}

.link-button:hover {
  color: white;
}

.demo-info {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
}

.demo-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.demo-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 4px 0;
  font-family: 'Courier New', monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 15px;
  }
  
  .login-card {
    padding: 30px 25px;
    max-width: 100%;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .back-button {
    top: 20px;
    left: 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 25px 20px;
  }
  
  .login-title {
    font-size: 22px;
  }
  
  .login-button {
    height: 45px;
    font-size: 15px;
  }
}
</style>