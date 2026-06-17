<template>
  <div class="min-h-[100dvh] w-full bg-[#0E1117] flex items-center justify-center px-5 py-10 relative overflow-hidden">
    <div class="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#F4623A] opacity-[0.04] blur-[80px]"></div>
    <div class="pointer-events-none absolute -bottom-32 -right-32 w-[360px] h-[360px] rounded-full bg-[#F4623A] opacity-[0.03] blur-[80px]"></div>

    <div class="w-full max-w-[400px] flex flex-col gap-5 relative z-10">

      <button v-if="isEditing" @click="router.push('/profile')" class="absolute -top-6 left-0 text-sm text-[#8A94A6] hover:text-[#F7F4EE] transition-colors">
        ← 返回名片
      </button>

      <div class="text-center mb-1">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F4623A]/10 border border-[#F4623A]/20 mb-4">
          <span class="text-2xl">💸</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Split<span class="text-[#F4623A]">Mate</span></h1>
        <p class="text-sm text-[#8A94A6] mt-1">{{ isEditing ? '編輯你的個人名片' : '建立你的個人名片，讓朋友能找到你' }}</p>
      </div>

      <div class="flex items-center gap-2 px-2">
        <div v-for="(step, i) in steps" :key="i" class="flex items-center gap-2 flex-1">
          <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 shrink-0', currentStep > i ? 'bg-[#2DCE7E] text-white' : currentStep === i ? 'bg-[#F4623A] text-white' : 'bg-[rgba(255,255,255,.06)] text-[#8A94A6]']">
            <span v-if="currentStep > i">✓</span><span v-else>{{ i + 1 }}</span>
          </div>
          <span class="text-xs transition-colors duration-300" :class="currentStep === i ? 'text-[#F7F4EE]' : 'text-[#8A94A6]'">{{ step }}</span>
          <div v-if="i < steps.length - 1" class="flex-1 h-px bg-[rgba(255,255,255,.06)]"></div>
        </div>
      </div>

      <div class="bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-2xl p-6">
        <Transition name="step" mode="out-in">

          <div v-if="currentStep === 0" key="avatar" class="flex flex-col gap-5">
            <div>
              <h2 class="text-base font-semibold mb-1">頭像與顯示名稱</h2>
              <p class="text-sm text-[#8A94A6]">代表你在群組裡的身份</p>
            </div>
            
            <div class="flex justify-center mb-2">
              <div @click="triggerAvatarUpload" class="relative group cursor-pointer">
                <div class="w-24 h-24 rounded-full bg-[#F4623A]/10 border-2 border-dashed border-[#F4623A]/40 flex items-center justify-center text-[40px] overflow-hidden transition-all duration-200 group-hover:border-[#F4623A] group-hover:bg-[#F4623A]/20 shadow-lg">
                  <img v-if="isImage(selectedAvatar)" :src="selectedAvatar" class="w-full h-full object-cover" />
                  <span v-else>{{ selectedAvatar }}</span>
                </div>
                <div class="absolute bottom-0 right-0 w-8 h-8 bg-[#F4623A] rounded-full flex items-center justify-center text-white text-xs shadow-lg border-2 border-[#1A2030] group-hover:scale-110 transition-transform">
                  📷
                </div>
              </div>
              <input ref="avatarInputRef" type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
            </div>

            <div>
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-3">或選擇預設 Emoji</label>
              <div class="grid grid-cols-5 gap-2">
                <button v-for="emoji in avatarOptions" :key="emoji" @click="selectedAvatar = emoji" :class="['h-12 rounded-xl text-2xl border transition-all duration-150', selectedAvatar === emoji ? 'bg-[#F4623A]/12 border-[#F4623A]/40 scale-105 shadow-md' : 'bg-[rgba(255,255,255,.04)] border-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.07)]']">
                  {{ emoji }}
                </button>
              </div>
            </div>
            
            <div>
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">顯示名稱</label>
              <input v-model="displayName" type="text" placeholder="你的朋友如何稱呼你？" maxlength="20" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.08)] rounded-xl px-4 py-3 text-[#F7F4EE] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
            </div>
            <div v-if="errorMsg" class="px-4 py-3 bg-[#F4623A]/08 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">{{ errorMsg }}</div>
            <button @click="nextStep" class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white text-sm font-medium hover:bg-[#FF8560] transition-all">下一步 →</button>
          </div>

          <div v-else-if="currentStep === 1" key="qrcode" class="flex flex-col gap-5">
            <div>
              <h2 class="text-base font-semibold mb-1">收款 QR Code</h2>
              <p class="text-sm text-[#8A94A6]">朋友可以直接掃碼轉帳給你</p>
            </div>
            <div class="flex flex-col items-center gap-3">
              <div v-if="!qrPreview || qrPreview === 'default'" @click="triggerQrUpload" class="w-44 h-44 border-2 border-dashed border-[rgba(255,255,255,.12)] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[rgba(244,98,58,.4)] hover:bg-[rgba(244,98,58,.03)] transition-all group">
                <span class="text-3xl opacity-40 group-hover:opacity-70 transition-opacity">📷</span>
                <span class="text-xs text-[#8A94A6] group-hover:text-[#F7F4EE] transition-colors text-center leading-relaxed">點擊上傳<br>你的收款 QR Code</span>
              </div>
              <div v-else class="relative">
                <img :src="qrPreview" class="w-44 h-44 object-cover rounded-2xl border border-[rgba(255,255,255,.1)]" />
                <button @click="removeQr" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F4623A] text-white text-xs flex items-center justify-center hover:bg-[#FF8560]">✕</button>
              </div>
              <input ref="qrInputRef" type="file" accept="image/*" class="hidden" @change="handleQrUpload" />
              <div v-if="!qrPreview || qrPreview === 'default'" class="flex items-center gap-3 w-full">
                <div class="flex-1 h-px bg-[rgba(255,255,255,.06)]"></div>
                <span class="text-xs text-[#8A94A6]">或</span>
                <div class="flex-1 h-px bg-[rgba(255,255,255,.06)]"></div>
              </div>
              <button v-if="!qrPreview || qrPreview === 'default'" @click="useDefaultQr" class="w-full py-2.5 rounded-xl border border-[rgba(255,255,255,.08)] text-[#8A94A6] text-sm hover:text-[#F7F4EE] transition-all">
                🔲 暫時使用系統預設圖示
              </button>
            </div>
            <div class="flex gap-3">
              <button @click="prevStep" class="flex-1 py-3 rounded-xl border border-[rgba(255,255,255,.08)] text-[#8A94A6] text-sm hover:text-[#F7F4EE] transition-all">← 上一步</button>
              <button @click="nextStep" class="flex-1 py-3.5 rounded-xl bg-[#F4623A] text-white text-sm font-medium hover:bg-[#FF8560] transition-all">{{ qrPreview ? '下一步 →' : '略過' }}</button>
            </div>
          </div>

          <div v-else-if="currentStep === 2" key="bank" class="flex flex-col gap-5">
            <div>
              <h2 class="text-base font-semibold mb-1">收款帳戶資訊</h2>
              <p class="text-sm text-[#8A94A6]">讓朋友能直接轉帳給你（可之後再填）</p>
            </div>
            <div>
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">銀行代碼</label>
              <div class="relative">
                <select v-model="bankCode" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.08)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[rgba(244,98,58,.5)] transition-all appearance-none cursor-pointer" :class="bankCode ? 'text-[#F7F4EE]' : 'text-[#8A94A6]'">
                  <option value="" disabled>選擇銀行...</option>
                  <option v-for="bank in bankOptions" :key="bank.code" :value="bank.code">{{ bank.name }} ({{ bank.code }})</option>
                </select>
              </div>
            </div>
            <div>
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">收款帳號</label>
              <input v-model="bankAccount" type="text" placeholder="輸入你的帳號（不含分行碼）" maxlength="20" inputmode="numeric" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.08)] rounded-xl px-4 py-3 text-[#F7F4EE] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm tracking-wider" />
            </div>
            <div v-if="errorMsg" class="px-4 py-3 bg-[#F4623A]/08 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">{{ errorMsg }}</div>
            <div class="flex gap-3">
              <button @click="prevStep" class="flex-1 py-3 rounded-xl border border-[rgba(255,255,255,.08)] text-[#8A94A6] text-sm hover:text-[#F7F4EE] transition-all">← 上一步</button>
              <button @click="submitSetup" :disabled="isLoading" class="flex-1 py-3.5 rounded-xl bg-[#F4623A] text-white text-sm font-medium hover:bg-[#FF8560] disabled:opacity-50 transition-all">
                <span v-if="isLoading">儲存中...</span>
                <span v-else>{{ isEditing ? '儲存修改 ✅' : '完成設定 🎉' }}</span>
              </button>
            </div>
          </div>

        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isEditing = ref(false)

const steps = ['頭像', 'QR Code', '收款帳戶']
const currentStep = ref(0)
const selectedAvatar = ref('😎')
const displayName = ref('')
const avatarOptions = ['😎', '🐱', '🦊', '🐼', '🐸', '🦁', '🐯', '🐨', '🐻', '🐺', '🐧', '🦋', '🐬', '🦄', '🐙']

// 🚀 照片上傳核心邏輯 (File Reader 轉 Base64)
const avatarInputRef = ref(null)
const triggerAvatarUpload = () => avatarInputRef.value?.click()
const handleAvatarUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => { selectedAvatar.value = evt.target.result }
  reader.readAsDataURL(file)
}
// 判斷選中的是 Base64 照片還是 Emoji
const isImage = (str) => str && str.startsWith('data:image')

