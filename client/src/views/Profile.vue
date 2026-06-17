<template>
  <div class="pb-10 relative">
    
    <Teleport to="body">
      <div :class="['fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#2DCE7E]/15 border border-[#2DCE7E]/40 text-[#2DCE7E] px-6 py-3 rounded-full text-sm font-medium backdrop-blur-md z-[9999] transition-all duration-300 shadow-xl pointer-events-none', 
                   toastShow ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95']">
        {{ toastMessage }}
      </div>
    </Teleport>

    <div class="flex justify-end mb-4">
      <button @click="router.push('/setup')" class="text-xs text-[#8A94A6] hover:text-[#F4623A] transition-colors px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,.06)] hover:border-[rgba(244,98,58,.3)] bg-[rgba(255,255,255,.03)]">
        編輯資料
      </button>
    </div>

    <div class="flex flex-col items-center pt-8 pb-8 gap-4 bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-[24px] mb-6">
      <div class="w-24 h-24 rounded-full bg-[#F4623A]/20 flex items-center justify-center text-[40px] font-semibold text-[#F4623A] overflow-hidden border-2 border-[#F4623A]/30 shadow-lg">
        <img v-if="isImage(userAvatar)" :src="userAvatar" class="w-full h-full object-cover" />
        <span v-else>{{ userAvatar }}</span>
      </div>
      <div class="text-center">
        <div class="text-[28px] font-semibold mb-1 tracking-tight">{{ userName }}</div>
        <div class="text-[15px] text-[#8A94A6]">@{{ userHandle }}</div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col items-center gap-4 p-8 bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-[24px]">
        <div class="text-[14px] text-[#8A94A6] font-medium">專屬收款 QR Code</div>
        <div class="w-40 h-40 grid grid-cols-7 gap-[2px] bg-white p-2 rounded-lg" v-html="generateQR()"></div>
        <div class="text-[12px] text-[#8A94A6]">支援 TWQR・任何人掃碼即可轉帳</div>
      </div>
      
      <div class="bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-[24px] p-6 flex flex-col justify-center h-full">
        <div class="text-[12px] text-[#8A94A6] tracking-widest mb-4 uppercase">銀行帳戶資訊</div>
        
        <div class="flex justify-between items-center py-4 border-b border-[rgba(255,255,255,.08)]">
          <div class="text-[14px] text-[#8A94A6]">銀行代碼</div>
          <div class="flex items-center gap-3">
            <div class="text-[16px] font-medium tracking-wide" :class="!userBankCode ? 'text-[#8A94A6] text-sm' : ''">
              {{ displayBankName }}
            </div>
            <button v-if="userBankCode" @click="copyText(userBankCode, 'bankCode')" 
                    :class="copiedBtn === 'bankCode' ? 'border-[#2DCE7E] text-[#2DCE7E] bg-[#2DCE7E]/10' : 'border-[rgba(255,255,255,.08)] text-[#F7F4EE] hover:bg-white/10'"
                    class="px-4 py-2 border rounded-lg text-[13px] font-medium transition-all">
              {{ copiedBtn === 'bankCode' ? '已複製！' : '複製' }}
            </button>
          </div>
        </div>
        
        <div class="flex justify-between items-center py-4 border-b border-[rgba(255,255,255,.08)]">
          <div class="text-[14px] text-[#8A94A6]">收款帳號</div>
          <div class="flex items-center gap-3">
            <div class="text-[16px] font-medium tracking-wide" :class="!userBankAccount ? 'text-[#8A94A6] text-sm' : ''">
              {{ userBankAccount || '尚未設定' }}
            </div>
            <button v-if="userBankAccount" @click="copyText(userBankAccount, 'account')" 
                    :class="copiedBtn === 'account' ? 'border-[#2DCE7E] text-[#2DCE7E] bg-[#2DCE7E]/10' : 'border-[rgba(255,255,255,.08)] text-[#F7F4EE] hover:bg-white/10'"
                    class="px-4 py-2 border rounded-lg text-[13px] font-medium transition-all">
              {{ copiedBtn === 'account' ? '已複製！' : '複製' }}
            </button>
          </div>
        </div>
        
        <div class="flex justify-between items-center pt-4 mt-2">
          <div class="text-[14px] text-[#8A94A6]">分享給朋友</div>
          <button @click="copyFullBankInfo" 
                  :disabled="!userBankCode || !userBankAccount"
                  :class="[
                    copiedBtn === 'all' ? 'border-[#2DCE7E] text-[#2DCE7E] bg-[#2DCE7E]/10' : 'border-[#F4623A] text-[#F4623A] hover:bg-[#F4623A]/10',
                    (!userBankCode || !userBankAccount) ? 'opacity-50 cursor-not-allowed border-[rgba(255,255,255,.08)] text-[#8A94A6]' : ''
                  ]"
                  class="px-4 py-2 border rounded-lg text-[13px] font-medium transition-all">
            {{ copiedBtn === 'all' ? '已複製！' : '一鍵複製完整資訊' }}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <button @click="logout" class="w-full py-3.5 rounded-2xl border border-[#F4623A]/30 bg-[#F4623A]/5 text-[#F4623A] text-sm font-medium hover:bg-[#F4623A]/15 hover:border-[#F4623A]/50 transition-all">
        登出帳號
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userName = ref('載入中...')
const userAvatar = ref('😎')
const userHandle = ref('user')

