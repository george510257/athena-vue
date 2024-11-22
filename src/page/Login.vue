<template>
  <!-- 登录页面容器 -->
  <div class="login-container">
    <!-- 左侧展示区域：包含系统名称、描述和特性列表 -->
    <div class="login-banner">
      <div class="banner-content">
        <!-- 系统标题 -->
        <h1 class="welcome-title">
          <span class="gradient-text">Athena Admin</span>
        </h1>
        <!-- 系统描述 -->
        <p class="welcome-desc">基于 Vue3 + TypeScript 的后台管理系统</p>
        <!-- 特性列表 -->
        <div class="feature-list">
          <!-- 响应式设计特性 -->
          <div class="feature-item">
            <div class="icon-wrapper">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="feature-info">
              <h3>响应式设计</h3>
              <p>适配多种屏幕尺寸</p>
            </div>
          </div>
          <!-- 安全可靠特性 -->
          <div class="feature-item">
            <div class="icon-wrapper">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="feature-info">
              <h3>安全可靠</h3>
              <p>完善的权限控制</p>
            </div>
          </div>
          <!-- 简单易用特性 -->
          <div class="feature-item">
            <div class="icon-wrapper">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="feature-info">
              <h3>简单易用</h3>
              <p>丰富的组件和示例</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区域：包含登录表单和社交登录 -->
    <div class="login-content">
      <div class="login-card">
        <!-- 登录卡片头部 -->
        <div class="login-header">
          <div class="logo-container">
            <img src="@/assets/images/logo.svg" alt="logo" class="logo" />
          </div>
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">请使用您的账号登录系统</p>
        </div>
        
        <!-- 登录方式切换标签页 -->
        <el-tabs v-model="activeTab">
          <!-- 账号密码登录表单 -->
          <el-tab-pane label="账号密码登录" name="account">
            <el-form 
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              size="large"
            >
              <!-- 用户名输入框 -->
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  :prefix-icon="User"
                />
              </el-form-item>
              
              <!-- 密码输入框 -->
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>

              <!-- 记住我和忘记密码 -->
              <div class="form-footer">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码？</el-link>
              </div>

              <!-- 登录按钮 -->
              <el-button 
                type="primary" 
                :loading="accountLoading"
                class="submit-btn"
                @click="handleLogin"
              >
                {{ accountLoading ? '登录中...' : '登录' }}
              </el-button>
            </el-form>
          </el-tab-pane>

          <!-- 手机号登录表单 -->
          <el-tab-pane label="手机号登录" name="phone">
            <el-form
              ref="phoneFormRef"
              :model="phoneForm"
              :rules="phoneRules"
              size="large"
            >
              <!-- 手机号输入框 -->
              <el-form-item prop="phone">
                <el-input
                  v-model="phoneForm.phone"
                  placeholder="请输入手机号"
                  :prefix-icon="Iphone"
                />
              </el-form-item>

              <!-- 验证码输入框和获取验证码按钮 -->
              <el-form-item prop="code">
                <div class="code-input">
                  <el-input
                    v-model="phoneForm.code"
                    placeholder="请输入验证码"
                    :prefix-icon="Message"
                  />
                  <el-button 
                    type="primary" 
                    :disabled="!!countdown || phoneLoading"
                    @click="handleSendCode"
                  >
                    {{ countdown ? `${countdown}s` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>

              <!-- 登录按钮 -->
              <el-button
                type="primary"
                :loading="phoneLoading"
                class="submit-btn"
                @click="handlePhoneLogin"
              >
                {{ phoneLoading ? '登录中...' : '登录' }}
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <!-- 社交登录分割线 -->
        <div class="divider">其他登录方式</div>

        <!-- 社交登录图标 -->
        <div class="social-login">
          <!-- 微信登录 -->
          <el-tooltip content="微信登录" placement="top">
            <div class="social-item" @click="handleSocialLogin('wechat')">
              <img src="@/assets/icons/wechat.svg" alt="微信" />
            </div>
          </el-tooltip>
          <!-- 飞书登录 -->
          <el-tooltip content="飞书登录" placement="top">
            <div class="social-item" @click="handleSocialLogin('feishu')">
              <img src="@/assets/icons/feishu.svg" alt="飞书" />
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 社交登录二维码弹窗 -->
    <QrCodeDialog
      v-model:visible="showQrCode"
      :type="socialType"
    />
  </div>
</template>

<script setup lang="ts">
// 导入所需的组件和工具
import { ref } from 'vue'
import { User, Lock, Iphone, Message, Monitor, Setting } from '@element-plus/icons-vue'
import QrCodeDialog from '@/components/QrCodeDialog.vue'
import { useLogin } from '@/hooks/useLogin'
import { usePhoneLogin } from '@/hooks/usePhoneLogin'
import { useSocialLogin } from '@/hooks/useSocialLogin'

// 当前激活的登录方式标签
const activeTab = ref('account')

// 使用登录相关的 hooks
const {
  loading: accountLoading,
  loginFormRef,
  loginForm,
  loginRules,
  rememberMe,
  handleLogin,
  initRememberUser
} = useLogin()

// 使用手机号登录相关的 hooks
const {
  loading: phoneLoading,
  phoneFormRef,
  phoneForm,
  phoneRules,
  countdown,
  handleSendCode,
  handlePhoneLogin
} = usePhoneLogin()

// 使用社交登录相关的 hooks
const {
  showQrCode,
  socialType,
  handleSocialLogin
} = useSocialLogin()

// 初始化记住的用户名
initRememberUser()
</script>

<style lang="less" scoped>
/* 页面容器样式 */
.login-container {
  min-height: 100vh;
  display: flex;
  background: var(--el-bg-color);
}

/* 左侧展示区域样式 */
.login-banner {
  width: 60%;
  position: relative;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%);
  color: #fff;
  padding: 60px;
  display: flex;
  align-items: center;

  .banner-content {
    max-width: 600px;
    margin: 0 auto;

    .welcome-title {
      font-size: 48px;
      font-weight: 600;
      margin: 0 0 16px;
      
      .gradient-text {
        background: linear-gradient(45deg, #fff 30%, rgba(255, 255, 255, 0.7));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .welcome-desc {
      font-size: 18px;
      opacity: 0.9;
      margin: 0 0 60px;
    }
  }

  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 20px;

      .icon-wrapper {
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(4px);
        
        .el-icon {
          font-size: 28px;
        }
      }

      .feature-info {
        h3 {
          font-size: 18px;
          margin: 0 0 4px;
        }

        p {
          font-size: 14px;
          opacity: 0.8;
          margin: 0;
        }
      }
    }
  }
}

/* 右侧登录区域样式 */
.login-content {
  width: 40%;
  padding: 40px;
  display: flex;
  align-items: center;
  background: var(--el-bg-color);
}

/* 登录卡片样式 */
.login-card {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 40px;

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .logo-container {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 64px;
      height: 64px;
      margin-bottom: 24px;
      border-radius: 16px;
      background: var(--el-color-primary-light-9);
    }

    .login-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--el-text-color-primary);
    }

    .login-subtitle {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }
}

/* 表单相关样式 */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 24px;
}

.submit-btn {
  width: 100%;
}

/* 验证码输入框样式 */
.code-input {
  display: flex;
  gap: 12px;
  
  .el-input {
    flex: 1;
  }
}

/* 分割线样式 */
.divider {
  position: relative;
  text-align: center;
  margin: 32px 0 24px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 80px);
    height: 1px;
    background: var(--el-border-color);
  }
  
  &::before {
    left: 0;
  }
  
  &::after {
    right: 0;
  }
}

/* 社交登录样式 */
.social-login {
  display: flex;
  justify-content: center;
  gap: 32px;
  
  .social-item {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-fill-color-light);
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background: var(--el-fill-color);
    }
    
    img {
      width: 24px;
      height: 24px;
    }
  }
}

/* 响应式布局样式 */
@media screen and (max-width: 992px) {
  .login-banner {
    display: none;
  }

  .login-content {
    width: 100%;
  }
}

@media screen and (max-width: 480px) {
  .login-content {
    padding: 20px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
}
</style> 