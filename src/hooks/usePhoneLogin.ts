import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { phoneLogin, sendCode } from '@/api/auth'
import type { PhoneLoginParams } from '@/api/auth'
import { storage } from '@/utils'

export function usePhoneLogin() {
  const loading = ref(false)
  const phoneFormRef = ref<FormInstance>()
  const countdown = ref(0)
  const router = useRouter()

  const phoneForm = reactive<PhoneLoginParams>({
    phone: '',
    code: ''
  })

  const validatePhone = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
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

  const handleSendCode = async () => {
    if (!phoneFormRef.value) return
    
    try {
      await phoneFormRef.value.validateField('phone')
      loading.value = true
      
      await sendCode(phoneForm.phone)
      ElMessage.success('验证码已发送')
      startCountdown()
    } catch (error) {
      console.error('发送验证码失败:', error)
    } finally {
      loading.value = false
    }
  }

  const startCountdown = () => {
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }

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

  return {
    loading,
    phoneFormRef,
    phoneForm,
    phoneRules,
    countdown,
    handleSendCode,
    handlePhoneLogin
  }
} 