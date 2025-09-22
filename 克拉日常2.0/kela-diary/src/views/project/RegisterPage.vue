<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, View, Hide } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import type { RegisterData } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const registerForm = reactive<RegisterData & { confirmPassword: string }>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 确认密码验证
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 控制密码显示
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const formRef = ref()

// 注册处理
const handleRegister = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const { confirmPassword, ...registerData } = registerForm
    const result = await authStore.register(registerData)
    
    if (result.success) {
      ElMessage.success('注册成功！')
      router.push('/dashboard')
    } else {
      ElMessage.error(result.error || '注册失败')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 返回主页
const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="register-container">
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
    
    <!-- 注册卡片 -->
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">项目管理系统</h1>
        <p class="register-subtitle">创建您的账户</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        class="register-form"
        size="large"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            :prefix-icon="Message"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            clearable
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
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请确认密码"
            :prefix-icon="Lock"
            clearable
            @keyup.enter="handleRegister"
          >
            <template #suffix>
              <el-icon 
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <View v-if="!showConfirmPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            class="register-button"
            :loading="authStore.isLoading"
            @click="handleRegister"
            size="large"
          >
            {{ authStore.isLoading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
        <p class="login-link">
          已有账户？
          <el-button type="text" @click="goToLogin" class="link-button">
            立即登录
          </el-button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
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
  z-index: 10;
  color: white;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  color: rgba(255, 255, 255, 0.8);
  transform: translateX(-5px);
}

.register-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.register-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.register-form {
  margin-bottom: 20px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
}

.register-form :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.register-form :deep(.el-input__wrapper.is-focus) {
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

.register-button {
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

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.register-button:hover::before {
  left: 100%;
}

.register-footer {
  text-align: center;
}

.login-link {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 15px;
  }
  
  .register-card {
    padding: 30px 25px;
    max-width: 100%;
  }
  
  .register-title {
    font-size: 24px;
  }
  
  .back-button {
    top: 20px;
    left: 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 25px 20px;
  }
  
  .register-title {
    font-size: 22px;
  }
  
  .register-button {
    height: 45px;
    font-size: 15px;
  }
}
</style>