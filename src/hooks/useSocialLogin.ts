import { ref } from 'vue'
import type { SocialType } from '@/api/auth'

export function useSocialLogin() {
  const showQrCode = ref(false)
  const socialType = ref<SocialType>('wechat')

  const handleSocialLogin = (type: SocialType) => {
    socialType.value = type
    showQrCode.value = true
  }

  return {
    showQrCode,
    socialType,
    handleSocialLogin
  }
} 