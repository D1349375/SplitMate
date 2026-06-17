<template>
  <div class="min-h-[100dvh] w-full bg-[#0E1117] flex items-center justify-center px-5 py-10 relative overflow-hidden">

    <div class="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#F4623A] opacity-[0.04] blur-[80px]"></div>
    <div class="pointer-events-none absolute -bottom-32 -right-32 w-[360px] h-[360px] rounded-full bg-[#F4623A] opacity-[0.03] blur-[80px]"></div>

    <div class="w-full max-w-[380px] flex flex-col gap-6">

      <div class="text-center mb-2">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F4623A]/10 border border-[#F4623A]/20 mb-4">
          <span class="text-2xl">💸</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">
          Split<span class="text-[#F4623A]">Mate</span>
        </h1>
        <p class="text-sm text-[#8A94A6] mt-1">結帳通 · 分帳不再是災難</p>
      </div>

      <div class="bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-2xl p-6">

        <div class="flex gap-1 bg-[rgba(255,255,255,.04)] rounded-xl p-1 mb-6">
          <button @click="activeTab = 'login'" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200', activeTab === 'login' ? 'bg-[#F4623A] text-white shadow-sm' : 'text-[#8A94A6] hover:text-[#F7F4EE]']">
            登入
          </button>
          <button @click="activeTab = 'register'" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200', activeTab === 'register' ? 'bg-[#F4623A] text-white shadow-sm' : 'text-[#8A94A6] hover:text-[#F7F4EE]']">
            註冊
          </button>
        </div>

        <Transition name="tab" mode="out-in">
          <div v-if="activeTab === 'login'" key="login" class="flex flex-col gap-4">

            <div>
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">顯示名稱</label>
              <input v-model="loginName" @keyup.enter="submitLogin" ref="loginInputRef" type="text" placeholder="例：小明、阿花..." maxlength="20" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.08)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] focus:bg-[rgba(244,98,58,.02)] transition-all text-sm" />
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs text-[#8A94A6] tracking-widest uppercase">密碼</label>
                <button class="text-xs text-[#8A94A6] hover:text-[#F4623A] transition-colors">忘記密碼？</button>
              </div>
              <div class="relative">
                <input v-model="loginPassword" @keyup.enter="submitLogin" :type="showPassword ? 'text' : 'password'" placeholder="輸入你的密碼" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.08)] rounded-xl px-4 py-3 pr-11 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] focus:bg-[rgba(244,98,58,.02)] transition-all text-sm" />
                <button @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-[#F7F4EE] transition-colors text-base">
                  {{ showPassword ? '🙈' : '👁' }}
                </button>
              </div>
            </div>

            <div v-if="errorMsg" class="px-4 py-3 bg-[#F4623A]/08 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">{{ errorMsg }}</div>

            <button @click="submitLogin" :disabled="isLoading" class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white text-sm font-medium hover:bg-[#FF8560] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1">
              <span v-if="isLoading" class="flex items-center justify-center gap-2">登入中...</span>
              <span v-else>登入</span>
            </button>
          </div>

          <div v-else key="register" class="flex flex-col gap-4">

            <div>
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">顯示名稱</label>
              <input v-model="registerName" type="text" placeholder="讓朋友認識你的名字" maxlength="20" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.08)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] focus:bg-[rgba(244,98,58,.02)] transition-all text-sm" />
            </div>

            <div>
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">密碼</label>
              <div class="relative">
                <input v-model="registerPassword" :type="showRegisterPassword ? 'text' : 'password'" placeholder="至少 6 個字元" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.08)] rounded-xl px-4 py-3 pr-11 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] focus:bg-[rgba(244,98,58,.02)] transition-all text-sm" />
                <button @click="showRegisterPassword = !showRegisterPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-[#F7F4EE] transition-colors text-base">
                  {{ showRegisterPassword ? '🙈' : '👁' }}
                </button>
              </div>
            </div>

            <div v-if="errorMsg" class="px-4 py-3 bg-[#F4623A]/08 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">{{ errorMsg }}</div>

            <button @click="submitRegister" :disabled="isLoading" class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white text-sm font-medium hover:bg-[#FF8560] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1">
              <span v-if="isLoading" class="flex items-center justify-center gap-2">建立帳號中...</span>
              <span v-else>建立帳號</span>
            </button>
          </div>
        </Transition>
      </div>

      <div class="text-center">
        <button @click="guestLogin" class="w-full py-3 rounded-xl border border-[rgba(255,255,255,.08)] text-[#8A94A6] text-sm hover:bg-[rgba(255,255,255,.04)] hover:text-[#F7F4EE] hover:border-[rgba(255,255,255,.15)] transition-all">
          👤 以訪客身份快速體驗
        </button>
      </div>

    </div>

    <Teleport to="body">
      <Transition name="toast">
        <div v-if="successMsg" class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 bg-[rgba(45,206,126,.12)] border border-[rgba(45,206,126,.3)] text-[#2DCE7E] rounded-2xl text-sm font-medium backdrop-blur-sm whitespace-nowrap shadow-xl">
          ✅ {{ successMsg }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref('login')
const loginName = ref('')
const loginPassword = ref('')
const showPassword = ref(false)
const loginInputRef = ref(null)

const registerName = ref('')
const registerPassword = ref('')
const showRegisterPassword = ref(false)

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const showToast = (msg) => {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = '' }, 2500)
}
const clearError = () => { errorMsg.value = '' }

// 🚀 登入邏輯：登入成功後直接進入首頁
const submitLogin = async () => {
  clearError()
  const name = loginName.value.trim()
  if (!name) { errorMsg.value = '請輸入顯示名稱'; return }
  if (!loginPassword.value) { errorMsg.value = '請輸入密碼'; return }

  isLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 800))
    localStorage.setItem('splitmate_username', name)
    
    // 如果找不到頭像，給個預設值
    if (!localStorage.getItem('splitmate_avatar')) {
      localStorage.setItem('splitmate_avatar', '😎')
    }

    showToast(`歡迎回來，${name}！`)
    
    // 💡 修正這裡：不再檢查 setup_done，登入後無條件直接跳轉到首頁 '/'
    setTimeout(() => router.push('/'), 800)
  } catch (e) {
    errorMsg.value = '⚠️ 無法連線到伺服器'
  } finally {
    isLoading.value = false
  }
}

