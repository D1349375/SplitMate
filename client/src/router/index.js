import { createRouter, createWebHistory } from 'vue-router'
// 稍後我們會建立這些頁面元件
import Home from '../views/Home.vue'
import Group from '../views/Group.vue'
import Scan from '../views/Scan.vue'
import Subs from '../views/Subs.vue'
import Profile from '../views/Profile.vue'
import Settle from '../views/Settle.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/group/:id', component: Group },
  { path: '/scan', component: Scan },
  { path: '/subs', component: Subs },
  { path: '/group/:id/settle', component: Settle },
  { path: '/profile', component: Profile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router