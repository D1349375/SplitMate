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
      <div class="flex flex-col gap-2 items-end">
        <button @click="copyInviteLink" class="bg-[rgba(255,255,255,.05)] border border-[rgba(255,255,255,.08)] text-white px-3 py-1.5 rounded-full text-xs hover:bg-[rgba(255,255,255,.1)] transition-all">
          🔗 複製連結
        </button>
        <button @click="deleteGroup" class="text-[#F4623A] border border-[#F4623A]/30 bg-[#F4623A]/10 px-3 py-1.5 rounded-full text-xs hover:bg-[#F4623A]/20 transition-all">
          🗑️ 刪除群組
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-5">
      <button v-for="member in members" :key="member" @click="switchUser(member)"
        :class="['px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all border',
          currentUser === member ? 'bg-[#F4623A]/10 border-[#F4623A]/30 text-[#FF8560]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white']">
        {{ member }}{{ member === currentUser ? '（我）' : '' }}
      </button>
    </div>

    <div class="mb-5 p-3 bg-[rgba(239,159,39,.06)] border border-[rgba(239,159,39,.2)] rounded-xl hidden md:block">
      <div class="text-[11px] text-[#EF9F27] mb-2 tracking-widest uppercase font-medium">🛠 開發模式：快速切換身份</div>
      <div class="flex flex-wrap gap-2">
        <button v-for="member in members" :key="'dev-' + member" @click="switchUser(member)"
          :class="['px-3 py-1 rounded-lg text-xs border transition-all', currentUser === member ? 'bg-[#EF9F27]/20 border-[#EF9F27]/50 text-[#EF9F27]' : 'bg-white/5 border-white/10 text-[#8A94A6] hover:text-white']">
          {{ member }}
        </button>
        <button @click="openAddMemberModal" class="px-3 py-1 rounded-lg text-xs border border-dashed border-white/20 text-[#8A94A6] hover:text-white hover:border-white/40 transition-all">
          ＋ 新增成員
        </button>
      </div>
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

    <div class="text-xs text-[#8A94A6] tracking-widest mb-3 uppercase flex justify-between items-center">
      <span>帳目紀錄</span>
      <span v-if="expenses.length > 0" class="text-[10px] text-[#8A94A6]/60">點擊可查看明細</span>
    </div>
    
    <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div v-for="exp in expenses" :key="exp.id" @click="openExpenseDetail(exp)"
           class="flex items-center gap-3 py-3 border-b border-white/10 last:border-0 last:pb-0 first:pt-0 cursor-pointer hover:bg-white/5 px-2 -mx-2 rounded-xl transition-all">
        
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0 bg-[#F4623A]/15 text-[#F4623A] overflow-hidden border border-[#F4623A]/30">
          <img v-if="isImage(getAvatar(exp.paid_by))" :src="getAvatar(exp.paid_by)" class="w-full h-full object-cover" />
          <span v-else class="text-lg">{{ getAvatar(exp.paid_by) }}</span>
        </div>

        <div class="flex-1">
          <div class="text-[15px] font-medium mb-1">{{ exp.title }}</div>
          <div class="text-xs text-[#8A94A6]">{{ exp.paid_by }} 付・{{ members.length }} 人平分</div>
        </div>
        <div class="text-base font-semibold" :class="exp.paid_by === currentUser ? 'text-[#2DCE7E]' : 'text-[#F4623A]'">
          {{ exp.paid_by === currentUser ? '+' : '-' }}{{ calcMyShare(exp) }}
        </div>
      </div>

      <div v-if="expenses.length === 0" class="text-center py-6 text-[#8A94A6] text-sm border border-dashed border-white/10 rounded-xl">
        目前還沒有任何帳目，點擊上方「手動記帳」新增一筆吧！
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetailModal" class="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeExpenseDetail"></div>
          <div class="relative w-full md:max-w-md bg-[#1A2030] border border-[rgba(255,255,255,.05)] shadow-2xl rounded-t-3xl md:rounded-3xl p-6 z-10">
            <div class="md:hidden w-10 h-1 bg-[rgba(255,255,255,.2)] rounded-full mx-auto mb-5"></div>
            
            <div class="flex justify-between items-start mb-6">
              <div>
                <div class="text-xs text-[#8A94A6] tracking-widest uppercase mb-1">帳目明細</div>
                <h2 class="text-2xl font-semibold text-[#F7F4EE]">{{ selectedExpense?.title }}</h2>
              </div>
              <div class="text-right">
                <div class="text-xs text-[#8A94A6] tracking-widest uppercase mb-1">總金額</div>
                <div class="text-2xl font-semibold text-[#F4623A]">NT$ {{ selectedExpense?.amount }}</div>
              </div>
            </div>

            <div class="bg-[rgba(255,255,255,.03)] border border-[rgba(255,255,255,.05)] rounded-2xl p-4 mb-6">
              <div class="text-xs text-[#8A94A6] mb-3 uppercase tracking-wider">墊付人</div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-semibold bg-[#2DCE7E]/15 text-[#2DCE7E] overflow-hidden border border-[#2DCE7E]/30">
                  <img v-if="isImage(getAvatar(selectedExpense?.paid_by))" :src="getAvatar(selectedExpense?.paid_by)" class="w-full h-full object-cover" />
                  <span v-else>{{ getAvatar(selectedExpense?.paid_by) }}</span>
                </div>
                <span class="text-base font-medium">{{ selectedExpense?.paid_by }}</span>
                <span class="ml-auto text-sm text-[#2DCE7E]">為大家墊付了 NT$ {{ selectedExpense?.amount }}</span>
              </div>
            </div>

            <div class="mb-8">
              <div class="text-xs text-[#8A94A6] mb-3 uppercase tracking-wider">分攤明細 ({{ members.length }} 人{{ selectedExpense?.split_method || '平分' }})</div>
              <div class="flex flex-col gap-3">
                <div v-for="member in members" :key="member" class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-white/10 text-white overflow-hidden text-xs">
                      <img v-if="isImage(getAvatar(member))" :src="getAvatar(member)" class="w-full h-full object-cover" />
                      <span v-else>{{ getAvatar(member) }}</span>
                    </div>
                    <span :class="member === currentUser ? 'text-[#F4623A] font-medium' : 'text-[#F7F4EE]'">
                      {{ member }}{{ member === currentUser ? ' (你)' : '' }}
                    </span>
                  </div>
                  <span class="text-sm text-[#8A94A6]">應負擔 <strong class="text-white font-medium">NT$ {{ Math.round(selectedExpense?.amount / members.length) }}</strong></span>
                </div>
              </div>
            </div>

            <button @click="deleteExpense" :disabled="isDeleting"
              class="w-full py-3.5 rounded-xl border border-[#F4623A]/40 text-[#FF8560] bg-[#F4623A]/10 font-medium hover:bg-[#F4623A]/20 transition-all text-sm flex justify-center items-center gap-2">
              <span v-if="isDeleting">刪除中...</span>
              <span v-else>🗑️ 刪除此筆帳目</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

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

            <div v-if="errorMsg" class="mb-4 px-4 py-3 bg-[#F4623A]/10 border border-[#F4623A]/20 rounded-xl text-sm text-[#FF8560]">{{ errorMsg }}</div>

            <button @click="submitExpense" :disabled="isLoading"
              class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white font-medium hover:bg-[#FF8560] disabled:opacity-50 transition-all text-sm shadow-lg">
              <span v-if="isLoading">處理中...</span><span v-else>新增</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddMemberModal" class="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddMemberModal = false"></div>
          <div class="relative w-full md:max-w-md bg-[#1A2030] border border-[rgba(255,255,255,.05)] shadow-2xl rounded-t-3xl md:rounded-3xl p-6 z-10">
            <h2 class="text-lg font-semibold mb-1">新增成員</h2>
            <div class="mb-6 mt-4">
              <input v-model="newMemberName" ref="memberInputRef" type="text" placeholder="輸入成員名稱" maxlength="20" @keyup.enter="submitMember"
                class="w-full bg-[#0E1117] border border-[rgba(255,255,255,.05)] rounded-xl px-4 py-3 text-[#F7F4EE] outline-none focus:border-[rgba(244,98,58,.5)] transition-all text-sm" />
            </div>
            <button @click="submitMember" :disabled="isMemberLoading" class="w-full py-3.5 rounded-xl bg-[#F4623A] text-white font-medium hover:bg-[#FF8560] transition-all text-sm">
              <span v-if="isMemberLoading">加入中...</span><span v-else>加入群組</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const groupId = route.params.id

localStorage.setItem('splitmate_last_group_id', groupId)

const groupData = ref(null)
const expenses = ref([])
const members = ref([])
const currentUser = ref('')

const globalAvatars = ref(JSON.parse(localStorage.getItem('splitmate_global_avatars') || '{}'))
const isImage = (str) => str && str.startsWith('data:image')
const getAvatar = (name) => globalAvatars.value[name] || name.charAt(0).toUpperCase()

const initUserIdentity = async () => {
  let name = localStorage.getItem('splitmate_username')
  if (!name) {
    name = prompt('歡迎來到 SplitMate！請輸入你的顯示名稱：') || '訪客'
    localStorage.setItem('splitmate_username', name)
  }
  currentUser.value = name
  await joinGroup(name)
  await fetchMembers()
}

const saveUsername = (name) => localStorage.setItem('splitmate_username', name)
const switchUser = async (name) => { currentUser.value = name; saveUsername(name) }

const joinGroup = async (name) => {
  try {
    await fetch(`http://192.168.94.65:3000/api/groups/${groupId}/members`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
    })
  } catch (e) { console.error(e) }
}

const fetchMembers = async () => {
  try {
    const res = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}/members`)
    const data = await res.json()
    members.value = data.map(m => m.name)
  } catch (e) { console.error(e) }
}

const fetchGroupDetails = async () => {
  try {
    const res = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}`)
    groupData.value = await res.json()
  } catch (error) { console.error(error) }
}