const isImage = (str) => str && str.startsWith('data:image')
// 🚀 銀行資訊變數
const userBankCode = ref('')
const userBankAccount = ref('')

const bankOptions = [
  { code: '004', name: '台灣銀行' }, { code: '005', name: '土地銀行' }, { code: '006', name: '合庫商銀' },
  { code: '007', name: '第一銀行' }, { code: '008', name: '華南銀行' }, { code: '009', name: '彰化銀行' },
  { code: '012', name: '台北富邦' }, { code: '013', name: '國泰世華' }, { code: '808', name: '玉山銀行' },
  { code: '812', name: '台新銀行' }, { code: '822', name: '中國信託' }
]

// 🚀 換算銀行名稱
const displayBankName = computed(() => {
  if (!userBankCode.value) return '尚未設定'
  const bank = bankOptions.find(b => b.code === userBankCode.value)
  return bank ? `${bank.name} (${bank.code})` : userBankCode.value
})

const toastShow = ref(false)
const toastMessage = ref('')
const copiedBtn = ref('')

const triggerToast = (msg) => {
  toastMessage.value = msg
  toastShow.value = true
  setTimeout(() => { toastShow.value = false }, 2500)
}

const copyText = async (text, btnId) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedBtn.value = btnId
    triggerToast(`✅ 已將內容複製至剪貼簿：${text}`)
    setTimeout(() => { copiedBtn.value = '' }, 2000)
  } catch (err) {
    triggerToast('❌ 複製失敗，請檢查瀏覽器權限')
  }
}

// 🚀 一鍵複製完整資訊的優化版
const copyFullBankInfo = () => {
  if (!userBankCode.value || !userBankAccount.value) return
  const bank = bankOptions.find(b => b.code === userBankCode.value)
  const bName = bank ? bank.name : '銀行'
  const fullText = `${bName} (${userBankCode.value})\n帳號：${userBankAccount.value}`
  copyText(fullText, 'all')
}

const generateQR = () => {
  const savedQr = localStorage.getItem('splitmate_qr')
  if (savedQr && savedQr !== 'default') {
    return `<img src="${savedQr}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />`
  }
  const QR7 = [1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,0,1,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,0,1,0]
  return QR7.map(v => `<div style="background:${v ? '#000' : 'transparent'};aspect-ratio:1;border-radius:1px"></div>`).join('')
}

const logout = () => {
  localStorage.removeItem('splitmate_username')
  localStorage.removeItem('splitmate_avatar')
  localStorage.removeItem('splitmate_setup_done')
  triggerToast('👋 已成功登出！')
  setTimeout(() => { router.push('/login') }, 1000)
}

onMounted(() => {
  const savedName = localStorage.getItem('splitmate_username') || '訪客'
  userName.value = savedName
  userAvatar.value = localStorage.getItem('splitmate_avatar') || savedName.charAt(0).toUpperCase()
  userHandle.value = savedName === '訪客' ? 'guest_user' : `${savedName}_user`
  
  // 🚀 抓取儲存的銀行資訊
  userBankCode.value = localStorage.getItem('splitmate_bank_code') || ''
  userBankAccount.value = localStorage.getItem('splitmate_bank_account') || ''
})
</script>