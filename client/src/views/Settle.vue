<template>
  <div class="pb-10">
    <div class="mb-6">
      <router-link :to="`/group/${groupId}`" class="inline-block bg-white/5 border border-white/10 text-[#F7F4EE] px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-all">
        ← 返回群組
      </router-link>
    </div>
    
    <div class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight mb-1">智慧結算</h1>
      <p class="text-[#8A94A6] text-sm">{{ groupData ? groupData.name : '載入中...' }}已化簡</p>
    </div>

    <div class="text-xs text-[#8A94A6] tracking-widest mb-3 uppercase">各人淨餘額</div>
    <div class="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
      
      <div v-for="bal in balances" :key="bal.person" class="flex flex-col items-center gap-2 shrink-0 bg-[rgba(255,255,255,.04)] p-4 border border-[rgba(255,255,255,.08)] rounded-2xl min-w-[100px]">
        <div class="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-xl transition-colors overflow-hidden border"
             :class="bal.amount >= 0 ? 'bg-[rgba(45,206,126,.12)] text-[#2DCE7E] border-[#2DCE7E]/30' : 'bg-[rgba(244,98,58,.15)] text-[#F4623A] border-[#F4623A]/30'">
          <img v-if="isImage(getAvatar(bal.person))" :src="getAvatar(bal.person)" class="w-full h-full object-cover" />
          <span v-else>{{ getAvatar(bal.person) }}</span>
        </div>
        <div class="text-base font-semibold" :class="bal.amount >= 0 ? 'text-[#2DCE7E]' : 'text-[#F4623A]'">
          {{ bal.amount > 0 ? '+' : '' }}{{ bal.amount }}
        </div>
        <div class="text-xs text-[#8A94A6]">{{ bal.person }}</div>
      </div>
      
    </div>

    <div class="text-xs text-[#8A94A6] tracking-widest mb-3 uppercase">最少轉帳路徑（{{ transfers.length }} 筆）</div>
    
    <div v-if="transfers.length === 0" class="text-center py-6 text-[#8A94A6] text-sm border border-dashed border-white/10 rounded-xl mb-4">
      目前沒有任何待結算款項！大家都不互欠喔 🎉
    </div>

    <div v-for="(t, index) in transfers" :key="index" class="flex items-center gap-4 p-5 bg-gradient-to-r from-[rgba(45,206,126,.08)] to-transparent border border-[rgba(45,206,126,.2)] rounded-2xl mb-3">
      
      <div class="flex items-center gap-2 text-[15px] font-medium">
        <div class="w-9 h-9 rounded-full flex items-center justify-center font-semibold bg-[rgba(45,206,126,.12)] text-[#2DCE7E] text-base overflow-hidden border border-[#2DCE7E]/30">
          <img v-if="isImage(getAvatar(t.from))" :src="getAvatar(t.from)" class="w-full h-full object-cover" />
          <span v-else>{{ getAvatar(t.from) }}</span>
        </div>
        {{ t.from }}
      </div>

      <div class="text-[#8A94A6] text-xl flex-1 text-center">→</div>
      
      <div class="flex items-center gap-2 text-[15px] font-medium">
        <div class="w-9 h-9 rounded-full flex items-center justify-center font-semibold bg-[rgba(244,98,58,.15)] text-[#F4623A] text-base overflow-hidden border border-[#F4623A]/30">
          <img v-if="isImage(getAvatar(t.to))" :src="getAvatar(t.to)" class="w-full h-full object-cover" />
          <span v-else>{{ getAvatar(t.to) }}</span>
        </div>
        {{ t.to }}
      </div>

      <div class="flex-1"></div>
      <div class="text-lg font-semibold text-[#F4623A]">NT$ {{ t.amount }}</div>
      <div class="w-12 h-12 grid grid-cols-5 gap-[1px] shrink-0 bg-white p-[2px] rounded-md" v-html="generateQR()"></div>
    </div>
    
    <div v-if="transfers.length > 0" class="mt-4 p-4 bg-[rgba(239,159,39,.06)] border border-[rgba(239,159,39,.2)] rounded-xl text-[13px] text-[#EF9F27]">
      💡 系統建議：金額低於 NT$ 100 的小額欠款可保留至下次記帳抵扣，避免手續費浪費。
    </div>
    
    <button v-if="transfers.length > 0" @click="pushToLine" class="w-full mt-6 bg-[#F4623A] text-white py-3.5 rounded-xl text-sm font-medium hover:bg-[#FF8560] transition-all">
      發送至 LINE 群組
    </button>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const groupId = route.params.id

const groupData = ref(null)
const balances = ref([])
const transfers = ref([])

// 🚀 頭像解析邏輯 (讀取全域暫存)
const globalAvatars = ref(JSON.parse(localStorage.getItem('splitmate_global_avatars') || '{}'))
const isImage = (str) => str && str.startsWith('data:image')
const getAvatar = (name) => globalAvatars.value[name] || name.charAt(0).toUpperCase()

const fetchGroupDetails = async () => {
  try {
    const res = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}`)
    groupData.value = await res.json()
  } catch (error) {
    console.error('無法取得群組資料', error)
  }
}

const fetchSettleData = async () => {
  try {
    const res = await fetch(`http://192.168.94.65:3000/api/groups/${groupId}/settle`)
    const data = await res.json()
    balances.value = data.balances
    transfers.value = data.transfers
  } catch (error) {
    console.error('演算法結算失敗', error)
  }
}

const pushToLine = () => {
  alert('✅ 結算結果與 QR Code 已準備好推送至 LINE 群組！（API 建置中）')
}

const generateQR = () => {
  const QR5 = [1,1,1,1,1,1,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1,1,1]
  return QR5.map(v => `<div style="background:${v ? '#000' : 'transparent'};aspect-ratio:1;border-radius:1px"></div>`).join('')
}

onMounted(() => {
  fetchGroupDetails()
  fetchSettleData()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>