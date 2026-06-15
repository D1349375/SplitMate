<template>
  <div class="pb-10">
    <div class="mb-6">
      <router-link to="/" class="inline-block bg-white/5 border border-white/10 text-[#F7F4EE] px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-all">
        ← 返回首頁
      </router-link>
    </div>

    <div class="mb-4 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight mb-1">
          {{ groupData ? `${groupData.emoji || ''} ${groupData.name}` : '載入中...' }}
        </h1>
        <p class="text-[#8A94A6] text-sm">本月待結算金額：NT$ {{ totalAmount }}</p>
      </div>
      <button @click="copyInviteLink" class="bg-[rgba(255,255,255,.05)] border border-[rgba(255,255,255,.08)] text-white px-3 py-1.5 rounded-full text-xs hover:bg-[rgba(255,255,255,.1)] transition-all">
        🔗 複製邀請連結
      </button>
    </div>

    <!-- 成員 chips：從 API 動態讀取 -->
    <div class="flex flex-wrap gap-2 mb-5">
      <button
        v-for="member in members"
        :key="member"
        @click="currentUser = member; saveUsername(member)"
        :class="[
          'px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all border',
          currentUser === member
            ? 'bg-[#F4623A]/10 border-[#F4623A]/30 text-[#FF8560]'
            : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
        ]"
      >
        {{ member }}{{ member === currentUser ? '（我）' : '' }}
      </button>
    </div>

    <!-- 開發用身份快速切換工具列 -->
    <div class="mb-5 p-3 bg-[rgba(239,159,39,.06)] border border-[rgba(239,159,39,.2)] rounded-xl">
      <div class="text-[11px] text-[#EF9F27] mb-2 tracking-widest uppercase font-medium">🛠 開發模式：快速切換身份</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="member in members"
          :key="'dev-' + member"
          @click="switchUser(member)"
          :class="[
            'px-3 py-1 rounded-lg text-xs border transition-all',
            currentUser === member
              ? 'bg-[#EF9F27]/20 border-[#EF9F27]/50 text-[#EF9F27]'
              : 'bg-white/5 border-white/10 text-[#8A94A6] hover:text-white'
          ]"
        >
          {{ member }}
        </button>
        <button
          @click="openAddMemberModal"
          class="px-3 py-1 rounded-lg text-xs border border-dashed border-white/20 text-[#8A94A6] hover:text-white hover:border-white/40 transition-all"
        >
          ＋ 新增成員
        </button>
      </div>
      <div class="text-[10px] text-[#8A94A6] mt-2">目前身份：<span class="text-[#EF9F27]">{{ currentUser }}</span>・上線前請移除此工具列</div>
    </div>

    <div class="flex gap-2 mb-8">
      <router-link to="/scan" class="flex-1 text-center bg-[#F4623A] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#FF8560] transition-all shadow-md">
        📷 掃收據
      </router-link>
      <button @click="openExpenseModal" class="flex-1 bg-white/5 border border-white/10 text-white py-2.5 rounded-full text-sm font-medium hover:bg-white/10 transition-all">
        ✏️ 手動記帳
      </button>
      <router-link :to="`/group/${groupId}/settle`" class="flex-1 text-center bg-white/5 border border-white/10 text-white py-2.5 rounded-full text-sm font-medium hover:bg-white/10 transition-all">
        ⚡ 結算
      </router-link>
    </div>

    <div class="text-xs text-[#8A94A6] tracking-widest mb-3 uppercase">帳目紀錄</div>
    <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div v-for="exp in expenses" :key="exp.id" class="flex items-center gap-4 py-4 border-b border-white/10 last:border-0 last:pb-0 first:pt-0">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0 bg-[#F4623A]/15 text-[#F4623A]">
          {{ exp.paid_by.charAt(0) }}
        </div>
        <div class="flex-1">
          <div class="text-[15px] font-medium mb-1">{{ exp.title }}</div>
          <div class="text-xs text-[#8A94A6]">{{ exp.paid_by }} 付・{{ exp.split_method }}</div>
        </div>
        <div class="text-base font-semibold text-[#F4623A]">NT$ {{ exp.amount }}</div>
      </div>

      <div v-if="expenses.length === 0" class="text-center py-6 text-[#8A94A6] text-sm border border-dashed border-white/10 rounded-xl">
        目前還沒有任何帳目，點擊上方「手動記帳」新增一筆吧！
      </div>
    </div>

    <!-- 新增帳目 Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeExpenseModal"></div>
          <div class="relative w-full md:max-w-md bg-[#1A2030] border border-[rgba(255,255,255,.05)] shadow-2xl rounded-t-3xl md:rounded-3xl p-6 z-10">
            <div class="md:hidden w-10 h-1 bg-[rgba(255,255,255,.2)] rounded-full mx-auto mb-5"></div>
            <h2 class="text-lg font-semibold mb-1">新增一筆帳目</h2>
            <p class="text-sm text-[#8A94A6] mb-6">目前的付款人：<span class="text-[#F4623A]">{{ currentUser }}</span></p>

            <div class="mb-4">
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">花費項目</label>
              <input v-model="newExpenseTitle" ref="titleInputRef" type="text" placeholder="例：晚餐、水電費、衛生紙..." maxlength="30"
                class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
            </div>

            <div class="mb-6">
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">總金額 (NT$)</label>
              <input v-model="newExpenseAmount" @keyup.enter="submitExpense" type="number" placeholder="0"
                class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
            </div>

            <div v-if="errorMsg" class="mb-4 px-4 py-3 bg-[#F4623A]/10 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">
              {{ errorMsg }}
            </div>

            <button @click="submitExpense" :disabled="isLoading"
              class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white font-medium hover:bg-[#FF8560] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg">
              <span v-if="isLoading">處理中...</span>
              <span v-else>新增</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 新增成員 Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddMemberModal" class="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddMemberModal = false"></div>
          <div class="relative w-full md:max-w-md bg-[#1A2030] border border-[rgba(255,255,255,.05)] shadow-2xl rounded-t-3xl md:rounded-3xl p-6 z-10">
            <div class="md:hidden w-10 h-1 bg-[rgba(255,255,255,.2)] rounded-full mx-auto mb-5"></div>
            <h2 class="text-lg font-semibold mb-1">新增成員</h2>
            <p class="text-sm text-[#8A94A6] mb-6">將新成員加入此群組的分帳計算</p>

            <div class="mb-6">
              <label class="text-xs text-[#8A94A6] tracking-widest uppercase block mb-2">成員名稱</label>
              <input v-model="newMemberName" ref="memberInputRef" type="text" placeholder="例：阿花、大雄..." maxlength="20" @keyup.enter="submitMember"
                class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] placeholder-[#8A94A6] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
            </div>

            <div v-if="memberErrorMsg" class="mb-4 px-4 py-3 bg-[#F4623A]/10 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">
              {{ memberErrorMsg }}
            </div>

            <button @click="submitMember" :disabled="isMemberLoading"
              class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white font-medium hover:bg-[#FF8560] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg">
              <span v-if="isMemberLoading">加入中...</span>
              <span v-else>加入群組</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const groupId = route.params.id

localStorage.setItem('splitmate_last_group_id', groupId)

const groupData = ref(null)
const expenses = ref([])
const members = ref([])
const currentUser = ref('')

// ── 使用者身份 ──────────────────────────────────────────────
const initUserIdentity = async () => {
  let name = localStorage.getItem('splitmate_username')
  if (!name) {
    name = prompt('歡迎來到 SplitMate！請輸入你的顯示名稱：') || '訪客'
    localStorage.setItem('splitmate_username', name)
  }
  currentUser.value = name

  // 自動把自己加入群組成員（若已存在則後端靜默略過）
  await joinGroup(name)
  await fetchMembers()
}

const saveUsername = (name) => {
  localStorage.setItem('splitmate_username', name)
}

// 開發用：切換身份
const switchUser = async (name) => {
  currentUser.value = name
  saveUsername(name)
}

// ── API 呼叫 ────────────────────────────────────────────────
const joinGroup = async (name) => {
  try {
    await fetch(`http://localhost:3000/api/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
  } catch (e) {
    console.error('加入群組失敗:', e)
  }
}

const fetchMembers = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/groups/${groupId}/members`)
    const data = await res.json()
    members.value = data.map(m => m.name)
  } catch (e) {
    console.error('無法取得成員名單:', e)
  }
}

const fetchGroupDetails = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/groups/${groupId}`)
    groupData.value = await res.json()
  } catch (error) {
    console.error('無法取得群組資料', error)
  }
}

const fetchExpenses = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/groups/${groupId}/expenses`)
    expenses.value = await res.json()
  } catch (error) {
    console.error('無法取得帳目資料', error)
  }
}

