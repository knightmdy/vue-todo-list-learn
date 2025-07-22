import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// 构建分析配置
export default defineConfig({
  plugins: [
    vue(),
    // 构建分析插件
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 可选: sunburst, treemap, network
    }),
  ],
  root: '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true, // 分析模式下保留sourcemap
    minify: 'terser',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'),
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
        // 详细的代码分割策略用于分析
        manualChunks: (id) => {
          console.log('Chunk analysis:', id)
          
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }
            if (id.includes('pinia')) {
              return 'pinia'
            }
            return 'vendor'
          }
          
          if (id.includes('/src/utils/')) {
            return 'utils'
          }
          
          if (id.includes('/src/composables/')) {
            return 'composables'
          }
          
          if (id.includes('/src/components/')) {
            return 'components'
          }
          
          if (id.includes('/src/stores/')) {
            return 'stores'
          }
        },
      },
    },
    // 分析模式下的Terser配置
    terserOptions: {
      compress: {
        drop_console: false, // 分析模式保留console
        drop_debugger: true,
      },
      mangle: {
        safari10: true,
      },
    },
  },
  css: {
    devSourcemap: true, // 分析模式下保留CSS sourcemap
  },
  optimizeDeps: {
    include: ['vue', 'pinia'],
  },
})