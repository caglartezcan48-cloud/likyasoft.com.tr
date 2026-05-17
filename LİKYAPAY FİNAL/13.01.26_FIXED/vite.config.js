import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './views/frontend'),
        },
    },
    build: {
        outDir: 'dist',
        manifest: true,
        rollupOptions: {
            input: '/main.jsx',
        },
    },
    server: {
        port: 5173,
        cors: true,
        strictPort: true,
    }
})
