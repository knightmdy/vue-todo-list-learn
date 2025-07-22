/**
 * Vue Todo List 应用入口文件
 * 
 * 这个文件是整个应用的启动点，负责：
 * 1. 创建Vue应用实例
 * 2. 配置Pinia状态管理
 * 3. 挂载应用到DOM
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.css'
import './styles/components.css'

// 创建Vue应用实例
const app = createApp(App)

// 创建并使用Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 挂载应用到DOM
app.mount('#app')