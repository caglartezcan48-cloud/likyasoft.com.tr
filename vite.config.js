import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/likyasoft/api': {
        target: 'http://localhost/likyasoft/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/likyasoft\/api/, '')
      },
      '/likyasoft/uploads': {
        target: 'http://localhost/likyasoft/public/uploads',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/likyasoft\/uploads/, '')
      }
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
