import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/vue-todo-list-learn/',  // 替换为你的实际仓库名
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
