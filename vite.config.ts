import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/vue-todo-list/' : '/',
  plugins: [vue()],
  root: '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false, // 生产环境关闭sourcemap以减小包体积
    minify: 'terser',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 静态资源分类输出
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media'
          } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts'
          }
          return `static/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        // 代码分割策略
        manualChunks: (id) => {
          // 第三方库单独打包
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }
            if (id.includes('pinia')) {
              return 'pinia'
            }
            return 'vendor'
          }
          // 工具函数单独打包
          if (id.includes('/src/utils/')) {
            return 'utils'
          }
          // 组合式函数单独打包
          if (id.includes('/src/composables/')) {
            return 'composables'
          }
        },
      },
    },
    // Terser压缩配置
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true, // 移除debugger
        pure_funcs: ['console.log'], // 移除特定函数调用
      },
      mangle: {
        safari10: true, // 兼容Safari 10
      },
    },
  },
  // CSS优化
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false, // 避免charset警告
      },
    },
  },
  // 预构建优化
  optimizeDeps: {
    include: ['vue', 'pinia'],
    exclude: [],
  },
  // 实验性功能
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `"/${filename}"` }
      } else {
        return { relative: true }
      }
    },
  },
})
