import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/Vue3-TypeScript-Engineering-Practice/',  // 替换为你的实际仓库名
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