// 🚀 註冊邏輯：註冊完強制進入 Setup
const submitRegister = async () => {
  clearError()
  const name = registerName.value.trim()
  if (!name) { errorMsg.value = '請輸入顯示名稱'; return }
  if (registerPassword.value.length < 6) { errorMsg.value = '密碼至少需要 6 個字元'; return }

  isLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 1000))

    // 註冊成功，存入名字，頭像留到 setup 再選
    localStorage.setItem('splitmate_username', name)
    localStorage.setItem('splitmate_avatar', '😎') // 先給預設
    showToast(`帳號建立成功！接著來設定你的名片吧！`)
    
    // 💡 註冊完直接去 Setup 介面
    setTimeout(() => router.push('/setup'), 1000)
  } catch (e) {
    errorMsg.value = '⚠️ 無法連線到伺服器'
  } finally {
    isLoading.value = false
  }
}

const guestLogin = () => {
  localStorage.setItem('splitmate_username', '訪客')
  localStorage.setItem('splitmate_avatar', '👤')
  showToast('以訪客身份進入...')
  setTimeout(() => router.push('/'), 600)
}
</script>

<style scoped>
.tab-enter-active, .tab-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.tab-enter-from { opacity: 0; transform: translateX(8px); }
.tab-leave-to { opacity: 0; transform: translateX(-8px); }
.toast-enter-active, .toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-12px); }
</style>