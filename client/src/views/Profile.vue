<template>
  <div class="pb-10 relative">
    
    <!-- 🚀 自訂滑順 Toast 提示元件 -->
    <Teleport to="body">
      <div :class="['fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#2DCE7E]/15 border border-[#2DCE7E]/40 text-[#2DCE7E] px-6 py-3 rounded-full text-sm font-medium backdrop-blur-md z-[9999] transition-all duration-300 shadow-xl pointer-events-none', 
                   toastShow ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95']">
        {{ toastMessage }}
      </div>
    </Teleport>

    <!-- 個人資訊大頭貼區塊 -->
    <div class="flex flex-col items-center pt-10 pb-8 gap-4 bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-[24px] mb-6">
      <div class="w-24 h-24 rounded-[32px] bg-[#F4623A]/20 flex items-center justify-center text-[40px] font-semibold text-[#F4623A]">
        {{ userAvatar }}
      </div>
      <div class="text-center">
        <div class="text-[28px] font-semibold mb-1 tracking-tight">{{ userName }}</div>
        <div class="text-[15px] text-[#8A94A6]">@{{ userHandle }}</div>
      </div>
    </div>
    
    <!-- 兩欄式排版 (QR Code & 銀行帳戶) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <!-- QR Code 區塊 -->
      <div class="flex flex-col items-center gap-4 p-8 bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-[24px]">
        <div class="text-[14px] text-[#8A94A6] font-medium">專屬收款 QR Code</div>
        <!-- 動態生成的 7x7 方陣 -->
        <div class="w-40 h-40 grid grid-cols-7 gap-[2px] bg-white p-2 rounded-lg" v-html="generateQR()"></div>
        <div class="text-[12px] text-[#8A94A6]">支援 TWQR・任何人掃碼即可轉帳</div>
      </div>
      
      <!-- 銀行帳戶資訊區塊 -->
      <div class="bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-[24px] p-6 flex flex-col justify-center h-full">
        <div class="text-[12px] text-[#8A94A6] tracking-widest mb-4 uppercase">銀行帳戶資訊</div>
        
        <div class="flex justify-between items-center py-4 border-b border-[rgba(255,255,255,.08)]">
          <div class="text-[14px] text-[#8A94A6]">銀行代碼</div>
          <div class="flex items-center gap-3">
            <div class="text-[16px] font-medium tracking-wide">玉山銀行 808</div>
            <button @click="copyText('808', 'bankCode')" 
                    :class="copiedBtn === 'bankCode' ? 'border-[#2DCE7E] text-[#2DCE7E] bg-[#2DCE7E]/10' : 'border-[rgba(255,255,255,.08)] text-[#F7F4EE] hover:bg-white/10'"
                    class="px-4 py-2 border rounded-lg text-[13px] font-medium transition-all">
              {{ copiedBtn === 'bankCode' ? '已複製！' : '複製' }}
            </button>
          </div>
        </div>
        
        <div class="flex justify-between items-center py-4 border-b border-[rgba(255,255,255,.08)]">
          <div class="text-[14px] text-[#8A94A6]">收款帳號</div>
          <div class="flex items-center gap-3">
            <div class="text-[16px] font-medium tracking-wide">0123456789012</div>
            <button @click="copyText('0123456789012', 'account')" 
                    :class="copiedBtn === 'account' ? 'border-[#2DCE7E] text-[#2DCE7E] bg-[#2DCE7E]/10' : 'border-[rgba(255,255,255,.08)] text-[#F7F4EE] hover:bg-white/10'"
                    class="px-4 py-2 border rounded-lg text-[13px] font-medium transition-all">
              {{ copiedBtn === 'account' ? '已複製！' : '複製' }}
            </button>
          </div>
        </div>
        
        <div class="flex justify-between items-center pt-4 mt-2">
          <div class="text-[14px] text-[#8A94A6]">分享給朋友</div>
          <button @click="copyText('玉山銀行(808) 0123456789012', 'all')" 
                  :class="copiedBtn === 'all' ? 'border-[#2DCE7E] text-[#2DCE7E] bg-[#2DCE7E]/10' : 'border-[#F4623A] text-[#F4623A] hover:bg-[#F4623A]/10'"
                  class="px-4 py-2 border rounded-lg text-[13px] font-medium transition-all">
            {{ copiedBtn === 'all' ? '已複製！' : '一鍵複製完整資訊' }}
          </button>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 使用者資料狀態
const userName = ref('小明')
const userAvatar = ref('明')
const userHandle = ref('mingming406')

// Toast 與按鈕回饋狀態
const toastShow = ref(false)
const toastMessage = ref('')
const copiedBtn = ref('')

const triggerToast = (msg) => {
  toastMessage.value = msg
  toastShow.value = true
  // 2.5 秒後自動消失
  setTimeout(() => { toastShow.value = false }, 2500)
}

// 複製到剪貼簿功能
const copyText = async (text, btnId) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedBtn.value = btnId
    triggerToast(`✅ 已將內容複製至剪貼簿：${text}`)
    // 2 秒後按鈕恢復原狀
    setTimeout(() => { copiedBtn.value = '' }, 2000)
  } catch (err) {
    console.error('複製失敗:', err)
    triggerToast('❌ 複製失敗，請檢查瀏覽器權限設定')
  }
}

// 產生 7x7 的假 QR Code (與 index.html 1:1 復刻)
const generateQR = () => {
  const QR7 = [1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,0,1,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,0,1,0]
  return QR7.map(v => `<div style="background:${v ? '#000' : 'transparent'};aspect-ratio:1;border-radius:1px"></div>`).join('')
}

onMounted(() => {
  // 載入時自動從 localStorage 抓取使用者名稱，沒有的話預設為「小明」
  const savedName = localStorage.getItem('splitmate_username') || '小明'
  userName.value = savedName
  userAvatar.value = savedName.charAt(0).toUpperCase() // 取第一個字當作大頭貼
  
  // 建立一組隨機感的使用者 Handle (例如：@阿花_135)
  // 如果是預設小明則依照設計稿顯示 mingming406
  if (savedName === '小明') {
    userHandle.value = 'mingming406'
  } else {
    userHandle.value = `${savedName}_user`
  }
})
</script>