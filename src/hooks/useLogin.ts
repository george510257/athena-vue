import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { login, phoneLogin, sendCode } from '@/api/auth'
import type { LoginParams, PhoneLoginParams } from '@/api/auth'
import { storage } from '@/utils'

export function useLogin() {
  const loading = ref(false)
  const loginFormRef = ref<FormInstance>()
  const router = useRouter()
  const rememberMe = ref(false)

  const loginForm = reactive<LoginParams>({
    username: '',
    password: ''
  })

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

  const handleLogin = async () => {
    if (!loginFormRef.value) return
    
    try {
      loading.value = true
      await loginFormRef.value.validate()
      
      const res = await login(loginForm)
      handleLoginSuccess(res)
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleLoginSuccess = (res: any) => {
    if (rememberMe.value) {
      storage.set('remember', { username: loginForm.username })
    } else {
      storage.remove('remember')
    }
    
    storage.set('token', res.token)
    storage.set('userInfo', res.userInfo)
    
    ElMessage.success('登录成功')
    router.push('/')
  }

  // 初始化记住的用户名
  const initRememberUser = () => {
    const remember = storage.get('remember')
    if (remember?.username) {
      loginForm.username = remember.username
      rememberMe.value = true
    }
  }

  return {
    loading,
    loginFormRef,
    loginForm,
    loginRules,
    rememberMe,
    handleLogin,
    initRememberUser
  }
} 