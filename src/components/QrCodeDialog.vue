<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="title"
    width="360px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="handleClosed"
  >
    <div class="qrcode-container">
      <div v-if="qrCode" class="qrcode-content">
        <img :src="qrCode" :alt="title" class="qrcode-img">
        <p class="qrcode-tip">请使用{{ title }}扫码登录</p>
      </div>
      <div v-else class="loading-wrapper">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>二维码加载中...</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getSocialQrCode, checkScanStatus } from '@/api/auth'
import type { SocialType } from '@/api/auth'
import { storage } from '@/utils'

const props = defineProps<{
  visible: boolean
  type: SocialType
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const router = useRouter()
const qrCode = ref('')
const state = ref('')
const checkTimer = ref<number>()
const title = computed(() => props.type === 'wechat' ? '微信' : '飞书')

// 获取二维码
const getQrCode = async () => {
  try {
    const res = await getSocialQrCode(props.type)
    qrCode.value = res.qrCode
    state.value = res.state
    startCheck()
  } catch (error) {
    console.error('获取二维码失败:', error)
    ElMessage.error('获取二维码失败，请重试')
    emit('update:visible', false)
  }
}

// 开始轮询检查扫码状态
const startCheck = () => {
  checkTimer.value = window.setInterval(async () => {
    try {
      const res = await checkScanStatus(props.type, state.value)
      if (res) {
        // 登录成功
        storage.set('token', res.token)
        storage.set('userInfo', res.userInfo)
        ElMessage.success('登录成功')
        router.push('/')
        emit('update:visible', false)
      }
    } catch (error) {
      console.error('检查扫码状态失败:', error)
    }
  }, 2000)
}

// 关闭弹窗时清理
const handleClosed = () => {
  if (checkTimer.value) {
    clearInterval(checkTimer.value)
    checkTimer.value = undefined
  }
  qrCode.value = ''
  state.value = ''
}

watch(() => props.visible, (val) => {
  if (val) {
    getQrCode()
  }
})

onBeforeUnmount(() => {
  if (checkTimer.value) {
    clearInterval(checkTimer.value)
  }
})
</script>

<style lang="less" scoped>
.qrcode-container {
  padding: 20px;
  text-align: center;
}

.qrcode-content {
  .qrcode-img {
    width: 200px;
    height: 200px;
    margin-bottom: 16px;
  }
  
  .qrcode-tip {
    color: @text-secondary;
    font-size: 14px;
    margin: 0;
  }
}

.loading-wrapper {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: @text-secondary;
  
  .loading-icon {
    font-size: 32px;
    margin-bottom: 16px;
    animation: rotating 2s linear infinite;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 