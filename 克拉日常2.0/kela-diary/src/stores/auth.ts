import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 获取已注册用户列表
  const getRegisteredUsers = (): Array<{email: string, password: string, userData: User}> => {
    const users = localStorage.getItem('registered_users')
    return users ? JSON.parse(users) : []
  }
  
  // 保存用户到注册列表
  const saveUserToRegistry = (email: string, password: string, userData: User) => {
    const users = getRegisteredUsers()
    users.push({ email, password, userData })
    localStorage.setItem('registered_users', JSON.stringify(users))
  }

  // 计算属性
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  // 初始化认证状态
  const initAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        // 如果解析失败，清除无效数据
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }

  // 登录
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 检查演示账户
      if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
        const mockUser: User = {
          id: 1,
          username: 'Demo User',
          email: credentials.email,
          created_at: new Date().toISOString()
        }
        const mockToken = 'mock_jwt_token_' + Date.now()
        
        user.value = mockUser
        token.value = mockToken
        
        // 保存到本地存储
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('auth_user', JSON.stringify(mockUser))
        
        return { success: true }
      }
      
      // 检查注册用户
      const registeredUsers = getRegisteredUsers()
      const foundUser = registeredUsers.find(u => 
        u.email === credentials.email && u.password === credentials.password
      )
      
      if (foundUser) {
        const mockToken = 'mock_jwt_token_' + Date.now()
        
        user.value = foundUser.userData
        token.value = mockToken
        
        // 保存到本地存储
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('auth_user', JSON.stringify(foundUser.userData))
        
        return { success: true }
      } else {
        throw new Error('邮箱或密码错误')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (data: RegisterData) => {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 检查邮箱是否已存在
      const registeredUsers = getRegisteredUsers()
      const existingUser = registeredUsers.find(u => u.email === data.email)
      
      if (existingUser) {
        throw new Error('该邮箱已被注册')
      }
      
      // 创建新用户
      const mockUser: User = {
        id: Date.now(),
        username: data.username,
        email: data.email,
        created_at: new Date().toISOString()
      }
      const mockToken = 'mock_jwt_token_' + Date.now()
      
      // 保存用户到注册表
      saveUserToRegistry(data.email, data.password, mockUser)
      
      user.value = mockUser
      token.value = mockToken
      
      // 保存到本地存储
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    error.value = null
    
    // 清除本地存储
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    user,
    token,
    isLoading,
    error,
    
    // 计算属性
    isAuthenticated,
    
    // 方法
    initAuth,
    login,
    register,
    logout,
    clearError
  }
})