const qrPreview = ref('')
const qrInputRef = ref(null)
const useDefaultQr = () => qrPreview.value = 'default'
const triggerQrUpload = () => qrInputRef.value?.click()
const handleQrUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => { qrPreview.value = evt.target.result }
  reader.readAsDataURL(file)
}
const removeQr = () => { qrPreview.value = ''; if (qrInputRef.value) qrInputRef.value.value = '' }

const bankCode = ref('')
const bankAccount = ref('')
const bankOptions = [
  { code: '004', name: '台灣銀行' }, { code: '005', name: '土地銀行' }, { code: '006', name: '合庫商銀' },
  { code: '007', name: '第一銀行' }, { code: '008', name: '華南銀行' }, { code: '009', name: '彰化銀行' },
  { code: '012', name: '台北富邦' }, { code: '013', name: '國泰世華' }, { code: '808', name: '玉山銀行' },
  { code: '812', name: '台新銀行' }, { code: '822', name: '中國信託' }
]

const isLoading = ref(false)
const errorMsg = ref('')

onMounted(() => {
  if (localStorage.getItem('splitmate_setup_done')) {
    isEditing.value = true
  }
  const savedName = localStorage.getItem('splitmate_username')
  if (savedName && savedName !== '訪客') displayName.value = savedName
  const savedAvatar = localStorage.getItem('splitmate_avatar')
  if (savedAvatar) selectedAvatar.value = savedAvatar
  const savedQr = localStorage.getItem('splitmate_qr')
  if (savedQr) qrPreview.value = savedQr
  
  bankCode.value = localStorage.getItem('splitmate_bank_code') || ''
  bankAccount.value = localStorage.getItem('splitmate_bank_account') || ''
})

