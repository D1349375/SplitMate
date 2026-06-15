<template>
  <div class="pb-10">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight mb-1">訂閱追蹤</h1>
        <p class="text-[#8A94A6] text-sm">自動入帳引擎，系統將於指定日期自動生成帳單</p>
      </div>
      <button @click="openModal" class="bg-[#F4623A] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#FF8560] shadow-sm transition-all">
        ＋ 新增訂閱
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <div v-for="sub in subscriptions" :key="sub.id" class="flex items-center gap-4 p-5 bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-2xl hover:bg-[rgba(255,255,255,.06)] transition-all">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 text-white" :style="{ backgroundColor: getBrandColor(sub.name) }">
          {{ sub.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1">
          <div class="text-base font-medium mb-1">{{ sub.name }}</div>
          <div class="text-xs text-[#8A94A6]">每月 {{ sub.billing_day }} 日・{{ sub.group_name || '未指定群組' }}</div>
        </div>
        <div class="text-right">
          <div class="text-lg font-semibold mb-1.5">NT$ {{ sub.amount }}</div>
          <div class="w-20 h-1 bg-[rgba(255,255,255,.08)] rounded-sm ml-auto overflow-hidden">
            <div class="h-full rounded-sm" :style="{ width: getProgress(sub.billing_day), backgroundColor: getBrandColor(sub.name) }"></div>
          </div>
          <div class="text-[11px] mt-1.5 font-medium" :style="{ color: getBrandColor(sub.name) }">
            {{ getDaysLeft(sub.billing_day) }} 天後扣款
          </div>
        </div>
      </div>

      <div v-if="subscriptions.length === 0" class="col-span-full text-center py-10 text-[#8A94A6] text-sm border border-dashed border-[rgba(255,255,255,.08)] rounded-2xl">
        目前還沒有任何訂閱項目，點擊右上方「＋ 新增訂閱」建立一個吧！
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

          <div class="relative w-full md:max-w-md bg-[#1A2030] border border-[rgba(255,255,255,.05)] shadow-2xl rounded-t-3xl md:rounded-3xl p-6 z-10">
            <div class="md:hidden w-10 h-1 bg-[rgba(255,255,255,.2)] rounded-full mx-auto mb-5"></div>

            <h2 class="text-lg font-semibold mb-1">新增訂閱排程</h2>
            <p class="text-sm text-[#8A94A6] mb-6">設定後，系統將每月自動向群組成員請款</p>

            <div class="mb-4">
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">服務名稱</label>
              <input v-model="newSub.name" ref="inputRef" type="text" placeholder="例：Netflix, Spotify..." class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
            </div>

            <div class="flex gap-4 mb-4">
              <div class="flex-1">
                <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">每月總金額</label>
                <input v-model="newSub.amount" type="number" placeholder="例：390" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
              </div>
              <div class="flex-1">
                <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">扣款日 (1-31)</label>
                <input v-model="newSub.billing_day" type="number" min="1" max="31" placeholder="例：15" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
              </div>
            </div>

            <div class="mb-6">
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">歸屬群組</label>
              <select v-model="newSub.group_id" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm appearance-none">
                <option value="" disabled>請選擇要自動記帳的群組...</option>
                <option v-for="g in groups" :key="g.id" :value="g.id" class="bg-[#1A2030] text-white">
                  {{ g.emoji }} {{ g.name }}
                </option>
              </select>
            </div>

            <div v-if="errorMsg" class="mb-4 px-4 py-3 bg-[#F4623A]/10 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">
              {{ errorMsg }}
            </div>

            <button @click="submitSub" :disabled="isLoading" class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white font-medium hover:bg-[#FF8560] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg">
              <span v-if="isLoading">處理中...</span>
              <span v-else>新增排程</span>
            </button>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const subscriptions = ref([])
const groups = ref([])

const showModal = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const inputRef = ref(null)

const newSub = ref({
  name: '',
  amount: '',
  billing_day: '',
  group_id: ''
})

const fetchSubscriptions = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/subscriptions')
    subscriptions.value = await res.json()
  } catch (error) {
    console.error('無法取得訂閱資料:', error)
  }
}

const fetchGroups = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/groups')
    groups.value = await res.json()
  } catch (error) {
    console.error('無法取得群組資料:', error)
  }
}

const openModal = async () => {
  showModal.value = true
  errorMsg.value = ''
  newSub.value = { name: '', amount: '', billing_day: '', group_id: '' }
  await nextTick()
  inputRef.value?.focus()
}

const closeModal = () => {
  if (isLoading.value) return
  showModal.value = false
}

const submitSub = async () => {
  if (!newSub.value.name || !newSub.value.amount || !newSub.value.billing_day || !newSub.value.group_id) {
    errorMsg.value = '請填寫所有欄位'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await fetch('http://localhost:3000/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub.value)
    })

    if (res.ok) {
      await fetchSubscriptions()
      closeModal()
    } else {
      const err = await res.json()
      errorMsg.value = '建立失敗：' + err.error
    }
  } catch (error) {
    errorMsg.value = 'API 連線錯誤'
  } finally {
    isLoading.value = false
  }
}

const getBrandColor = (name) => {
  const n = name.toLowerCase()
  if (n.includes('netflix')) return '#E50914'
  if (n.includes('spotify')) return '#1DB954'
  if (n.includes('youtube')) return '#FF0000'
  return '#F4623A'
}

const getDaysLeft = (billingDay) => {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  let targetDate = new Date(currentYear, currentMonth, billingDay)

  if (currentDay > billingDay) {
    targetDate = new Date(currentYear, currentMonth + 1, billingDay)
  }
  const diffTime = targetDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getProgress = (billingDay) => {
  const daysLeft = getDaysLeft(billingDay)
  const percentage = Math.max(0, 100 - (daysLeft / 30 * 100))
  return `${percentage}%`
}

onMounted(() => {
  fetchGroups()
  fetchSubscriptions()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-active .relative,
.modal-leave-active .relative { transition: transform 0.25s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .relative { transform: translateY(24px); }
</style>