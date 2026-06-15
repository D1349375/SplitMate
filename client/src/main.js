import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 引入剛剛寫好的 router

const app = createApp(App)
app.use(router) // 使用 router
app.mount('#app')