const nextStep = () => {
  errorMsg.value = ''
  if (currentStep.value === 0 && !displayName.value.trim()) {
    errorMsg.value = '請輸入你的顯示名稱'
    return
  }
  currentStep.value++
}
const prevStep = () => { errorMsg.value = ''; currentStep.value-- }

// 🚀 儲存設定
const submitSetup = async () => {
  isLoading.value = true
  errorMsg.value = ''

  try {
    await new Promise(r => setTimeout(r, 600))
    const finalName = displayName.value.trim()
    localStorage.setItem('splitmate_username', finalName)
    localStorage.setItem('splitmate_avatar', selectedAvatar.value)
    
    // 💡 寫入前端模擬資料庫 (Global Avatars Map)
    // 這樣 Settle 跟 Group 頁面就能透過名字抓到照片了
    const globalAvatars = JSON.parse(localStorage.getItem('splitmate_global_avatars') || '{}')
    globalAvatars[finalName] = selectedAvatar.value
    localStorage.setItem('splitmate_global_avatars', JSON.stringify(globalAvatars))

    if (qrPreview.value) { localStorage.setItem('splitmate_qr', qrPreview.value) } 
    else { localStorage.removeItem('splitmate_qr') }

    if (bankCode.value) localStorage.setItem('splitmate_bank_code', bankCode.value)
    if (bankAccount.value) localStorage.setItem('splitmate_bank_account', bankAccount.value)
    localStorage.setItem('splitmate_setup_done', '1')

    if (isEditing.value) { router.push('/profile') } else { router.push('/') }
  } catch (e) {
    errorMsg.value = '⚠️ 儲存失敗，請再試一次'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.step-enter-active, .step-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.step-enter-from { opacity: 0; transform: translateX(12px); }
.step-leave-to { opacity: 0; transform: translateX(-12px); }
</style>