const copyInviteLink = () => {
  const link = window.location.href
  navigator.clipboard.writeText(`來加入我的 SplitMate 群組一起分帳吧！\n👉 ${link}`)
  alert('✅ 邀請連結已複製！快貼到 LINE 群組給朋友吧！')
}

const totalAmount = computed(() => {
  return expenses.value.reduce((sum, exp) => sum + exp.amount, 0)
})

// ── 新增帳目 Modal ──────────────────────────────────────────
const showModal = ref(false)
const newExpenseTitle = ref('')
const newExpenseAmount = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const titleInputRef = ref(null)

const openExpenseModal = async () => {
  showModal.value = true
  errorMsg.value = ''
  newExpenseTitle.value = ''
  newExpenseAmount.value = ''
  await nextTick()
  titleInputRef.value?.focus()
}

const closeExpenseModal = () => {
  if (isLoading.value) return
  showModal.value = false
}

const submitExpense = async () => {
  const title = newExpenseTitle.value.trim()
  const amount = Number(newExpenseAmount.value)

  if (!title) { errorMsg.value = '請輸入花費項目！'; titleInputRef.value?.focus(); return }
  if (!amount || amount <= 0) { errorMsg.value = '請輸入有效的總金額！'; return }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await fetch(`http://localhost:3000/api/groups/${groupId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, paid_by: currentUser.value, split_method: '平分' })
    })

    if (res.ok) {
      await fetchExpenses()
      closeExpenseModal()
    } else {
      const err = await res.json()
      errorMsg.value = '記帳失敗：' + err.error
    }
  } catch (error) {
    errorMsg.value = 'API 連線錯誤，請確認後端是否運作中'
  } finally {
    isLoading.value = false
  }
}

// ── 新增成員 Modal ──────────────────────────────────────────
const showAddMemberModal = ref(false)
const newMemberName = ref('')
const isMemberLoading = ref(false)
const memberErrorMsg = ref('')
const memberInputRef = ref(null)

const openAddMemberModal = async () => {
  showAddMemberModal.value = true
  newMemberName.value = ''
  memberErrorMsg.value = ''
  await nextTick()
  memberInputRef.value?.focus()
}

const submitMember = async () => {
  const name = newMemberName.value.trim()
  if (!name) { memberErrorMsg.value = '請輸入成員名稱'; return }

  isMemberLoading.value = true
  memberErrorMsg.value = ''

  try {
    const res = await fetch(`http://localhost:3000/api/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })

    if (res.ok) {
      await fetchMembers()
      showAddMemberModal.value = false
    } else {
      const err = await res.json()
      memberErrorMsg.value = '加入失敗：' + err.error
    }
  } catch (error) {
    memberErrorMsg.value = 'API 連線錯誤'
  } finally {
    isMemberLoading.value = false
  }
}

onMounted(async () => {
  await fetchGroupDetails()
  await fetchExpenses()
  await initUserIdentity()
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