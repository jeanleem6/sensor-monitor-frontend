import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5080,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('echarts') || id.includes('zrender') || id.includes('tslib')) {
            return 'vendor-echarts'
          }
          if (id.includes('three-mesh-bvh')) return 'vendor-three'
          if (id.includes('/three/')) return 'vendor-three'
          if (id.includes('gsap')) return 'vendor-three'
          if (id.includes('@iconify')) return 'vendor-icon'
          if (
            id.includes('/vue/') ||
            id.includes('/vue-router/') ||
            id.includes('/pinia/') ||
            id.includes('@vue/')
          ) {
            return 'vendor-vue'
          }
        }
      }
    }
  }
})
