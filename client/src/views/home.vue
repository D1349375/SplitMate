<template>
  <div class="page-home">

    <div class="bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-2xl py-5 px-4 text-center mb-3">
      <div class="text-[36px] font-semibold tracking-tighter transition-colors duration-200" 
           :class="myTotalBalance >= 0 ? 'text-[#2DCE7E]' : 'text-[#F4623A]'">
        NT$ {{ Math.abs(myTotalBalance) }}
      </div>
      <div class="text-sm text-[#8A94A6] mt-2">
        {{ myTotalBalance >= 0 ? '別人欠你的總金額' : '你欠別人的總金額' }}
      </div>
    </div>

    <div class="bg-gradient-to-br from-[rgba(244,98,58,.08)] to-[rgba(244,98,58,.02)] border border-[rgba(244,98,58,.2)] rounded-xl p-3 mb-3">
      <div class="flex items-center justify-between mb-4">
        <div class="text-[13px] text-[#FF8560] tracking-wider font-medium">⚡ 即將到期訂閱</div>
        <router-link to="/subs" class="text-xs text-[#8A94A6] hover:text-[#F7F4EE] transition-colors">查看全部 &rarr;</router-link>
      </div>

      <div v-if="topSubscriptions.length === 0" class="text-xs text-[#8A94A6] text-center py-4">
        目前沒有進行中的訂閱排程
      </div>

      <div v-for="sub in topSubscriptions" :key="sub.id" class="flex items-center gap-3 mb-2 last:mb-0">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 text-white" :style="{ backgroundColor: getBrandColor(sub.name) }">
          {{ sub.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium">{{ sub.name }}</div>
          <div class="text-xs text-[#8A94A6]">{{ getDaysLeft(sub.billing_day) }} 天後到期</div>
        </div>
        <div class="w-20 h-1 bg-[rgba(255,255,255,.08)] rounded-sm shrink-0 overflow-hidden">
          <div class="h-full rounded-sm" :style="{ width: getProgress(sub.billing_day), backgroundColor: getBrandColor(sub.name) }"></div>
        </div>
        <div class="text-[13px] text-[#F7F4EE] min-w-[40px] text-right font-medium">{{ sub.amount }}</div>
      </div>
    </div>

    <div class="text-xs text-[#8A94A6] tracking-widest mt-4 mb-3 uppercase">我的群組</div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <router-link
        v-for="group in groups"
        :key="group.id"
        :to="`/group/${group.id}`"
        class="flex items-center gap-3 bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] rounded-2xl p-4 cursor-pointer transition-all hover:border-[rgba(244,98,58,.4)] hover:-translate-y-0.5 hover:shadow-lg">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-[rgba(244,98,58,.1)]">
          {{ group.emoji || '🏠' }}
        </div>
        <div class="flex-1">
          <div class="text-base font-semibold mb-1">{{ group.name }}</div>
          <div class="text-xs text-[#8A94A6]">點擊進入群組</div>
        </div>
        <div class="text-base font-semibold transition-colors duration-200" :class="getGroupUserBalanceClass(group.id)">
          {{ getGroupUserBalanceText(group.id) }}
        </div>
      </router-link>

      <div v-if="groups.length === 0"
        class="col-span-full text-center py-10 text-[#8A94A6] text-sm border border-dashed border-[rgba(255,255,255,.08)] rounded-2xl">
        目前還沒有任何群組，點擊右上方「＋ 新增」建立一個吧！
      </div>
    </div>
    <!-- 群組列表結束後 -->
    <button @click="openModal"
    class="w-full mt-3 py-3.5 bg-[#F4623A] text-white rounded-2xl text-sm font-medium hover:bg-[#FF8560] transition-all">
    ＋ 新增群組
    </button>


    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
          <div class="relative w-full md:max-w-md bg-[#1A2030] border border-[rgba(255,255,255,.05)] shadow-2xl rounded-t-3xl md:rounded-3xl p-6 z-10">
            <div class="md:hidden w-10 h-1 bg-[rgba(255,255,255,.2)] rounded-full mx-auto mb-5"></div>
            <h2 class="text-lg font-semibold mb-1">建立新群組</h2>
            <p class="text-sm text-[#8A94A6] mb-6">為你的室友、社團或訂閱建立一個分帳空間</p>
            <div class="mb-4">
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">群組名稱</label>
              <input v-model="newGroupName" @keyup.enter="submitGroup" ref="inputRef" type="text" placeholder="例：宿舍 406、系學會公費..." maxlength="30" class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
            </div>
            <div class="mb-6">
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">群組情境</label>
              <div class="flex gap-2 flex-wrap">
                <button v-for="opt in emojiOptions" :key="opt.emoji" @click="selectedEmoji = opt.emoji" :class="['flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs transition-all', selectedEmoji === opt.emoji ? 'bg-[#F4623A]/10 border-[#F4623A]/30 text-[#FF8560]' : 'bg-[#0E1117] border-[rgba(255,255,255,.05)] text-[#8A94A6] hover:border-[rgba(255,255,255,.2)]']">
                  <span class="text-xl">{{ opt.emoji }}</span><span>{{ opt.label }}</span>
                </button>
              </div>
            </div>
            <div v-if="errorMsg" class="mb-4 px-4 py-3 bg-[#F4623A]/10 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">
              {{ errorMsg }}
            </div>
            <button @click="submitGroup" :disabled="isLoading" class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white font-medium hover:bg-[#FF8560] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg">
              <span v-if="isLoading">建立中...</span><span v-else>新增</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const userName = ref('載入中...')
const userAvatar = ref('👤')

const logout = () => {
  localStorage.removeItem('splitmate_username')
  localStorage.removeItem('splitmate_avatar')
  localStorage.removeItem('splitmate_setup_done')
  router.push('/login')
}

onMounted(() => {
  // 檢查登入
  const name = localStorage.getItem('splitmate_username')
  if (!name) { router.push('/login'); return }

  fetchGroups()
  fetchSubscriptions()
})

// ==========================================
// 1. 狀態變數與設定
// ==========================================
const groups = ref([])
const showModal = ref(false)
const newGroupName = ref('')
const selectedEmoji = ref('🏠')
const isLoading = ref(false)
const errorMsg = ref('')
const inputRef = ref(null)

const myTotalBalance = ref(0)       // 🚀 個人跨群組總餘額
const userGroupBalances = ref({})   // 🚀 快取記錄「我」在各別群組的餘額對應

const emojiOptions = [
  { emoji: '🏠', label: '宿舍' },
  { emoji: '🎓', label: '社團' },
  { emoji: '🍜', label: '聚餐' },
  { emoji: '✈️', label: '旅遊' },
  { emoji: '💼', label: '公費' },
]

// ==========================================
// 2. 智慧群組與個人代墊金額抓取邏輯
// ==========================================
const fetchGroups = async () => {
  try {
    const res = await fetch('http://192.168.94.65:3000/api/groups')
    const data = await res.json()
    groups.value = data
    
    // 取得當前本地登入的身分名稱
    const myName = localStorage.getItem('splitmate_username') || '訪客'
    const balanceMap = {}
    let accumulatedTotal = 0

    // 併發向後端各個群組調用 /settle 演算法，將個人淨值加總
    await Promise.all(data.map(async (g) => {
      try {
        const sRes = await fetch(`http://192.168.94.65:3000/api/groups/${g.id}/settle`)
        const sData = await sRes.json()
        // 在結算結果中尋找我的名字
        const myBalObj = sData.balances?.find(b => b.person === myName)
        const amt = myBalObj ? myBalObj.amount : 0
        balanceMap[g.id] = amt
        accumulatedTotal += amt
      } catch (err) {
        console.error(`無法獲取群組 ${g.id} 結算資料:`, err)
        balanceMap[g.id] = 0
      }
    }))

    userGroupBalances.value = balanceMap
    myTotalBalance.value = accumulatedTotal
  } catch (e) {
    console.error('無法連線至後端:', e)
  }
}

// 動態處理右側數值文字
const getGroupUserBalanceText = (groupId) => {
  const amt = userGroupBalances.value[groupId] || 0
  if (amt > 0) return `+${amt}`
  if (amt < 0) return `${amt}`
  return '已結清'
}

// 動態切換右側數值顏色樣式
const getGroupUserBalanceClass = (groupId) => {
  const amt = userGroupBalances.value[groupId] || 0
  if (amt > 0) return 'text-[#2DCE7E]'
  if (amt < 0) return 'text-[#F4623A]'
  return 'text-var(--slate)'
}

const openModal = async () => {
  showModal.value = true
  errorMsg.value = ''
  newGroupName.value = ''
  selectedEmoji.value = '🏠'
  await nextTick()
  inputRef.value?.focus()
}

const closeModal = () => { if (isLoading.value) return; showModal.value = false }

const submitGroup = async () => {
  const name = newGroupName.value.trim()
  if (!name) { errorMsg.value = '請輸入群組名稱'; inputRef.value?.focus(); return }
  isLoading.value = true; errorMsg.value = ''

  try {
    const res = await fetch('http://192.168.94.65:3000/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, emoji: selectedEmoji.value })
    })
    
    if (res.ok) { 
      await fetchGroups()
      showModal.value = false // 👈 強制關閉視窗
      newGroupName.value = '' // 👈 清空輸入框
    } else { 
      const err = await res.json(); errorMsg.value = '伺服器錯誤：' + err.error 
    }
  } catch (e) {
    errorMsg.value = '⚠️ 無法連線到後端伺服器，請確認 server 是否已啟動'
  } finally { 
    isLoading.value = false 
  }
}

// ==========================================
// 3. 訂閱排程模組邏輯
// ==========================================
const subscriptions = ref([])

const fetchSubscriptions = async () => {
  try {
    const res = await fetch('http://192.168.94.65:3000/api/subscriptions')
    subscriptions.value = await res.json()
  } catch (error) {
    console.error('無法連線至後端取得訂閱:', error)
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
  if (currentDay > billingDay) targetDate = new Date(currentYear, currentMonth + 1, billingDay)
  return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))
}

const getProgress = (billingDay) => {
  return `${Math.max(0, 100 - (getDaysLeft(billingDay) / 30 * 100))}%`
}

const topSubscriptions = computed(() => {
  return [...subscriptions.value]
    .sort((a, b) => getDaysLeft(a.billing_day) - getDaysLeft(b.billing_day))
    .slice(0, 3)
})

onMounted(() => {
  fetchGroups()
  fetchSubscriptions()
})
</script>