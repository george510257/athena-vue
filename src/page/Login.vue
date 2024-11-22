<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <div class="bg-container">
          <img src="@/assets/images/login-bg.svg" alt="登录背景" />
          <div class="bg-text">
            <h2>Athena Admin</h2>
            <p>基于 Vue3 + TypeScript 的后台管理系统</p>
          </div>
        </div>
      </div>
      <div class="login-right">
        <el-card class="login-card" :body-style="{ padding: '30px' }">
          <div class="login-header">
            <div class="logo-container">
              <img src="@/assets/images/logo.svg" alt="logo" class="logo" />
            </div>
            <h2 class="login-title">系统登录</h2>
            <p class="login-subtitle">欢迎回来，请登录您的账号</p>
          </div>
          
          <el-tabs v-model="activeTab" class="login-tabs">
            <el-tab-pane label="账号密码登录" name="account">
              <el-form 
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                label-width="0"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="loginForm.username"
                    placeholder="请输入用户名"
                    :prefix-icon="User"
                    size="large"
                  />
                </el-form-item>
                
                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    :prefix-icon="Lock"
                    show-password
                    size="large"
                  />
                </el-form-item>

                <div class="remember-forgot">
                  <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                  <el-link type="primary" :underline="false">忘记密码？</el-link>
                </div>

                <el-form-item>
                  <el-button 
                    type="primary" 
                    :loading="loading"
                    class="login-button"
                    size="large"
                    @click="handleLogin"
                  >
                    登录
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="手机号登录" name="phone">
              <el-form
                ref="phoneFormRef"
                :model="phoneForm"
                :rules="phoneRules"
                label-width="0"
              >
                <el-form-item prop="phone">
                  <el-input
                    v-model="phoneForm.phone"
                    placeholder="请输入手机号"
                    :prefix-icon="Iphone"
                    size="large"
                  />
                </el-form-item>

                <el-form-item prop="code">
                  <div class="code-input">
                    <el-input
                      v-model="phoneForm.code"
                      placeholder="请输入验证码"
                      :prefix-icon="Message"
                      size="large"
                    />
                    <el-button 
                      type="primary" 
                      :disabled="!!countdown || loading"
                      size="large"
                      @click="handleSendCode"
                    >
                      {{ countdown ? `${countdown}s` : '获取验证码' }}
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="loading"
                    class="login-button"
                    size="large"
                    @click="handlePhoneLogin"
                  >
                    登录
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>

          <div class="login-footer">
            <p class="other-login">
              其他登录方式
              <el-tooltip content="微信登录" placement="top">
                <el-button link><el-icon class="social-icon"><svg-icon name="wechat" /></el-icon></el-button>
              </el-tooltip>
              <el-tooltip content="企业微信登录" placement="top">
                <el-button link><el-icon class="social-icon"><svg-icon name="work-wechat" /></el-icon></el-button>
              </el-tooltip>
            </p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import { User, Lock, Iphone, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { login, phoneLogin, sendCode } from '@/api/auth'
import type { LoginParams, PhoneLoginParams } from '@/api/auth'
import { storage } from '@/utils'

const loading = ref(false)
const activeTab = ref('account')
const loginFormRef = ref<FormInstance>()
const phoneFormRef = ref<FormInstance>()
const router = useRouter()
const countdown = ref(0)
const rememberMe = ref(false)

// 账号密码登录表单
const loginForm = reactive<LoginParams>({
  username: '',
  password: ''
})

// 手机号登录表单
const phoneForm = reactive<PhoneLoginParams>({
  phone: '',
  code: ''
})

// 手机号验证规则
const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const phoneRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// 账号密码登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    loading.value = true
    await loginFormRef.value.validate()
    
    const res = await login(loginForm)
    storage.set('token', res.token)
    storage.set('userInfo', res.userInfo)
    
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 发送验证码
const handleSendCode = async () => {
  if (!phoneFormRef.value) return
  
  try {
    await phoneFormRef.value.validateField('phone')
    loading.value = true
    
    await sendCode(phoneForm.phone)
    ElMessage.success('验证码已发送')
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
  } finally {
    loading.value = false
  }
}

// 手机号登录
const handlePhoneLogin = async () => {
  if (!phoneFormRef.value) return
  
  try {
    loading.value = true
    await phoneFormRef.value.validate()
    
    const res = await phoneLogin(phoneForm)
    storage.set('token', res.token)
    storage.set('userInfo', res.userInfo)
    
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #1d39c4 100%);
}

.login-box {
  display: flex;
  width: 1000px;
  height: 600px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .bg-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.8;
    }
    
    .bg-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #fff;
      z-index: 1;
      
      h2 {
        font-size: 36px;
        font-weight: 600;
        margin: 0 0 16px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      p {
        font-size: 16px;
        margin: 0;
        opacity: 0.9;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.login-right {
  width: 440px;
  padding: 20px;
  background: #fff;
}

.login-card {
  height: 100%;
  box-shadow: none !important;
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
    
    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(29, 57, 196, 0.1) 100%);
      
      .logo {
        width: 50px;
        height: 50px;
      }
    }
    
    .login-title {
      font-size: 24px;
      color: $text-primary;
      margin: 0 0 8px;
    }
    
    .login-subtitle {
      font-size: 14px;
      color: $text-secondary;
      margin: 0;
    }
  }
}

.login-tabs {
  :deep(.el-tabs__nav) {
    width: 100%;
    
    .el-tabs__item {
      width: 50%;
      text-align: center;
      font-size: 16px;
    }
  }
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
}

.code-input {
  display: flex;
  gap: 12px;
  
  .el-input {
    flex: 1;
  }
  
  .el-button {
    width: 120px;
    border-radius: 4px;
  }
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  
  .other-login {
    color: $text-secondary;
    font-size: 14px;
    margin: 0;
    
    .social-icon {
      font-size: 24px;
      margin: 0 8px;
      color: #666;
      cursor: pointer;
      transition: color 0.3s;
      
      &:hover {
        color: $primary-color;
      }
    }
  }
}

:deep(.el-input) {
  --el-input-height: 44px;
  
  .el-input__wrapper {
    border-radius: 22px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

@media screen and (max-width: 1200px) {
  .login-box {
    width: 90%;
    max-width: 1000px;
  }
}

@media screen and (max-width: 768px) {
  .login-left {
    display: none;
  }
  
  .login-right {
    width: 100%;
  }
}
</style> 