const fetchExpenses = async () => {
  try {
    const res = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}/expenses`)
    expenses.value = await res.json()
  } catch (error) { console.error(error) }
}

const copyInviteLink = () => {
  const link = window.location.href
  navigator.clipboard.writeText(`來加入我的 SplitMate 群組一起分帳吧！\n👉 ${link}`)
  alert('✅ 邀請連結已複製！快貼到 LINE 群組給朋友吧！')
}

const totalAmount = computed(() => {
  return expenses.value.reduce((sum, exp) => sum + exp.amount, 0)
})

const deleteGroup = async () => {
  try {
    const settleRes = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}/settle`)
    const settleData = await settleRes.json()
    if (settleData.transfers && settleData.transfers.length > 0) {
      alert('⚠️ 無法刪除：群組內尚有未結清的款項！請先結算並還款。'); return
    }
    if (confirm('確定要永久刪除這個群組嗎？此動作無法復原！')) {
      const res = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}`, { method: 'DELETE' })
      if (res.ok) { alert('✅ 群組已成功刪除'); router.push('/') }
    }
  } catch (e) { console.error(e) }
}

const calcMyShare = (exp) => {
  if (exp.paid_by === currentUser.value) {
    return Math.round(exp.amount - exp.amount / members.value.length)
  } else {
    return Math.round(exp.amount / members.value.length)
  }
}

// =========================================
// 🚀 單筆明細與刪除邏輯
// =========================================
const showDetailModal = ref(false)
const selectedExpense = ref(null)
const isDeleting = ref(false)

const openExpenseDetail = (exp) => {
  selectedExpense.value = exp
  showDetailModal.value = true
}

const closeExpenseDetail = () => {
  if (isDeleting.value) return
  showDetailModal.value = false
  setTimeout(() => { selectedExpense.value = null }, 250) // 等待動畫結束後清空
}

const deleteExpense = async () => {
  if (!confirm(`確定要刪除「${selectedExpense.value.title}」這筆帳目嗎？`)) return

  isDeleting.value = true
  try {
    const res = await fetch(`http://192.168.94.65:3000/api/expenses/${selectedExpense.value.id}`, {
      method: 'DELETE'
    })
    
    if (res.ok) {
      await fetchExpenses() // 重新撈取帳目，畫面會自動更新
      showDetailModal.value = false
    } else {
      alert('刪除失敗，請確認該筆帳目是否存在')
    }
  } catch (e) {
    alert('API 連線錯誤，無法刪除')
  } finally {
    isDeleting.value = false
  }
}

