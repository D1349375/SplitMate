<template>
  <div class="pb-10 relative">
    
    <Teleport to="body">
      <div :class="['toast-custom fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#2DCE7E]/15 border border-[#2DCE7E]/40 text-[#2DCE7E] px-6 py-3 rounded-full text-sm font-medium backdrop-blur-md z-[9999] transition-all duration-300 shadow-xl pointer-events-none', 
                   toastShow ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95 pointer-events-none']">
        {{ toastMessage }}
      </div>
    </Teleport>

    <div class="mb-6">
      <router-link :to="`/group/${groupId}`" class="inline-block bg-white/5 border border-white/10 text-[#F7F4EE] px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-all">
        ← 返回群組
      </router-link>
    </div>

    <div class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight mb-1">AI 掃收據</h1>
      <p class="text-[#8A94A6] text-sm">
        運用 Cloud Vision 自動辨識品項與金額，點擊即可認領
        <span v-if="groupData" class="text-[#F4623A]">（歸屬：{{ groupData.name }}）</span>
      </p>
    </div>

    <div v-if="!scanCompleted" 
         @click="triggerMockScan" 
         class="w-full h-60 border-2 border-dashed border-[#F4623A]/40 bg-[#F4623A]/4 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer relative overflow-hidden transition-all duration-200 hover:bg-[#F4623A]/8 hover:border-[#F4623A]/60">
      
      <div v-if="isScanning" class="scan-line-anim absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#F4623A] to-transparent"></div>
      
      <div class="text-[48px] leading-none transition-all duration-300">
        {{ isScanning ? '⏳' : '📷' }}
      </div>
      <div class="text-sm text-[#8A94A6] font-medium tracking-wide">
        {{ isScanning ? '連線至 Cloud Vision API 辨識中...' : '點擊模擬拍照或上傳圖檔' }}
      </div>
    </div>

    <div v-else class="animate-fadeIn">
      <div class="text-xs text-[#8A94A6] tracking-widest mb-[12px] uppercase font-medium">辨識結果：點選你吃／喝的品項</div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[20px]">
        <div 
          v-for="(item, index) in mockItems" 
          :key="index"
          @click="toggleItemClaim(index)"
          :class="[
            'flex items-center justify-between p-[14px_16px] rounded-[12px] border cursor-pointer transition-all duration-180 select-none',
            claimedIndexes.has(index)
              ? 'bg-[#2DCE7E]/8 border-[#2DCE7E]/30'
              : 'bg-white/[.03] border-transparent hover:bg-white/[.06]'
          ]"
        >
          <span class="text-[15px] claim-name text-white">{{ item.name }}</span>
          <div class="flex items-center gap-[12px] shrink-0">
            <span class="text-[15px] font-medium text-[#FF8560]">NT$ {{ item.price }}</span>
            
            <div :class="[
              'w-[24px] h-[24px] rounded-full border flex items-center justify-center text-[12px] transition-all duration-180 shrink-0 font-bold',
              claimedIndexes.has(index) 
                ? 'bg-[#2DCE7E] border-[#2DCE7E] text-white' 
                : 'border-white/[.08] text-transparent'
            ]">
              {{ claimedIndexes.has(index) ? '✓' : '' }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-[#2DCE7E]/10 to-transparent border border-[#2DCE7E]/30 rounded-[16px] p-[20px] mb-[20px] flex justify-between items-center">
        <div>
          <div class="text-[14px] font-medium text-[#2DCE7E]">我該付的總額</div>
          <div class="text-[13px] text-[#8A94A6] mt-[6px] max-w-[200px] md:max-w-md truncate">
            {{ claimedItemsLabel }}
          </div>
        </div>
        <div class="text-[28px] font-semibold text-[#2DCE7E]">NT$ {{ myTotalAmount }}</div>
      </div>

      <div class="text-right">
        <button 
          @click="submitClaimToDatabase" 
          :disabled="myTotalAmount === 0 || isSubmitting"
          class="w-full md:w-auto md:min-w-[200px] bg-[#F4623A] text-white py-[12px] px-[24px] rounded-[24px] text-[14px] font-medium hover:bg-[#FF8560] transition-all duration-180 disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
          {{ isSubmitting ? '正在寫入帳本...' : '確認認領並寫入帳本' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const groupId = ref(localStorage.getItem('splitmate_last_group_id') || '1')
const groupData = ref(null)
const isScanning = ref(false)
const scanCompleted = ref(false)
const isSubmitting = ref(false)

// Toast 專用狀態
const toastShow = ref(false)
const toastMessage = ref('')

const claimedIndexes = ref(new Set())

const mockItems = [
  { name: '炸雞塊（6塊）', price: 120 },
  { name: '薯條（大）', price: 85 },
  { name: '珍珠奶茶', price: 65 },
  { name: '可樂（M）', price: 45 },
  { name: '草莓聖代', price: 75 },
  { name: '鱈魚堡', price: 95 },
]

const myTotalAmount = computed(() => {
  let sum = 0
  claimedIndexes.value.forEach(index => { sum += mockItems[index].price })
  return sum
})

const claimedItemsLabel = computed(() => {
  const names = []
  claimedIndexes.value.forEach(index => { names.push(mockItems[index].name.split('（')[0]) })
  return names.length ? names.join('、') : '尚未選取任何品項'
})

const triggerToast = (msg) => {
  toastMessage.value = msg
  toastShow.value = true
  setTimeout(() => { toastShow.value = false }, 2500)
}

const fetchGroupDetails = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/groups/${groupId.value}`)
    if (res.ok) groupData.value = await res.json()
  } catch (error) {
    console.error(error)
  }
}

const triggerMockScan = () => {
  if (isScanning.value) return
  isScanning.value = true
  setTimeout(() => {
    isScanning.value = false
    scanCompleted.value = true
    claimedIndexes.value.clear()
  }, 2000)
}

const toggleItemClaim = (index) => {
  if (claimedIndexes.value.has(index)) {
    claimedIndexes.value.delete(index)
  } else {
    claimedIndexes.value.add(index)
  }
}

const submitClaimToDatabase = async () => {
  if (myTotalAmount.value === 0) return
  isSubmitting.value = true

  const currentUser = localStorage.getItem('splitmate_username') || '小明'

  try {
    const res = await fetch(`http://localhost:3000/api/groups/${groupId.value}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `📷 收據認領: ${claimedItemsLabel.value}`,
        amount: myTotalAmount.value,
        paid_by: currentUser,
        split_method: '個人認領'
      })
    })

    if (res.ok) {
      triggerToast(`✅ 已成功將你的份額 (NT$ ${myTotalAmount.value}) 寫入 ${groupData.value?.name || ''} 帳本！`)
      setTimeout(() => {
        router.push(`/group/${groupId.value}`)
      }, 1500)
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchGroupDetails()
})
</script>

<style scoped>
@keyframes scan {
  0% { top: 10px; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: calc(100% - 10px); opacity: 0; }
}
.scan-line-anim { animation: scan 2s ease-in-out infinite; }
.animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>