import './assets/main.css'
import './styles/animations.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
// 提高全局弹层层级，确保抽屉内的下拉/弹窗等能覆盖页面其它元素
app.use(ElementPlus, { zIndex: 4000 })

app.mount('#app')