// =========================================
// 新增帳目與成員 Modal
// =========================================
const showModal = ref(false)
const newExpenseTitle = ref('')
const newExpenseAmount = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const titleInputRef = ref(null)

const openExpenseModal = async () => {
  showModal.value = true; errorMsg.value = ''; newExpenseTitle.value = ''; newExpenseAmount.value = ''
  await nextTick(); titleInputRef.value?.focus()
}

const closeExpenseModal = () => { if (isLoading.value) return; showModal.value = false }

const submitExpense = async () => {
  const title = newExpenseTitle.value.trim()
  const amount = Number(newExpenseAmount.value)
  if (!title) { errorMsg.value = '請輸入花費項目！'; titleInputRef.value?.focus(); return }
  if (!amount || amount <= 0) { errorMsg.value = '請輸入有效的總金額！'; return }

  isLoading.value = true; errorMsg.value = ''
  try {
    const res = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}/expenses`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, paid_by: currentUser.value, split_method: '平分' })
    })
    if (res.ok) {
      await fetchExpenses()
      showModal.value = false
      newExpenseTitle.value = ''
      newExpenseAmount.value = ''
    } else {
      const err = await res.json(); errorMsg.value = '記帳失敗：' + err.error
    }
  } catch (error) {
    errorMsg.value = 'API 連線錯誤'
  } finally { isLoading.value = false }
}

const showAddMemberModal = ref(false)
const newMemberName = ref('')
const isMemberLoading = ref(false)
const memberErrorMsg = ref('')
const memberInputRef = ref(null)

const openAddMemberModal = async () => {
  showAddMemberModal.value = true; newMemberName.value = ''; memberErrorMsg.value = ''
  await nextTick(); memberInputRef.value?.focus()
}

const submitMember = async () => {
  const name = newMemberName.value.trim()
  if (!name) { memberErrorMsg.value = '請輸入成員名稱'; return }
  isMemberLoading.value = true; memberErrorMsg.value = ''
  try {
    const res = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}/members`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
    })
    if (res.ok) { await fetchMembers(); showAddMemberModal.value = false } 
    else { const err = await res.json(); memberErrorMsg.value = '加入失敗：' + err.error }
  } catch (error) { memberErrorMsg.value = 'API 連線錯誤' } 
  finally { isMemberLoading.value = false }
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