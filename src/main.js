import { createApp } from 'vue'
import 'miuix-vue/style.css'
import 'subsetted-fonts/MiSans-VF/MiSans-VF.css'
import App from './App.vue'

// 全局基础样式（body margin / font-family / box-sizing）收在 App.vue 的全局 style 块里。
createApp(App).mount('#app')
