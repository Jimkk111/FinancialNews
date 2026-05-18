import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import './styles/tiptap.css'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 初始化主题 (必须在 pinia 创建之后，app.mount 之前)
const themeStore = useThemeStore()
themeStore.init()

app.mount('#app')
