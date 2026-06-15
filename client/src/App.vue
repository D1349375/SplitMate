<template>
  <div class="flex h-[100dvh] w-full bg-[#0E1117] text-white overflow-hidden font-sans">
    
    <aside class="hidden md:flex w-[260px] flex-col border-r border-[rgba(255,255,255,.08)] bg-[rgba(14,17,23,.95)] p-6 shrink-0">
      <div class="text-2xl font-bold text-white mb-10 px-4 tracking-tight">
        Split<span class="text-[#F4623A]">Mate</span>
      </div>
      
      <nav class="flex flex-col gap-2">
        <router-link to="/" class="sidebar-item" active-class="active">
          <span class="text-[20px]">🏠</span> 首頁總覽
        </router-link>
        <a @click="goToLastGroup" class="sidebar-item cursor-pointer" :class="{ 'active': route.path.startsWith('/group') }">
          <span class="text-[20px]">👥</span> 群組帳目
        </a>
        <router-link to="/scan" class="sidebar-item" active-class="active">
          <span class="text-[20px]">📷</span> AI 掃描
        </router-link>
        <router-link to="/subs" class="sidebar-item" active-class="active">
          <span class="text-[20px]">📅</span> 訂閱追蹤
        </router-link>
        <router-link to="/profile" class="sidebar-item" active-class="active">
          <span class="text-[20px]">👤</span> 個人名片
        </router-link>
      </nav>
    </aside>

    <main class="flex-1 overflow-y-auto relative pb-[90px] md:pb-0 scrollbar-hide">
      <div class="max-w-[800px] mx-auto w-full p-4 md:p-10">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <nav class="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[rgba(14,17,23,.95)] backdrop-blur-md border-t border-[rgba(255,255,255,.08)] flex items-center justify-around px-2 pb-2 z-50">
      
      <router-link to="/" class="bnav-item" active-class="active">
        <div class="bnav-icon">🏠</div>
        <div class="bnav-label">首頁</div>
      </router-link>
      
      <a @click="goToLastGroup" class="bnav-item cursor-pointer" :class="{ 'active': route.path.startsWith('/group') }">
        <div class="bnav-icon">👥</div>
        <div class="bnav-label">群組</div>
      </a>

      <router-link to="/scan" class="bnav-item" active-class="active">
        <div class="text-[26px] leading-none text-[#F4623A] mb-1">⊕</div>
        <div class="bnav-label">掃描</div>
      </router-link>

      <router-link to="/subs" class="bnav-item" active-class="active">
        <div class="bnav-icon">📅</div>
        <div class="bnav-label">訂閱</div>
      </router-link>

      <router-link to="/profile" class="bnav-item" active-class="active">
        <div class="bnav-icon">👤</div>
        <div class="bnav-label">名片</div>
      </router-link>

    </nav>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 點擊群組按鈕時的導航邏輯：記住上次進去的群組
const goToLastGroup = () => {
  const lastGroupId = localStorage.getItem('splitmate_last_group_id')
  if (lastGroupId) {
    router.push(`/group/${lastGroupId}`)
  } else {
    router.push('/')
  }
}
</script>

<style>
/* --- 全域通用樣式 --- */
body {
  background-color: #0E1117;
  -webkit-tap-highlight-color: transparent;
}

/* 隱藏網頁預設卷軸，但保留滑動功能 (提升手機 App 質感) */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* 頁面切換的淡入淡出動畫 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* --- 桌機側邊欄項目樣式 --- */
.sidebar-item {
  @apply flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-[#8A94A6] font-medium;
}
.sidebar-item:hover {
  @apply bg-white/5 text-[#F7F4EE];
}
.sidebar-item.active {
  @apply bg-[#F4623A]/10 text-[#F4623A];
}

/* --- 手機底部導覽列項目樣式 --- */
.bnav-item {
  @apply flex flex-col items-center gap-[3px] py-1.5 px-3 rounded-xl transition-all duration-200 flex-1;
}
.bnav-item.active {
  @apply bg-[#F4623A]/10;
}
.bnav-icon {
  @apply text-[20px] leading-none mb-1 text-white;
}
.bnav-label {
  @apply text-[9px] text-[#8A94A6] transition-colors duration-200 font-medium;
}
.bnav-item.active .bnav-label {
  @apply text-[#F4623A];
}
</style>